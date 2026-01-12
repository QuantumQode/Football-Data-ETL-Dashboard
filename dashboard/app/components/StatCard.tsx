"use client";

import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
  type?: "goals" | "assists" | "default";
}

export default function StatCard({
  label,
  value,
  subtitle,
  type,
}: StatCardProps) {
  return (
    <div className={`stat-card p-6 ${type || ""}`}>
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold text-[var(--foreground)] glow-text">
        <AnimatedCounter value={value} />
      </p>
      {subtitle && (
        <p className="text-sm text-[var(--accent)] mt-2 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
