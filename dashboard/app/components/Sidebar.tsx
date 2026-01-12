"use client";

import Link from "next/link";

interface Season {
  season_id: number;
  name: string;
}

export default function Sidebar({
  seasons,
  currentSeasonId,
}: {
  seasons: Season[];
  currentSeasonId: number;
}) {
  return (
    <aside className="w-72 shrink-0 hidden lg:block">
      <div className="card p-5 sticky top-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#6366f1] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              Seasons
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {seasons.length} available
            </p>
          </div>
        </div>

        {/* Season List */}
        <nav className="space-y-2">
          {seasons.map((season, index) => {
            const isActive = season.season_id === currentSeasonId;
            return (
              <Link
                key={season.season_id}
                href={`/?season=${season.season_id}`}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isActive
                      ? "bg-white scale-110"
                      : "bg-[var(--muted)] group-hover:bg-[var(--accent)]"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-[var(--foreground)]"
                  }`}
                >
                  {season.name}
                </span>
                {isActive && (
                  <span className="ml-auto">
                    <svg
                      className="w-4 h-4 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2 px-2 text-xs text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
            Live data
          </div>
        </div>
      </div>
    </aside>
  );
}
