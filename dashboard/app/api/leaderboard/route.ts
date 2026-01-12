import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const LEAGUE_ID = 8;
const SEASON_ID = 23614; // 2024/2025 SportMonks season id

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stat = searchParams.get("stat"); // goals | assists

  const col = stat === "assists" ? "assists" : stat === "goals" ? "goals" : null;
  if (!col) {
    return NextResponse.json(
      { error: "Invalid stat. Use ?stat=goals or ?stat=assists" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      p.name,
      s.team_name,
      COALESCE(s.${col}, 0) AS total,
      l.name AS league_name,
      se.name AS season_name
    FROM player_season_stats s
    JOIN players p ON p.player_id = s.player_id
    LEFT JOIN leagues l ON l.league_id = s.league_id
    LEFT JOIN seasons se ON se.season_id = s.season_id
    WHERE s.league_id = $1 AND s.season_id = $2
    ORDER BY total DESC, p.name ASC
    LIMIT 10;
  `;

  const result = await pool.query(sql, [LEAGUE_ID, SEASON_ID]);

  return NextResponse.json({
    league_id: LEAGUE_ID,
    season_id: SEASON_ID,
    stat: col,
    rows: result.rows,
  });
}
