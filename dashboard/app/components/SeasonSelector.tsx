"use client";

import { useRouter } from "next/navigation";

interface Season {
  season_id: number;
  name: string;
  hasData?: boolean;
}

export default function SeasonSelector({
  seasons,
  currentSeasonId,
}: {
  seasons: Season[];
  currentSeasonId: number;
}) {
  const router = useRouter();
  const seasonsWithData = seasons.filter((s) => s.hasData).length;

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const seasonId = e.target.value;
    router.push(`/dashboard?season=${seasonId}`);
  };

  return (
    <div className="card p-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* League Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Premier League"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Premier League
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {seasonsWithData} seasons with data
            </p>
          </div>
        </div>

        {/* Season Dropdown */}
        <div className="flex-1 sm:max-w-xs sm:ml-auto">
          <label className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1.5 block">
            Select Season
          </label>
          <select
            value={currentSeasonId}
            onChange={handleSeasonChange}
            className="season-dropdown w-full"
          >
            {seasons.map((season) => (
              <option
                key={season.season_id}
                value={season.season_id}
                disabled={!season.hasData}
              >
                {season.name} {!season.hasData ? "(No data)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Data Status */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
          Live data
        </div>
      </div>
    </div>
  );
}
