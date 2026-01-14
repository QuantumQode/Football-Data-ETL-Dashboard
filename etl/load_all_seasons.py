"""
Load goals and assists data from raw JSON files into the database.

Supports files with naming convention: epl_<season_id>_<goals|assists>_<batch>.json
Example: epl_23614_goals_001.json
"""

import os
import re
import json
import glob
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

RAW_DIR = os.path.join(HERE, "raw")
LEAGUE_ID = 8  # Premier League


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )


def season_start_year(conn, season_id: int) -> int:
    """Get the starting year for a season from the database."""
    with conn.cursor() as cur:
        cur.execute("SELECT starting_at FROM seasons WHERE season_id=%s", (season_id,))
        row = cur.fetchone()
    if not row or not row[0]:
        raise ValueError(f"Missing seasons.starting_at for season_id={season_id}. Run upsert_epl_seasons_from_2000.py first.")
    return int(str(row[0])[:4])


def get_latest_batch() -> str:
    """
    Find the latest batch number from existing files.
    Supports both formats:
      - 3-digit batch: epl_23614_goals_001.json
      - Timestamp batch: epl_23614_goals_20260112_121332.json
    """
    files = glob.glob(os.path.join(RAW_DIR, "epl_*_goals_*.json")) + \
            glob.glob(os.path.join(RAW_DIR, "epl_*_assists_*.json"))
    
    if not files:
        raise FileNotFoundError(f"No raw files found in {RAW_DIR}")
    
    # Find the newest file by modification time
    newest = max(files, key=os.path.getmtime)
    filename = os.path.basename(newest)
    
    # Try to extract batch (either 3-digit or timestamp)
    # Pattern: epl_<season_id>_<type>_<batch>.json
    parts = filename.replace(".json", "").split("_")
    
    if len(parts) >= 4:
        # Could be "001" or "20260112_121332"
        if len(parts) == 4:
            return parts[3]  # 3-digit batch like "001"
        elif len(parts) == 5:
            return f"{parts[3]}_{parts[4]}"  # Timestamp like "20260112_121332"
    
    raise ValueError(f"Could not extract batch from filename: {filename}")


def list_batch_files(batch: str) -> list[str]:
    """List all files matching the given batch."""
    pattern = os.path.join(RAW_DIR, f"epl_*_*_{batch}.json")
    return sorted(glob.glob(pattern))


def parse_filename(path: str) -> tuple[int, str]:
    """
    Parse filename and return (season_id, stat_type).
    Supports both naming conventions.
    """
    name = os.path.basename(path)
    
    # Try 3-digit batch format: epl_23614_goals_001.json
    m = re.match(r"^epl_(\d+)_(goals|assists)_(\d{3})\.json$", name)
    if m:
        return int(m.group(1)), m.group(2)
    
    # Try timestamp format: epl_23614_goals_20260112_121332.json
    m = re.match(r"^epl_(\d+)_(goals|assists)_(\d{8}_\d{6})\.json$", name)
    if m:
        return int(m.group(1)), m.group(2)
    
    raise ValueError(f"Unexpected filename format: {name}")


def upsert_players(conn, player_rows):
    """Insert or update player records."""
    if not player_rows:
        return
    sql = """
    INSERT INTO players (player_id, name, nationality, position)
    VALUES %s
    ON CONFLICT (player_id) DO UPDATE SET
      name = EXCLUDED.name
    """
    with conn.cursor() as cur:
        execute_values(cur, sql, player_rows)


def upsert_stats(conn, stat_rows, stat: str):
    """Insert or update player season stats."""
    if not stat_rows:
        return
        
    if stat not in ("goals", "assists"):
        raise ValueError("stat must be 'goals' or 'assists'")

    if stat == "goals":
        update_set = "team_name = EXCLUDED.team_name, season_id = EXCLUDED.season_id, goals = EXCLUDED.goals"
    else:
        update_set = "team_name = EXCLUDED.team_name, season_id = EXCLUDED.season_id, assists = EXCLUDED.assists"

    sql = f"""
    INSERT INTO player_season_stats
      (player_id, league_id, season, season_id, team_name, goals, assists, minutes)
    VALUES %s
    ON CONFLICT (player_id, league_id, season) DO UPDATE SET
      {update_set}
    """
    with conn.cursor() as cur:
        execute_values(cur, sql, stat_rows)


def load_one_file(conn, path: str) -> tuple[int, str, int, int]:
    """Load a single JSON file into the database."""
    season_id, stat = parse_filename(path)
    season_year = season_start_year(conn, season_id)

    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    data = payload.get("data", [])
    if not isinstance(data, list):
        raise ValueError(f"{os.path.basename(path)}: payload['data'] is not a list")

    players = []
    stats = []

    for r in data:
        player_id = r.get("player_id")
        if not player_id:
            continue

        player_obj = r.get("player") or {}
        team_obj = r.get("participant") or {}

        player_name = player_obj.get("name") or f"player_{player_id}"
        team_name = team_obj.get("name")
        total = int(r.get("total") or 0)

        players.append((player_id, player_name, None, None))

        if stat == "goals":
            stats.append((player_id, LEAGUE_ID, season_year, season_id, team_name, total, 0, 0))
        else:
            stats.append((player_id, LEAGUE_ID, season_year, season_id, team_name, 0, total, 0))

    # Dedupe players by id
    dedup = {p[0]: p for p in players}
    players = list(dedup.values())

    upsert_players(conn, players)
    upsert_stats(conn, stats, stat)

    return season_id, stat, len(players), len(stats)


def main():
    print(f"\n{'='*60}")
    print("  LOAD ALL SEASONS FROM RAW FILES")
    print(f"{'='*60}\n")

    # Find latest batch
    try:
        batch = get_latest_batch()
    except FileNotFoundError as e:
        print(f"❌ {e}")
        return

    files = list_batch_files(batch)
    
    print(f"Batch: {batch}")
    print(f"Files found: {len(files)}")
    print()

    if not files:
        print("❌ No files to load.")
        return

    conn = get_conn()
    try:
        loaded = 0
        errors = 0
        total_players = 0
        total_rows = 0

        for path in files:
            filename = os.path.basename(path)
            try:
                season_id, stat, p_count, s_count = load_one_file(conn, path)
                conn.commit()
                loaded += 1
                total_players += p_count
                total_rows += s_count
                print(f"✅ {filename} | season={season_id} {stat}={s_count}")
            except Exception as e:
                errors += 1
                print(f"❌ {filename} | Error: {e}")
                conn.rollback()

        print(f"\n{'='*60}")
        print("  SUMMARY")
        print(f"{'='*60}")
        print(f"  Files loaded: {loaded}/{len(files)}")
        print(f"  Errors: {errors}")
        print(f"  Total player records: {total_players}")
        print(f"  Total stat rows: {total_rows}")
        print(f"{'='*60}\n")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
