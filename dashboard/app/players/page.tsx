import Link from "next/link";

// Placeholder player data
const FEATURED_PLAYERS = [
  { id: 1, name: "Erling Haaland", team: "Manchester City", position: "Forward", goals: 18, assists: 5, nationality: "🇳🇴" },
  { id: 2, name: "Mohamed Salah", team: "Liverpool", position: "Forward", goals: 15, assists: 12, nationality: "🇪🇬" },
  { id: 3, name: "Cole Palmer", team: "Chelsea", position: "Midfielder", goals: 14, assists: 8, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 4, name: "Alexander Isak", team: "Newcastle", position: "Forward", goals: 13, assists: 4, nationality: "🇸🇪" },
  { id: 5, name: "Bukayo Saka", team: "Arsenal", position: "Forward", goals: 11, assists: 10, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 6, name: "Bryan Mbeumo", team: "Brentford", position: "Forward", goals: 12, assists: 6, nationality: "🇨🇲" },
];

const TOP_ASSISTERS = [
  { id: 1, name: "Mohamed Salah", team: "Liverpool", assists: 12, goals: 15, nationality: "🇪🇬" },
  { id: 2, name: "Bukayo Saka", team: "Arsenal", assists: 10, goals: 11, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 3, name: "Cole Palmer", team: "Chelsea", assists: 8, goals: 14, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 4, name: "Kevin De Bruyne", team: "Manchester City", assists: 8, goals: 3, nationality: "🇧🇪" },
  { id: 5, name: "Bruno Fernandes", team: "Manchester United", assists: 7, goals: 6, nationality: "🇵🇹" },
  { id: 6, name: "Ollie Watkins", team: "Aston Villa", assists: 7, goals: 9, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
];

const POSITIONS = [
  { name: "Goalkeepers", count: 40, icon: "🧤" },
  { name: "Defenders", count: 120, icon: "🛡️" },
  { name: "Midfielders", count: 140, icon: "⚡" },
  { name: "Forwards", count: 80, icon: "⚽" },
];

export default function PlayersPage() {
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
              <span className="text-[var(--foreground)]">Players</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
              Player Database
            </h1>
            <p className="text-[var(--muted)]">
              Search and explore all Premier League players
            </p>
          </header>

          {/* Search Bar (Placeholder) */}
          <div className="card p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search players by name, team, or nationality..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  disabled
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="season-dropdown"
                  disabled
                >
                  <option>All Positions</option>
                </select>
                <select
                  className="season-dropdown"
                  disabled
                >
                  <option>All Teams</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] mt-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Search functionality coming soon
            </p>
          </div>

          {/* Position Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {POSITIONS.map((pos) => (
              <div key={pos.name} className="stat-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{pos.icon}</span>
                  <p className="text-sm text-[var(--muted)]">{pos.name}</p>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)]">{pos.count}</p>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Top Scorers */}
            <div>
              <h2 className="section-title text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--orange)]" />
                Top Goal Scorers
              </h2>
              <div className="card divide-y divide-[var(--card-border)]">
                {FEATURED_PLAYERS.map((player, index) => (
                  <PlayerRow key={player.id} player={player} rank={index + 1} type="goals" />
                ))}
              </div>
            </div>

            {/* Top Assisters */}
            <div>
              <h2 className="section-title text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--cyan)]" />
                Top Assist Providers
              </h2>
              <div className="card divide-y divide-[var(--card-border)]">
                {TOP_ASSISTERS.map((player, index) => (
                  <PlayerRow key={player.id} player={player} rank={index + 1} type="assists" />
                ))}
              </div>
            </div>
          </div>

          {/* Featured Player Card (Example) */}
          <div className="mb-12">
            <h2 className="section-title text-lg font-bold text-[var(--foreground)] mb-6">
              Player Profile Preview
            </h2>
            <div className="card p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Player Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--cyan)] to-[var(--accent)] flex items-center justify-center">
                    <span className="text-6xl">⚽</span>
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🇳🇴</span>
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">
                      Erling Haaland
                    </h3>
                  </div>
                  <p className="text-[var(--muted)] mb-4">
                    Manchester City • Forward • #9
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                      <p className="text-xs text-[var(--muted)] mb-1">Goals</p>
                      <p className="text-2xl font-bold text-[var(--orange)]">18</p>
                    </div>
                    <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                      <p className="text-xs text-[var(--muted)] mb-1">Assists</p>
                      <p className="text-2xl font-bold text-[var(--cyan)]">5</p>
                    </div>
                    <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                      <p className="text-xs text-[var(--muted)] mb-1">Appearances</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">22</p>
                    </div>
                    <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                      <p className="text-xs text-[var(--muted)] mb-1">Minutes</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">1,845</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Notice */}
              <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                    Coming Soon
                  </span>
                  Full player profiles with career stats, form charts, and comparison tools
                </p>
              </div>
            </div>
          </div>

          {/* Planned Features */}
          <div>
            <h2 className="section-title text-xl font-bold text-[var(--foreground)] mb-6">
              Planned Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                title="Player Search"
                description="Find any player instantly with advanced filters"
                icon="🔍"
              />
              <FeatureCard
                title="Detailed Profiles"
                description="Complete career history and season breakdowns"
                icon="📊"
              />
              <FeatureCard
                title="Compare Players"
                description="Side-by-side stat comparison with radar charts"
                icon="⚖️"
              />
              <FeatureCard
                title="Form Tracker"
                description="Recent performance trends and predictions"
                icon="📈"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  rank,
  type,
}: {
  player: {
    id: number;
    name: string;
    team: string;
    goals?: number;
    assists?: number;
    nationality: string;
  };
  rank: number;
  type: "goals" | "assists";
}) {
  const value = type === "goals" ? player.goals : player.assists;
  const colorClass = type === "goals" ? "text-[var(--orange)]" : "text-[var(--cyan)]";

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer">
      {/* Rank */}
      <div
        className={`rank-badge ${
          rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-other"
        }`}
      >
        {rank}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{player.nationality}</span>
          <span className="font-semibold text-[var(--foreground)] truncate">
            {player.name}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)]">{player.team}</p>
      </div>

      {/* Stat */}
      <div className={`text-xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="card p-5 opacity-70">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-bold text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
