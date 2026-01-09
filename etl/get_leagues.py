import os
import requests
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

TOKEN = os.getenv("SPORTMONKS_API_TOKEN")
BASE = os.getenv("SPORTMONKS_BASE_URL", "https://api.sportmonks.com/v3/football").rstrip("/")

def main():
    if not TOKEN:
        raise SystemExit("Missing SPORTMONKS_API_TOKEN in etl/.env")

    # GET all leagues available in your subscription
    # Docs: /v3/football/leagues?api_token=... :contentReference[oaicite:2]{index=2}
    url = f"{BASE}/leagues"
    params = {
        "api_token": TOKEN,
        "include": "currentSeason",  # optional but useful :contentReference[oaicite:3]{index=3}
        # "per_page": 50,  # optional (pagination varies by endpoint)
    }

    r = requests.get(url, params=params, timeout=30)
    print("Status:", r.status_code)
    r.raise_for_status()

    data = r.json()
    leagues = data.get("data", [])

    matches = [l for l in leagues if "premier" in (l.get("name", "").lower())]

    print(f"Total leagues returned: {len(leagues)}")
    print(f"Matches containing 'premier': {len(matches)}\n")

    for l in matches[:20]:
        league_id = l.get("id")
        name = l.get("name")
        country_id = l.get("country_id")
        current_season = (l.get("currentSeason") or {}).get("id")
        print(f"id={league_id} | name={name} | country_id={country_id} | currentSeason_id={current_season}")

if __name__ == "__main__":
    main()
