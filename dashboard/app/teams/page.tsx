import Link from "next/link";

// Placeholder team data
const TEAMS = [
  { id: 1, name: "Arsenal", shortName: "ARS", color: "#EF0107", players: 25, goals: 45, assists: 38 },
  { id: 2, name: "Aston Villa", shortName: "AVL", color: "#95BFE5", players: 24, goals: 38, assists: 32 },
  { id: 3, name: "Bournemouth", shortName: "BOU", color: "#DA291C", players: 23, goals: 32, assists: 28 },
  { id: 4, name: "Brentford", shortName: "BRE", color: "#E30613", players: 24, goals: 35, assists: 30 },
  { id: 5, name: "Brighton", shortName: "BHA", color: "#0057B8", players: 25, goals: 40, assists: 35 },
  { id: 6, name: "Chelsea", shortName: "CHE", color: "#034694", players: 26, goals: 42, assists: 36 },
  { id: 7, name: "Crystal Palace", shortName: "CRY", color: "#1B458F", players: 23, goals: 28, assists: 24 },
  { id: 8, name: "Everton", shortName: "EVE", color: "#003399", players: 24, goals: 26, assists: 22 },
  { id: 9, name: "Fulham", shortName: "FUL", color: "#000000", players: 24, goals: 34, assists: 29 },
  { id: 10, name: "Ipswich Town", shortName: "IPS", color: "#0044AA", players: 23, goals: 24, assists: 20 },
  { id: 11, name: "Leicester City", shortName: "LEI", color: "#003090", players: 24, goals: 30, assists: 26 },
  { id: 12, name: "Liverpool", shortName: "LIV", color: "#C8102E", players: 25, goals: 52, assists: 44 },
  { id: 13, name: "Manchester City", shortName: "MCI", color: "#6CABDD", players: 25, goals: 48, assists: 42 },
  { id: 14, name: "Manchester United", shortName: "MUN", color: "#DA291C", players: 26, goals: 36, assists: 31 },
  { id: 15, name: "Newcastle United", shortName: "NEW", color: "#241F20", players: 24, goals: 38, assists: 33 },
  { id: 16, name: "Nottingham Forest", shortName: "NFO", color: "#DD0000", players: 24, goals: 33, assists: 28 },
  { id: 17, name: "Southampton", shortName: "SOU", color: "#D71920", players: 23, goals: 22, assists: 18 },
  { id: 18, name: "Tottenham", shortName: "TOT", color: "#132257", players: 25, goals: 44, assists: 38 },
  { id: 19, name: "West Ham", shortName: "WHU", color: "#7A263A", players: 24, goals: 32, assists: 27 },
  { id: 20, name: "Wolves", shortName: "WOL", color: "#FDB913", players: 24, goals: 29, assists: 25 },
];

export default function TeamsPage() {
  const totalGoals = TEAMS.reduce((sum, t) => sum + t.goals, 0);
  const totalAssists = TEAMS.reduce((sum, t) => sum + t.assists, 0);

  return (
    <div className="min-h-screen bg-pattern">
      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-3">
              <Link href="/" className="hover:text-[var(--accent)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[var(--foreground)]">Teams</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
              Premier League Teams
            </h1>
            <p className="text-[var(--muted)]">
              All 20 clubs competing in the 2024/25 season
            </p>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="stat-card p-5">
              <p className="text-sm text-[var(--muted)] mb-1">Total Teams</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">20</p>
            </div>
            <div className="stat-card goals p-5">
              <p className="text-sm text-[var(--muted)] mb-1">Total Goals</p>
              <p className="text-3xl font-bold text-[var(--orange)]">{totalGoals}</p>
            </div>
            <div className="stat-card assists p-5">
              <p className="text-sm text-[var(--muted)] mb-1">Total Assists</p>
              <p className="text-3xl font-bold text-[var(--cyan)]">{totalAssists}</p>
            </div>
            <div className="stat-card p-5">
              <p className="text-sm text-[var(--muted)] mb-1">Avg Goals/Team</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {(totalGoals / 20).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <div className="card p-6 mb-8 border-l-4 border-l-[var(--accent)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  Team Pages Coming Soon
                </h3>
                <p className="text-[var(--muted)] text-sm">
                  Detailed team statistics, squad breakdowns, and performance analytics are being developed. 
                  Click on any team below to see a preview of what&apos;s planned.
                </p>
              </div>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAMS.map((team, index) => (
              <TeamCard key={team.id} team={team} rank={index + 1} />
            ))}
          </div>

          {/* Features Preview */}
          <div className="mt-16">
            <h2 className="section-title text-xl font-bold text-[var(--foreground)] mb-6">
              Planned Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <FeaturePreview
                title="Squad Overview"
                description="Complete roster with player stats, positions, and transfer history"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <FeaturePreview
                title="Formation Analysis"
                description="Visual formation display with heatmaps and tactical insights"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                }
              />
              <FeaturePreview
                title="Season Performance"
                description="Goals, assists, clean sheets, and points progression charts"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  team,
  rank,
}: {
  team: (typeof TEAMS)[0];
  rank: number;
}) {
  return (
    <div className="card p-5 group cursor-pointer">
      <div className="flex items-center gap-4 mb-4">
        {/* Team Color Badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: team.color }}
        >
          {team.shortName}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
            {team.name}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {team.players} players
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--orange)]" />
          <span className="text-[var(--muted)]">Goals:</span>
          <span className="font-semibold text-[var(--foreground)]">{team.goals}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--cyan)]" />
          <span className="text-[var(--muted)]">Assists:</span>
          <span className="font-semibold text-[var(--foreground)]">{team.assists}</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 pt-3 border-t border-[var(--card-border)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-[var(--accent)] flex items-center gap-1">
          View team details
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function FeaturePreview({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-6 opacity-70">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--muted)] mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)]">{description}</p>
      <span className="inline-block mt-3 text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded">
        Coming Soon
      </span>
    </div>
  );
}
