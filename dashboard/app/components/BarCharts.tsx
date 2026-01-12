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
  const maxValue = type === "goals" 
    ? Math.max(...top10.map((p) => p.goals), 1)
    : Math.max(...top10.map((p) => p.assists), 1);

  const getShortName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 1) return fullName;
    return `${parts[0][0]}. ${parts[parts.length - 1]}`;
  };

  const accentColor = type === "goals" ? "#f97316" : "#06b6d4";
  const gradientId = `gradient-${type}`;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">{title}</h3>
      
      <div className="space-y-3">
        {top10.map((player, index) => {
          const value = type === "goals" ? player.goals : player.assists;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={player.player_id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="text-xs font-bold w-5 text-center"
                    style={{ color: index < 3 ? accentColor : 'var(--muted)' }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {getShortName(player.name)}
                  </span>
                </div>
                <span 
                  className="text-sm font-bold ml-2 tabular-nums"
                  style={{ color: accentColor }}
                >
                  {value}
                </span>
              </div>
              
              <div className="relative h-8 rounded-lg overflow-hidden bg-[var(--card-border)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out group-hover:brightness-110"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${accentColor}cc, ${accentColor})`,
                    boxShadow: index < 3 ? `0 0 20px ${accentColor}40` : 'none',
                  }}
                />
                <div 
                  className="absolute inset-y-0 left-0 rounded-lg opacity-30"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-white/90 truncate drop-shadow-sm">
                    {player.team_name}
                  </span>
                </div>
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
      <BarChart data={goalScorers} type="goals" title="Top 10 Goal Scorers" />
      <BarChart data={assistProviders} type="assists" title="Top 10 Assist Providers" />
    </div>
  );
}
