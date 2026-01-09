# etl/get_seasons_for_league.py
import os
import requests
from dotenv import load_dotenv
from datetime import datetime

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

TOKEN = os.getenv("SPORTMONKS_API_TOKEN")
BASE = os.getenv("SPORTMONKS_BASE_URL", "https://api.sportmonks.com/v3/football").rstrip("/")

LEAGUE_ID = 8  # Premier League from your previous output


def parse_date(s):
    if not s:
        return None
    # SportMonks dates are usually YYYY-MM-DD or ISO8601; handle both safely
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def main():
    if not TOKEN:
        raise SystemExit("Missing SPORTMONKS_API_TOKEN in etl/.env")

    # Using includes: fetch league and include seasons
    # SportMonks includes leagues/{id}?include=seasons (docs show includes for leagues)
    url = f"{BASE}/leagues/{LEAGUE_ID}"
    params = {"api_token": TOKEN, "include": "seasons"}

    r = requests.get(url, params=params, timeout=30)
    print("Status:", r.status_code)
    r.raise_for_status()

    payload = r.json()
    league = payload.get("data", {})
    seasons = league.get("seasons") or []

    if not seasons:
        print("No seasons returned. If this happens, we’ll switch to a direct seasons endpoint.")
        return

    print(f"League: {league.get('name')} (id={league.get('id')})")
    print(f"Total seasons: {len(seasons)}\n")

    # Print seasons sorted by ending date desc (fallback to starting date)
    def sort_key(sea):
        end = parse_date(sea.get("ending_at"))
        start = parse_date(sea.get("starting_at"))
        return end or start or datetime.min

    seasons_sorted = sorted(seasons, key=sort_key, reverse=True)

    for s in seasons_sorted[:30]:
        print(
            f"id={s.get('id')} | name={s.get('name')} | "
            f"start={s.get('starting_at')} | end={s.get('ending_at')} | finished={s.get('finished')}"
        )

    # Pick latest finished season
    finished = [s for s in seasons_sorted if s.get("finished") is True]
    if finished:
        latest = finished[0]
        print("\n✅ Latest finished season:")
        print(
            f"season_id={latest.get('id')} | name={latest.get('name')} | "
            f"end={latest.get('ending_at')} | finished={latest.get('finished')}"
        )
    else:
        print("\nNo finished seasons found in the returned data.")

if __name__ == "__main__":
    main()
