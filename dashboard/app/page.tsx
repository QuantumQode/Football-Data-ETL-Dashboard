import goalScorersData from "../data/goalScorers.json";
import assistProvidersData from "../data/assistProviders.json";

interface PlayerStat {
  id: number;
  position: number;
  total: number;
  player: {
    id: number;
    name: string;
  };
  participant: {
    id: number;
    name: string;
  };
}

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

function PlayerRow({
  stat,
  type,
  maxValue,
}: {
  stat: PlayerStat;
  type: "goals" | "assists";
  maxValue: number;
}) {
  const barWidth = (stat.total / maxValue) * 100;

  const getRankClass = (position: number) => {
    if (position === 1) return "rank-1";
    if (position === 2) return "rank-2";
    if (position === 3) return "rank-3";
    return "rank-other";
  };

  const getDisplayName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 1) return fullName;
    // For long names, show first initial + last name
    if (fullName.length > 18) {
      return `${parts[0][0]}. ${parts[parts.length - 1]}`;
    }
    return fullName;
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-[var(--background)] transition-colors rounded-lg">
      <div className={`rank-badge ${getRankClass(stat.position)}`}>
        {stat.position}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--foreground)] truncate">
          {getDisplayName(stat.player.name)}
        </p>
        <p className="text-xs text-[var(--muted)] truncate">
          {stat.participant.name}
        </p>
      </div>
      <div className="w-20 flex flex-col items-end gap-1.5">
        <span
          className={`text-base font-bold ${
            type === "goals" ? "text-[var(--accent)]" : "text-[var(--success)]"
          }`}
        >
          {stat.total}
        </span>
        <div className="stat-bar w-full">
          <div
            className={`stat-bar-fill ${type}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LeaderboardSection({
  title,
  data,
  type,
}: {
  title: string;
  data: PlayerStat[];
  type: "goals" | "assists";
}) {
  const top10 = data.slice(0, 10);
  const maxValue = top10[0]?.total || 1;

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--card-border)]">
        <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
      </div>
      <div className="p-2">
        {top10.map((stat) => (
          <PlayerRow
            key={stat.id}
            stat={stat}
            type={type}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const goalScorers = goalScorersData.data as PlayerStat[];
  const assistProviders = assistProvidersData.data as PlayerStat[];

  const totalGoals = goalScorers.reduce((sum, p) => sum + p.total, 0);
  const totalAssists = assistProviders.reduce((sum, p) => sum + p.total, 0);

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
          <StatCard label="Total Goals" value={totalGoals} />
          <StatCard label="Total Assists" value={totalAssists} />
          <StatCard
            label="Top Scorer"
            value={topScorer.total}
            subtitle={topScorer.player.name.split(" ").pop()}
          />
          <StatCard
            label="Top Assists"
            value={topAssister.total}
            subtitle={topAssister.player.name.split(" ").pop()}
          />
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaderboardSection
            title="Top Scorers"
            data={goalScorers}
            type="goals"
          />
          <LeaderboardSection
            title="Top Assists"
            data={assistProviders}
            type="assists"
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[var(--muted)]">
          Data sourced from SportMonks API · Updated January 2026
        </footer>
      </div>
    </div>
  );
}
