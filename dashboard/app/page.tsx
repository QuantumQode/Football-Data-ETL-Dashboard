import Link from "next/link";
import { getSeasons, getSeasonTotals, DEFAULT_SEASON_ID } from "@/lib/db";

export default async function Home() {
  const [seasons, totals] = await Promise.all([
    getSeasons(),
    getSeasonTotals(DEFAULT_SEASON_ID),
  ]);

  const seasonsWithData = seasons.filter((s) => s.hasData).length;

  return (
    <div className="min-h-screen bg-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-[var(--cyan)]/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[var(--orange)]/10 rounded-full blur-3xl animate-pulse delay-500" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
              <span className="text-sm text-[var(--accent)] font-medium">
                Live data from {seasonsWithData} Premier League seasons
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-[var(--foreground)]">Track Every </span>
              <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--cyan)] to-[var(--accent)] bg-clip-text text-transparent">
                Goal
              </span>
              <span className="text-[var(--foreground)]"> & </span>
              <span className="bg-gradient-to-r from-[var(--orange)] via-[var(--accent)] to-[var(--orange)] bg-clip-text text-transparent">
                Assist
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Comprehensive football analytics for the Premier League. 
              Real-time stats, player performance insights, and historical data at your fingertips.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#6366f1] text-white font-semibold text-lg shadow-lg hover:shadow-[0_0_40px_var(--accent-glow)] transition-all duration-300"
              >
                View Dashboard
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/players"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-[var(--card-border)] text-[var(--foreground)] font-semibold text-lg hover:bg-white/10 hover:border-[var(--accent)]/50 transition-all duration-300"
              >
                Browse Players
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Showcase */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatShowcase
              value={seasonsWithData.toString()}
              label="Seasons Tracked"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              color="accent"
            />
            <StatShowcase
              value={totals.totalGoals.toLocaleString()}
              label="Goals (Current Season)"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="orange"
            />
            <StatShowcase
              value={totals.totalAssists.toLocaleString()}
              label="Assists (Current Season)"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="cyan"
            />
            <StatShowcase
              value="20"
              label="Teams"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              color="success"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Powerful features to analyze Premier League statistics like never before
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Real-Time Stats"
              description="Up-to-date goal and assist statistics for every player in the Premier League, refreshed regularly."
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="orange"
            />
            <FeatureCard
              title="Historical Data"
              description="Access statistics from multiple seasons dating back to 2008/09. Compare performance across eras."
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="accent"
            />
            <FeatureCard
              title="Visual Analytics"
              description="Beautiful charts and visualizations that make understanding player performance intuitive and engaging."
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* Leagues Section (Coming Soon) */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--orange)]/20 text-[var(--orange)] text-sm font-medium mb-4">
                  Coming Soon
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-4">
                  More Leagues on the Way
                </h2>
                <p className="text-[var(--muted)] mb-6 leading-relaxed">
                  We&apos;re expanding! La Liga, Serie A, Bundesliga, and Ligue 1 data 
                  will be available soon. Get the complete European football picture.
                </p>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    🇪🇸
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    🇮🇹
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    🇩🇪
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    🇫🇷
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--cyan)]/20 flex items-center justify-center">
                  <svg className="w-24 h-24 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--foreground)]">MatchMetric</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
                System Operational
              </span>
              <span>•</span>
              <span>Data from SportMonks API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatShowcase({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: "accent" | "orange" | "cyan" | "success";
}) {
  const colorClasses = {
    accent: "from-[var(--accent)] to-[#6366f1] shadow-[var(--accent-glow)]",
    orange: "from-[var(--orange)] to-[#f97316] shadow-[var(--orange-glow)]",
    cyan: "from-[var(--cyan)] to-[#06b6d4] shadow-[var(--cyan-glow)]",
    success: "from-[var(--success)] to-[#10b981] shadow-[var(--success-glow)]",
  };

  return (
    <div className="card p-6 text-center group hover:scale-105 transition-transform">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} mx-auto mb-4 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
      >
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">
        {value}
      </div>
      <div className="text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "accent" | "orange" | "cyan";
}) {
  const colorClasses = {
    accent: "text-[var(--accent)] bg-[var(--accent)]/10",
    orange: "text-[var(--orange)] bg-[var(--orange)]/10",
    cyan: "text-[var(--cyan)] bg-[var(--cyan)]/10",
  };

  return (
    <div className="card p-8 group">
      <div
        className={`w-14 h-14 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{title}</h3>
      <p className="text-[var(--muted)] leading-relaxed">{description}</p>
    </div>
  );
}
