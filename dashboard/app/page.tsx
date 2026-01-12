import {
  getTopScorers,
  getTopAssistProviders,
  getSeasonTotals,
  getSeasons,
  DEFAULT_SEASON_ID,
} from "@/lib/db";
import LeaderboardTabs from "./components/LeaderboardTabs";
import BarCharts from "./components/BarCharts";
import Sidebar from "./components/Sidebar";

function StatCard({
  label,
  value,
  subtitle,
  type,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  type?: "goals" | "assists" | "default";
}) {
  return (
    <div className={`stat-card p-6 ${type || ""}`}>
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold text-[var(--foreground)] glow-text">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-[var(--accent)] mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
}

export default async function Home({
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
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sidebar */}
          <Sidebar seasons={seasons} currentSeasonId={seasonId} />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.webp"
                    alt="Premier League"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                    Premier League
                  </h1>
                  <p className="text-[var(--accent)] font-medium">
                    {currentSeason?.name || "Season Statistics"}
                  </p>
                </div>
              </div>
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
                <span>Premier League Stats Dashboard</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
