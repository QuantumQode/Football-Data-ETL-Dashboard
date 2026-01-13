import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

export interface PlayerStat {
  player_id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
}

export const LEAGUE_ID = 8;
export const DEFAULT_SEASON_ID = 23614;

export interface Season {
  season_id: number;
  name: string;
  hasData?: boolean;
}

// Premier League seasons (SportMonks IDs)
export const PREMIER_LEAGUE_SEASONS: Season[] = [
  { season_id: 23614, name: "2024/2025" },
  { season_id: 21646, name: "2023/2024" },
  { season_id: 19734, name: "2022/2023" },
  { season_id: 18378, name: "2021/2022" },
  { season_id: 17420, name: "2020/2021" },
  { season_id: 16036, name: "2019/2020" },
  { season_id: 12962, name: "2018/2019" },
  { season_id: 6397, name: "2017/2018" },
  { season_id: 13, name: "2016/2017" },
  { season_id: 10, name: "2015/2016" },
  { season_id: 12, name: "2014/2015" },
  { season_id: 3, name: "2013/2014" },
  { season_id: 7, name: "2012/2013" },
  { season_id: 9, name: "2011/2012" },
  { season_id: 2, name: "2010/2011" },
  { season_id: 11, name: "2009/2010" },
  { season_id: 6, name: "2008/2009" },
];

export async function getSeasons(): Promise<Season[]> {
  // Get seasons that have data in the database
  const result = await pool.query<{ season_id: string }>(
    `SELECT DISTINCT s.season_id::text
    FROM player_season_stats s
    WHERE s.league_id = $1`,
    [LEAGUE_ID]
  );
  
  // Convert to numbers for comparison (DB returns strings) ,
  const seasonsWithData = new Set(result.rows.map(r => parseInt(r.season_id, 10)));
  
  // Return all seasons, marking which ones have data
  return PREMIER_LEAGUE_SEASONS.map(season => ({
    ...season,
    hasData: seasonsWithData.has(season.season_id)
  }));
}

export async function getTopScorers(seasonId: number = DEFAULT_SEASON_ID, limit = 25): Promise<PlayerStat[]> {
  const result = await pool.query<PlayerStat>(
    `SELECT 
      p.player_id,
      p.name,
      s.team_name,
      COALESCE(s.goals, 0) as goals,
      COALESCE(s.assists, 0) as assists
    FROM players p
    JOIN player_season_stats s ON p.player_id = s.player_id
    WHERE s.league_id = $1 AND s.season_id = $2 AND s.goals > 0
    ORDER BY s.goals DESC
    LIMIT $3`,
    [LEAGUE_ID, seasonId, limit]
  );
  return result.rows;
}

export async function getTopAssistProviders(seasonId: number = DEFAULT_SEASON_ID, limit = 25): Promise<PlayerStat[]> {
  const result = await pool.query<PlayerStat>(
    `SELECT 
      p.player_id,
      p.name,
      s.team_name,
      COALESCE(s.goals, 0) as goals,
      COALESCE(s.assists, 0) as assists
    FROM players p
    JOIN player_season_stats s ON p.player_id = s.player_id
    WHERE s.league_id = $1 AND s.season_id = $2 AND s.assists > 0
    ORDER BY s.assists DESC
    LIMIT $3`,
    [LEAGUE_ID, seasonId, limit]
  );
  return result.rows;
}

export async function getSeasonTotals(seasonId: number = DEFAULT_SEASON_ID): Promise<{
  totalGoals: number;
  totalAssists: number;
}> {
  const result = await pool.query<{ total_goals: string; total_assists: string }>(
    `SELECT 
      COALESCE(SUM(goals), 0) as total_goals,
      COALESCE(SUM(assists), 0) as total_assists
    FROM player_season_stats
    WHERE league_id = $1 AND season_id = $2`,
    [LEAGUE_ID, seasonId]
  );
  return {
    totalGoals: parseInt(result.rows[0]?.total_goals || "0"),
    totalAssists: parseInt(result.rows[0]?.total_assists || "0"),
  };
}

