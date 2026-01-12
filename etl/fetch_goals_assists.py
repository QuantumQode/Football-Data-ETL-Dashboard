import os
import json
import time
import requests
import psycopg2
from dotenv import load_dotenv
from datetime import datetime

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

TOKEN = os.getenv("SPORTMONKS_API_TOKEN")
BASE = os.getenv("SPORTMONKS_BASE_URL", "https://api.sportmonks.com/v3/football").rstrip("/")

LEAGUE_ID = 8  # Premier League
GOALS_TYPE_ID = 208
ASSISTS_TYPE_ID = 209

OUT_DIR = os.path.join(HERE, "raw")


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )


def ensure_token():
    if not TOKEN:
        raise SystemExit("Missing SPORTMONKS_API_TOKEN in etl/.env")


def safe_get(url: str, params: dict) -> dict:
    """GET with basic error printing (no token leak)."""
    r = requests.get(url, params=params, timeout=30)
    print(f"GET {url} -> {r.status_code}")
    if r.status_code >= 400:
        # show useful info without dumping secrets
        print("Error body (truncated):", r.text[:1500])
    r.raise_for_status()
    return r.json()


def save_json(payload: dict, filename: str) -> str:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return path


def get_all_finished_seasons_from_db() -> list[dict]:
    """
    Get all finished seasons from the database.
    Returns list of dicts with id, name, ending_at keys.
    """
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT season_id, name, ending_at
                FROM seasons
                WHERE league_id = %s AND finished = true
                ORDER BY ending_at DESC
            """, (LEAGUE_ID,))
            rows = cur.fetchall()
        return [
            {"id": r[0], "name": r[1], "ending_at": str(r[2]) if r[2] else None}
            for r in rows
        ]
    finally:
        conn.close()


def get_seasons_missing_data() -> list[dict]:
    """
    Get finished seasons that don't have any data in player_season_stats yet.
    Returns list of dicts with id, name, ending_at keys.
    """
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.season_id, s.name, s.ending_at
                FROM seasons s
                WHERE s.league_id = %s 
                  AND s.finished = true
                  AND NOT EXISTS (
                      SELECT 1 FROM player_season_stats ps 
                      WHERE ps.season_id = s.season_id AND ps.league_id = s.league_id
                  )
                ORDER BY s.ending_at DESC
            """, (LEAGUE_ID,))
            rows = cur.fetchall()
        return [
            {"id": r[0], "name": r[1], "ending_at": str(r[2]) if r[2] else None}
            for r in rows
        ]
    finally:
        conn.close()


def get_last10_finished_seasons() -> list[dict]:
    """
    Fetch league seasons from API and return last 10 finished seasons,
    sorted by ending_at descending.
    """
    url = f"{BASE}/leagues/{LEAGUE_ID}"
    params = {"api_token": TOKEN, "include": "seasons"}

    payload = safe_get(url, params)
    league = payload.get("data", {})
    seasons = league.get("seasons") or []

    finished = [s for s in seasons if s.get("finished") is True]
    finished.sort(key=lambda s: s.get("ending_at") or "", reverse=True)

    return finished[:10]


def fetch_topscorers(season_id: int, type_id: int) -> dict:
    """
    Fetch top scorers for a season for a specific top-scorer type.
    We include player + participant + type so you get names + extra info.
    """
    url = f"{BASE}/topscorers/seasons/{season_id}"
    params = {
        "api_token": TOKEN,
        # Full objects, not just names. This usually includes player/team metadata.
        # (If your plan restricts fields, it will still return at least ids/names.)
        "include": "type;player;participant",
        "filters": f"seasonTopscorerTypes:{type_id}",
    }
    return safe_get(url, params)


def extract_player_info(row: dict) -> dict:
    """
    Pull useful human-readable info from the response row.
    SportMonks player objects differ by plan/endpoint — we safely pick common fields.
    """
    player = row.get("player") or {}
    team = row.get("participant") or {}
    t = row.get("type") or {}

    # Common-ish fields (may be None depending on your plan/endpoint)
    return {
        "player_id": row.get("player_id"),
        "player_name": player.get("name"),
        "player_display_name": player.get("display_name"),
        "player_firstname": player.get("firstname"),
        "player_lastname": player.get("lastname"),
        "player_dob": player.get("date_of_birth"),
        "player_height": player.get("height"),
        "player_weight": player.get("weight"),
        "team_id": row.get("participant_id"),
        "team_name": team.get("name"),
        "type_id": row.get("type_id"),
        "type_name": t.get("name"),
        "type_code": t.get("code"),
        "total": row.get("total"),
        "position_rank": row.get("position"),
    }
 

def main():
    ensure_token()

    # Get seasons that don't have data yet
    seasons = get_seasons_missing_data()
    
    if not seasons:
        print("All seasons already have data! Nothing to fetch.")
        return

    print(f"\nFound {len(seasons)} seasons missing data:")
    for s in seasons:
        print(f"- season_id={s.get('id')} | {s.get('name')} | end={s.get('ending_at')}")

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    success_count = 0
    error_count = 0

    for i, s in enumerate(seasons, 1):
        season_id = s.get("id")
        season_name = s.get("name")

        print(f"\n=== [{i}/{len(seasons)}] Season {season_name} (season_id={season_id}) ===")

        try:
            # GOALS
            goals_payload = fetch_topscorers(season_id, GOALS_TYPE_ID)
            goals_file = save_json(goals_payload, f"epl_{season_id}_goals_{ts}.json")
            goals_rows = goals_payload.get("data", []) or []
            print(f"✅ Goals rows: {len(goals_rows)} | saved: {goals_file}")

            if goals_rows:
                top = extract_player_info(goals_rows[0])
                print("Top goals sample:", top)

            time.sleep(0.3)

            # ASSISTS
            assists_payload = fetch_topscorers(season_id, ASSISTS_TYPE_ID)
            assists_file = save_json(assists_payload, f"epl_{season_id}_assists_{ts}.json")
            assists_rows = assists_payload.get("data", []) or []
            print(f"✅ Assists rows: {len(assists_rows)} | saved: {assists_file}")

            if assists_rows:
                top = extract_player_info(assists_rows[0])
                print("Top assists sample:", top)

            success_count += 1
            time.sleep(0.3)

        except Exception as e:
            print(f"❌ Error fetching season {season_name}: {e}")
            error_count += 1
            continue

    print(f"\n🎉 Done. Fetched {success_count} seasons, {error_count} errors. Raw files saved in etl/raw/.")


if __name__ == "__main__":
    main()
