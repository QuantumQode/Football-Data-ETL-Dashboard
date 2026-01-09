import os
import json
import glob
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

RAW_DIR = os.path.join(HERE, "raw")

LEAGUE_ID = 8
SEASON_YEAR = 2024  # represents 2024/2025 season in your simplified schema


def latest_file(pattern: str) -> str:
    files = glob.glob(os.path.join(RAW_DIR, pattern))
    if not files:
        raise FileNotFoundError(f"No files found in {RAW_DIR} matching: {pattern}")
    return max(files, key=os.path.getmtime)


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )



def main():
    path = latest_file("top_assist_providers_league8_season23614_*.json")
    print("Using raw file:", path)

    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    rows = payload.get("data", [])
    if not isinstance(rows, list) or not rows:
        raise SystemExit("No data rows found in JSON (payload['data']).")
        
    # Build player rows + stats rows
    players = []
    stats = []

    for r in rows:
        player_id = r.get("player_id")
        if not player_id:
            continue

        player_name = (r.get("player") or {}).get("name") or f"player_{player_id}"
        team_name = (r.get("participant") or {}).get("name") or None
        assists = r.get("total") or 0

        # players table columns: (player_id, name, nationality, position)
        # User requested: don't include nationality -> store NULL
        players.append((player_id, player_name, None, None))

        # player_season_stats columns:
        # (player_id, league_id, season, team_name, goals, assists, minutes)
        stats.append((player_id, LEAGUE_ID, SEASON_YEAR, team_name, 0, assists, 0))

    # De-dupe players by player_id
    dedup = {}
    for p in players:
        dedup[p[0]] = p
    players = list(dedup.values())

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # Upsert players (nationality always NULL)
            execute_values(
                cur,
                """
                INSERT INTO players (player_id, name, nationality, position)
                VALUES %s
                ON CONFLICT (player_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  nationality = NULL,
                  position = players.position
                """,
                players,
            )

            # Upsert stats: update team_name + assists, keep goals/minutes as-is unless you later load them
            execute_values(
                cur,
                """
                INSERT INTO player_season_stats
                  (player_id, league_id, season, team_name, goals, assists, minutes)
                VALUES %s
                ON CONFLICT (player_id, league_id, season) DO UPDATE SET
                  team_name = EXCLUDED.team_name,
                  assists = EXCLUDED.assists
                """,
                stats,
            )

        conn.commit()
        print(f"✅ Loaded {len(players)} players and {len(stats)} assist stat rows into Postgres.")

    finally:
        conn.close()

if __name__ == "__main__":
    main()