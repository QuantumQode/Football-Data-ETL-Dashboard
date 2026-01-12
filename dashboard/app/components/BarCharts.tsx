"use client";

interface PlayerStat {
  player_id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
}

function BarChart({
  data,
  type,
  title,
}: {
  data: PlayerStat[];
  type: "goals" | "assists";
  title: string;
}) {
  const top10 = data.slice(0, 10);
  const maxValue =
    type === "goals"
      ? Math.max(...top10.map((p) => p.goals), 1)
      : Math.max(...top10.map((p) => p.assists), 1);

  const getShortName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 1) return fullName;
    return `${parts[0][0]}. ${parts[parts.length - 1]}`;
  };

  const colors =
    type === "goals"
      ? { main: "#f97316", gradient: "from-orange-500 to-amber-400", glow: "rgba(249, 115, 22, 0.3)" }
      : { main: "#22d3ee", gradient: "from-cyan-400 to-teal-400", glow: "rgba(34, 211, 238, 0.3)" };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}
          style={{ boxShadow: `0 4px 20px ${colors.glow}` }}
        >
          {type === "goals" ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
          <p className="text-xs text-[var(--muted)]">Top 10 players</p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {top10.map((player, index) => {
          const value = type === "goals" ? player.goals : player.assists;
          const percentage = (value / maxValue) * 100;

          return (
            <div
              key={player.player_id}
              className="group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`rank-badge ${
                      index === 0
                        ? "rank-1"
                        : index === 1
                        ? "rank-2"
                        : index === 2
                        ? "rank-3"
                        : "rank-other"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[var(--foreground)] truncate block">
                      {getShortName(player.name)}
                    </span>
                    <span className="text-xs text-[var(--muted)] truncate block">
                      {player.team_name}
                    </span>
                  </div>
                </div>
                <span
                  className="text-lg font-bold tabular-nums ml-3"
                  style={{ color: colors.main }}
                >
                  {value}
                </span>
              </div>

              <div className="relative h-3 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${colors.main}99, ${colors.main})`,
                    boxShadow: index < 3 ? `0 0 20px ${colors.glow}` : "none",
                  }}
                />
                {/* Shine effect */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-40"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BarCharts({
  goalScorers,
  assistProviders,
}: {
  goalScorers: PlayerStat[];
  assistProviders: PlayerStat[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BarChart data={goalScorers} type="goals" title="Goal Scorers" />
      <BarChart data={assistProviders} type="assists" title="Assist Providers" />
    </div>
  );
}
