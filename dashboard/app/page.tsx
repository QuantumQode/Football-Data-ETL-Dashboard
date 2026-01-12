import { getTopScorers, getTopAssistProviders, getSeasonTotals } from "@/lib/db";
import LeaderboardTabs from "./components/LeaderboardTabs";
import BarCharts from "./components/BarCharts";

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="card p-6">
      <p className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
      {subtitle && (
        <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default async function Home() {
  const [goalScorers, assistProviders, totals] = await Promise.all([
    getTopScorers(25),
    getTopAssistProviders(25),
    getSeasonTotals(),
  ]);

  const topScorer = goalScorers[0];
  const topAssister = assistProviders[0];

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[var(--accent)] rounded-full" />
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Premier League
            </h1>
          </div>
          <p className="text-[var(--muted)] ml-4">
            2025/26 Season Statistics
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Goals" value={totals.totalGoals} />
          <StatCard label="Total Assists" value={totals.totalAssists} />
          <StatCard
            label="Top Scorer"
            value={topScorer?.goals ?? 0}
            subtitle={topScorer?.name.split(" ").pop()}
          />
          <StatCard
            label="Top Assists"
            value={topAssister?.assists ?? 0}
            subtitle={topAssister?.name.split(" ").pop()}
          />
        </div>

        {/* Bar Charts */}
        <div className="mb-10">
          <BarCharts
            goalScorers={goalScorers}
            assistProviders={assistProviders}
          />
        </div>

        {/* Leaderboard with Dropdowns */}
        <div className="max-w-2xl mx-auto">
          <LeaderboardTabs
            goalScorers={goalScorers}
            assistProviders={assistProviders}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[var(--muted)]">
          Data sourced from PostgreSQL · Live from database
        </footer>
      </div>
    </div>
  );
}
