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
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-[var(--background)] transition-colors rounded-lg">
      <div className={`rank-badge ${getRankClass(position)}`}>{position}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--foreground)] truncate">
          {getDisplayName(stat.name)}
        </p>
        <p className="text-xs text-[var(--muted)] truncate">{stat.team_name}</p>
      </div>
      <div className="w-20 flex flex-col items-end gap-1.5">
        <span
          className={`text-base font-bold ${
            type === "goals" ? "text-[var(--accent)]" : "text-[var(--success)]"
          }`}
        >
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
  const [activeTab, setActiveTab] = useState<"goals" | "assists">("goals");

  const data = activeTab === "goals" ? goalScorers : assistProviders;
  const top10 = data.slice(0, 10);
  const maxValue =
    activeTab === "goals" ? top10[0]?.goals || 1 : top10[0]?.assists || 1;

  return (
    <div className="card overflow-hidden">
      {/* Tab Buttons */}
      <div className="flex border-b border-[var(--card-border)]">
        <button
          onClick={() => setActiveTab("goals")}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
            activeTab === "goals"
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Top Scorers
          {activeTab === "goals" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("assists")}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
            activeTab === "assists"
              ? "text-[var(--success)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Top Assists
          {activeTab === "assists" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--success)]" />
          )}
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className="p-2">
        {top10.map((stat, index) => (
          <PlayerRow
            key={stat.player_id}
            stat={stat}
            position={index + 1}
            type={activeTab}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  );
}
