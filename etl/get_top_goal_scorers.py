import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

TOKEN = os.getenv("SPORTMONKS_API_TOKEN")
BASE = os.getenv("SPORTMONKS_BASE_URL", "https://api.sportmonks.com/v3/football").rstrip("/")

LEAGUE_ID = 8
SEASON_ID = 23614  # Premier League 2024/2025 (latest finished)

OUT_DIR = os.path.join(HERE, "raw")


def save_json(payload, filename):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return path


def main():
    if not TOKEN:
        raise SystemExit("Missing SPORTMONKS_API_TOKEN in etl/.env")

    url = f"{BASE}/topscorers/seasons/{SEASON_ID}"

    # Goals = type_id 208 via seasonTopscorerTypes filter :contentReference[oaicite:1]{index=1}
    params = {
        "api_token": TOKEN,
        "include": "type;player:name;participant:name",  # names (no images/logos)
        "filters": "seasonTopscorerTypes:208",
    }

    r = requests.get(url, params=params, timeout=30)
    print("Status:", r.status_code)
    if r.status_code >= 400:
        print("Error body:", r.text[:1500])
    r.raise_for_status()

    payload = r.json()

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    out_path = save_json(payload, f"top_goal_scorers_league{LEAGUE_ID}_season{SEASON_ID}_{ts}.json")
    print("✅ Saved raw JSON to:", out_path)

    data = payload.get("data", [])
    print("Rows:", len(data))

    # Pretty-print a quick leaderboard
    print("\nTop goal scorers (name — team — goals):")
    for row in data[:25]:
        player_name = (row.get("player") or {}).get("name") or f"player_id={row.get('player_id')}"
        team_name = (row.get("participant") or {}).get("name") or f"participant_id={row.get('participant_id')}"
        goals = row.get("total")
        print(f"- {player_name} — {team_name} — {goals}")

    # sanity: show which type we actually got
    if data:
        t = data[0].get("type") or {}
        print("\nType returned:", {"id": t.get("id"), "name": t.get("name"), "code": t.get("code")})


if __name__ == "__main__":
    main()
