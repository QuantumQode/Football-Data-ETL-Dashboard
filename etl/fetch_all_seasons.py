"""
Fetch goals and assists data for ALL finished seasons from the database.

Output files: epl_<season_id>_<goals|assists>_<batch>.json
Example: epl_23614_goals_001.json, epl_23614_assists_001.json
"""

import os
import json
import time
import glob
import requests
import psycopg2
from dotenv import load_dotenv

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


def get_next_batch_number() -> str:
    """
    Find the highest batch number in existing files and return the next one.
    Returns a 3-digit zero-padded string (e.g., '001', '002').
    """
    os.makedirs(OUT_DIR, exist_ok=True)
    existing = glob.glob(os.path.join(OUT_DIR, "epl_*_*_*.json"))
    
    max_batch = 0
    for filepath in existing:
        filename = os.path.basename(filepath)
        # Parse: epl_<season_id>_<type>_<batch>.json
        parts = filename.replace(".json", "").split("_")
        if len(parts) >= 4:
            try:
                batch = int(parts[-1])
                max_batch = max(max_batch, batch)
            except ValueError:
                continue
    
    return f"{max_batch + 1:03d}"


def safe_get(url: str, params: dict) -> dict:
    """GET with basic error printing (no token leak)."""
    r = requests.get(url, params=params, timeout=30)
    print(f"  GET {url} -> {r.status_code}")
    if r.status_code >= 400:
        print("  Error body (truncated):", r.text[:500])
    r.raise_for_status()
    return r.json()


def save_json(payload: dict, filename: str) -> str:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return path


def get_all_finished_seasons() -> list[dict]:
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


def fetch_topscorers(season_id: int, type_id: int) -> dict:
    """
    Fetch top scorers for a season for a specific top-scorer type.
    """
    url = f"{BASE}/topscorers/seasons/{season_id}"
    params = {
        "api_token": TOKEN,
        "include": "type;player;participant",
        "filters": f"seasonTopscorerTypes:{type_id}",
    }
    return safe_get(url, params)


def main():
    ensure_token()

    # Get all finished seasons from database
    seasons = get_all_finished_seasons()
    
    if not seasons:
        print("No finished seasons found in database.")
        print("Run upsert_epl_seasons_from_2000.py first.")
        return

    # Get next batch number
    batch = get_next_batch_number()
    
    print(f"\n{'='*60}")
    print(f"  FETCH ALL SEASONS - Batch {batch}")
    print(f"{'='*60}")
    print(f"\nFound {len(seasons)} finished seasons in database.")
    print(f"Output format: epl_<season_id>_<goals|assists>_{batch}.json\n")

    for s in seasons:
        print(f"  • {s['name']} (id={s['id']})")

    print(f"\n{'='*60}\n")

    success_count = 0
    error_count = 0
    total_goals_rows = 0
    total_assists_rows = 0

    for i, s in enumerate(seasons, 1):
        season_id = s["id"]
        season_name = s["name"]

        print(f"[{i:02d}/{len(seasons)}] {season_name} (season_id={season_id})")

        try:
            # GOALS
            goals_payload = fetch_topscorers(season_id, GOALS_TYPE_ID)
            goals_filename = f"epl_{season_id}_goals_{batch}.json"
            goals_path = save_json(goals_payload, goals_filename)
            goals_rows = len(goals_payload.get("data", []) or [])
            total_goals_rows += goals_rows
            print(f"  ✅ Goals: {goals_rows} rows -> {goals_filename}")

            time.sleep(0.3)

            # ASSISTS
            assists_payload = fetch_topscorers(season_id, ASSISTS_TYPE_ID)
            assists_filename = f"epl_{season_id}_assists_{batch}.json"
            assists_path = save_json(assists_payload, assists_filename)
            assists_rows = len(assists_payload.get("data", []) or [])
            total_assists_rows += assists_rows
            print(f"  ✅ Assists: {assists_rows} rows -> {assists_filename}")

            success_count += 1
            time.sleep(0.3)

        except Exception as e:
            print(f"  ❌ Error: {e}")
            error_count += 1
            continue

        print()

    # Summary
    print(f"{'='*60}")
    print(f"  SUMMARY - Batch {batch}")
    print(f"{'='*60}")
    print(f"  Seasons fetched: {success_count}/{len(seasons)}")
    print(f"  Errors: {error_count}")
    print(f"  Total goals rows: {total_goals_rows}")
    print(f"  Total assists rows: {total_assists_rows}")
    print(f"  Files saved to: {OUT_DIR}/")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
