"use client";

import { useState } from "react";

interface PlayerStat {
  player_id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
}

function PlayerRow({
  stat,
  position,
  type,
  maxValue,
}: {
  stat: PlayerStat;
  position: number;
  type: "goals" | "assists";
  maxValue: number;
}) {
  const value = type === "goals" ? stat.goals : stat.assists;
  const barWidth = (value / maxValue) * 100;
  const color = type === "goals" ? "#f97316" : "#22d3ee";

  const getRankClass = (pos: number) => {
    if (pos === 1) return "rank-1";
    if (pos === 2) return "rank-2";
    if (pos === 3) return "rank-3";
    return "rank-other";
  };

  const getDisplayName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 1) return fullName;
    if (fullName.length > 18) {
      return `${parts[0][0]}. ${parts[parts.length - 1]}`;
    }
    return fullName;
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(255,255,255,0.03)] transition-all rounded-xl group">
      <div className={`rank-badge ${getRankClass(position)}`}>{position}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
          {getDisplayName(stat.name)}
        </p>
        <p className="text-xs text-[var(--muted)] truncate">{stat.team_name}</p>
      </div>
      <div className="w-24 flex flex-col items-end gap-2">
        <span className="text-base font-bold tabular-nums" style={{ color }}>
          {value}
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

export default function LeaderboardTabs({
  goalScorers,
  assistProviders,
}: {
  goalScorers: PlayerStat[];
  assistProviders: PlayerStat[];
}) {
  const [statType, setStatType] = useState<"goals" | "assists">("goals");
  const [limit, setLimit] = useState<number>(10);

  const data = statType === "goals" ? goalScorers : assistProviders;
  const limitedData = data.slice(0, limit);
  const maxValue =
    statType === "goals"
      ? limitedData[0]?.goals || 1
      : limitedData[0]?.assists || 1;

  return (
    <div className="card overflow-hidden">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-5 border-b border-[var(--card-border)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[var(--muted)]">
            Stat Type
          </label>
          <select
            value={statType}
            onChange={(e) => setStatType(e.target.value as "goals" | "assists")}
            className="dropdown"
          >
            <option value="goals">⚽ Goals</option>
            <option value="assists">🎯 Assists</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[var(--muted)]">
            Show
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="dropdown"
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-[var(--muted)]">
          {limitedData.length} players
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-3">
        {limitedData.map((stat, index) => (
          <PlayerRow
            key={stat.player_id}
            stat={stat}
            position={index + 1}
            type={statType}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  );
}
