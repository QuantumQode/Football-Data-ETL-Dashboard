import {
  getTopScorers,
  getTopAssistProviders,
  getSeasonTotals,
  getSeasons,
  DEFAULT_SEASON_ID,
} from "@/lib/db";
import LeaderboardTabs from "../components/LeaderboardTabs";
import BarCharts from "../components/BarCharts";
import SeasonSelector from "../components/SeasonSelector";
import StatCard from "../components/StatCard";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const params = await searchParams;
  const seasonId = params.season ? parseInt(params.season) : DEFAULT_SEASON_ID;

  const [goalScorers, assistProviders, totals, seasons] = await Promise.all([
    getTopScorers(seasonId, 25),
    getTopAssistProviders(seasonId, 25),
    getSeasonTotals(seasonId),
    getSeasons(),
  ]);

  const topScorer = goalScorers[0];
  const topAssister = assistProviders[0];
  const currentSeason = seasons.find((s) => s.season_id === seasonId);

  return (
    <div className="min-h-screen bg-pattern">
      <div className="p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Season Selector */}
          <SeasonSelector seasons={seasons} currentSeasonId={seasonId} />

          {/* Main Content */}
          <main>
            {/* Header */}
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
                Season Statistics
              </h1>
              <p className="text-[var(--muted)]">
                {currentSeason?.name || "Select a season"} • Goals, assists, and player performance
              </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <StatCard
                label="Total Goals"
                value={totals.totalGoals}
                type="goals"
              />
              <StatCard
                label="Total Assists"
                value={totals.totalAssists}
                type="assists"
              />
              <StatCard
                label="Top Scorer"
                value={topScorer?.goals ?? 0}
                subtitle={topScorer?.name}
                type="goals"
              />
              <StatCard
                label="Most Assists"
                value={topAssister?.assists ?? 0}
                subtitle={topAssister?.name}
                type="assists"
              />
            </div>

            {/* Bar Charts */}
            <div className="mb-12">
              <h2 className="section-title text-lg font-bold text-[var(--foreground)] mb-6">
                Top Performers
              </h2>
              <BarCharts
                goalScorers={goalScorers}
                assistProviders={assistProviders}
              />
            </div>

            {/* Leaderboard with Dropdowns */}
            <div className="max-w-2xl">
              <h2 className="section-title text-lg font-bold text-[var(--foreground)] mb-6">
                Full Leaderboard
              </h2>
              <LeaderboardTabs
                goalScorers={goalScorers}
                assistProviders={assistProviders}
              />
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
                  Connected to PostgreSQL
                </div>
                <span>MatchMetric Stats Dashboard</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
