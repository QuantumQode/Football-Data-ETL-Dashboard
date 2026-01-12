"use client";

import Link from "next/link";

interface Season {
  season_id: number;
  name: string;
  hasData?: boolean;
}

export default function Sidebar({
  seasons,
  currentSeasonId,
}: {
  seasons: Season[];
  currentSeasonId: number;
}) {
  const seasonsWithData = seasons.filter(s => s.hasData).length;
  
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="card sticky top-6 flex flex-col max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-4 border-b border-[var(--card-border)]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#6366f1] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
            <p className="text-[10px] text-[var(--muted)]">
              {seasonsWithData} of {seasons.length} with data
            </p>
          </div>
        </div>

        {/* Scrollable Season List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {seasons.map((season, index) => {
            const isActive = season.season_id === currentSeasonId;
            const hasData = season.hasData;
            
            return (
              <Link
                key={season.season_id}
                href={`/?season=${season.season_id}`}
                className={`sidebar-link ${isActive ? "active" : ""} ${!hasData ? "opacity-50" : ""}`}
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive
                      ? "bg-white scale-110"
                      : hasData
                      ? "bg-[var(--success)]"
                      : "bg-[var(--muted)]"
                  }`}
                />
                <span
                  className={`text-sm font-medium flex-1 ${
                    isActive ? "text-white" : "text-[var(--foreground)]"
                  }`}
                >
                  {season.name}
                </span>
                {!hasData && !isActive && (
                  <span className="text-[9px] text-[var(--muted)] uppercase tracking-wide">
                    No data
                  </span>
                )}
                {isActive && (
                  <svg
                    className="w-3.5 h-3.5 text-white/80"
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
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 pt-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
            Live data
          </div>
        </div>
      </div>
    </aside>
  );
}
