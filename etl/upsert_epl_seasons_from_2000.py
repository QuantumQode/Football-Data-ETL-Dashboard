import os
import re
import requests
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

TOKEN = os.getenv("SPORTMONKS_API_TOKEN")
BASE = os.getenv("SPORTMONKS_BASE_URL", "https://api.sportmonks.com/v3/football").rstrip("/")

LEAGUE_ID = 8  # Premier League
MIN_START_YEAR = 2000  # from 2000/2001 onward


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
    )


def parse_start_year(season_name: str):
    """
    SportMonks season name looks like "2024/2025" or "2000/2001".
    Return the first year as int.
    """
    if not season_name:
        return None
    m = re.match(r"^(\d{4})/", season_name)
    if not m:
        return None
    return int(m.group(1))


def main():
    if not TOKEN:
        raise SystemExit("Missing SPORTMONKS_API_TOKEN in etl/.env")

    # Fetch league with seasons included
    url = f"{BASE}/leagues/{LEAGUE_ID}"
    params = {"api_token": TOKEN, "include": "seasons"}

    r = requests.get(url, params=params, timeout=30)
    print("Status:", r.status_code)
    if r.status_code >= 400:
        print("Error body:", r.text[:1500])
    r.raise_for_status()

    league = r.json().get("data", {})
    league_name = league.get("name") or "Premier League"
    seasons = league.get("seasons") or []

    # Filter seasons by start year from name (fallback), or by starting_at year if present
    filtered = []
    for s in seasons:
        name = s.get("name") or ""
        start_year = parse_start_year(name)
        if start_year is None:
            # fallback to starting_at if name format differs
            starting_at = s.get("starting_at")
            if starting_at and len(starting_at) >= 4 and starting_at[:4].isdigit():
                start_year = int(starting_at[:4])

        if start_year is not None and start_year >= MIN_START_YEAR:
            filtered.append(s)

    # Sort by ending_at desc for nicer logs
    filtered.sort(key=lambda s: s.get("ending_at") or "", reverse=True)

    season_rows = []
    for s in filtered:
        season_rows.append(
            (
                s.get("id"),
                LEAGUE_ID,
                s.get("name"),
                s.get("starting_at"),  # 'YYYY-MM-DD' or None
                s.get("ending_at"),
                bool(s.get("finished")) if s.get("finished") is not None else None,
            )
        )

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # Upsert league
            cur.execute(
                """
                INSERT INTO leagues (league_id, name)
                VALUES (%s, %s)
                ON CONFLICT (league_id) DO UPDATE SET name = EXCLUDED.name
                """,
                (LEAGUE_ID, league_name),
            )

            # Upsert seasons
            execute_values(
                cur,
                """
                INSERT INTO seasons (season_id, league_id, name, starting_at, ending_at, finished)
                VALUES %s
                ON CONFLICT (season_id) DO UPDATE SET
                  league_id  = EXCLUDED.league_id,
                  name      = EXCLUDED.name,
                  starting_at = EXCLUDED.starting_at,
                  ending_at   = EXCLUDED.ending_at,
                  finished    = EXCLUDED.finished
                """,
                season_rows,
            )

        conn.commit()
        print(f"✅ Upserted {len(season_rows)} EPL seasons from {MIN_START_YEAR}/{MIN_START_YEAR+1} onward.")
        if season_rows:
            print("Most recent:", season_rows[0])
            print("Oldest in range:", season_rows[-1])
    finally:
        conn.close()


if __name__ == "__main__":
    main()
