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
    with conn.cursor() as cur:
        cur.execute("SELECT starting_at FROM seasons WHERE season_id=%s", (season_id,))
        row = cur.fetchone()
    if not row or not row[0]:
        raise ValueError(f"Missing seasons.starting_at for season_id={season_id}. Run your seasons upsert first.")
    return int(str(row[0])[:4])


def newest_batch_timestamp() -> str:
    """
    Your extractor filenames look like:
      epl_<season_id>_goals_<ts>.json
      epl_<season_id>_assists_<ts>.json
    We'll pick the most recent <ts> by file mtime.
    """
    files = glob.glob(os.path.join(RAW_DIR, "epl_*_goals_*.json")) + glob.glob(os.path.join(RAW_DIR, "epl_*_assists_*.json"))
    if not files:
        raise FileNotFoundError(f"No matching raw files found in {RAW_DIR}")
    newest = max(files, key=os.path.getmtime)
    m = re.search(r"_(\d{8}_\d{6})\.json$", newest)
    if not m:
        raise ValueError(f"Could not extract timestamp from filename: {newest}")
    return m.group(1)


def list_batch_files(ts: str) -> list[str]:
    return sorted(glob.glob(os.path.join(RAW_DIR, f"epl_*_*_{ts}.json")))


def parse_filename(path: str):
    """
    Returns: (season_id:int, stat:str) where stat in {"goals","assists"}
    """
    name = os.path.basename(path)
    m = re.match(r"^epl_(\d+)_(goals|assists)_(\d{8}_\d{6})\.json$", name)
    if not m:
        raise ValueError(f"Unexpected filename format: {name}")
    return int(m.group(1)), m.group(2)


def upsert_players(conn, player_rows):
    # players schema: (player_id, name, nationality, position)
    # You said: don't include nationality -> keep NULL
    sql = """
    INSERT INTO players (player_id, name, nationality, position)
    VALUES %s
    ON CONFLICT (player_id) DO UPDATE SET
      name = EXCLUDED.name,
      nationality = NULL
    """
    with conn.cursor() as cur:
        execute_values(cur, sql, player_rows)


def upsert_stats(conn, stat_rows, stat: str):
    """
    stat_rows columns:
      (player_id, league_id, season, season_id, team_name, goals, assists, minutes)
    Upsert based on PK (player_id, league_id, season).
    """
    if stat not in ("goals", "assists"):
        raise ValueError("stat must be goals or assists")

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


def load_one_file(conn, path: str):
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

    # dedupe players by id
    dedup = {}
    for p in players:
        dedup[p[0]] = p
    players = list(dedup.values())

    upsert_players(conn, players)
    upsert_stats(conn, stats, stat)

    return season_id, stat, len(players), len(stats)


def main():
    ts = newest_batch_timestamp()
    files = list_batch_files(ts)

    print(f"Using batch timestamp: {ts}")
    print(f"Found {len(files)} files")

    if not files:
        raise SystemExit("No files to load.")

    conn = get_conn()
    try:
        loaded = 0
        for path in files:
            season_id, stat, p_count, s_count = load_one_file(conn, path)
            conn.commit()
            loaded += 1
            print(f"✅ Loaded {os.path.basename(path)} | season_id={season_id} stat={stat} players={p_count} rows={s_count}")

        print(f"\n🎉 Done. Loaded {loaded} files from batch {ts}.")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
