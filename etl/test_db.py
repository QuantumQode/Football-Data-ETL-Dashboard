import os
import psycopg2
from dotenv import load_dotenv

# Load env from etl/.env (relative to this file)
HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")


def main():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )

    try:
        with conn.cursor() as cur:
            # Insert 1 test player (upsert so re-running doesn't error)
            cur.execute(
                """
                INSERT INTO players (player_id, name, nationality, position)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (player_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  nationality = EXCLUDED.nationality,
                  position = EXCLUDED.position
                """,
                (999999, "Test Player", "Testland", "FW"),
            )

            # Read it back
            cur.execute("SELECT player_id, name, nationality, position FROM players WHERE player_id = %s", (999999,))
            row = cur.fetchone()

        conn.commit()
        print("✅ DB connection + insert works. Row:", row)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
