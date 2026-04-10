"use client";

import { useState } from "react";

type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
  inYear: boolean;
};

type Week = {
  contributionDays: ContributionDay[];
};

const YEARS = [2026, 2025, 2024];

const LEGEND_COLORS = ["#21262d", "#0e4429", "#006d32", "#26a641", "#39d353"];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function countToColor(count: number): string {
  if (count === 0) return "#21262d";
  if (count <= 2) return "#0e4429";
  if (count <= 5) return "#006d32";
  if (count <= 9) return "#26a641";
  return "#39d353";
}

function buildWeeks(year: number, commitsByDate: Record<string, number>): Week[] {
  const start = new Date(`${year}-01-01T12:00:00`);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const end = new Date(`${year}-12-31T12:00:00`);
  const endDay = end.getDay();
  if (endDay < 6) end.setDate(end.getDate() + (6 - endDay)); // forward to Saturday

  const weeks: Week[] = [];
  const current = new Date(start);

  while (current <= end) {
    const week: Week = { contributionDays: [] };
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split("T")[0];
      const inYear = current.getFullYear() === year;
      const count = inYear ? (commitsByDate[dateStr] ?? 0) : 0;
      week.contributionDays.push({
        date: dateStr,
        contributionCount: count,
        color: inYear ? countToColor(count) : "transparent",
        inYear,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getMonthLabels(weeks: Week[]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstInYear = week.contributionDays.find((d) => d.inYear);
    if (!firstInYear) return;
    const month = new Date(firstInYear.date + "T12:00:00").getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTH_NAMES[month], col: i });
      lastMonth = month;
    }
  });
  return labels;
}

export default function ContributionGraph({
  commitsByDate,
}: {
  commitsByDate: Record<string, number>;
}) {
  const [selectedYear, setSelectedYear] = useState(2025);

  const weeks = buildWeeks(selectedYear, commitsByDate);
  const total = weeks
    .flatMap((w) => w.contributionDays)
    .filter((d) => d.inYear)
    .reduce((sum, d) => sum + d.contributionCount, 0);
  const monthLabels = getMonthLabels(weeks);

  return (
    <div className="w-full font-mono">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-zinc-300">
          {total.toLocaleString()} commits in {selectedYear}
        </p>
        <div className="flex gap-1">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={
                selectedYear === y
                  ? { border: "1px solid #238636", color: "#3fb950" }
                  : { border: "1px solid transparent", color: "#8b949e" }
              }
              className="px-2 py-0.5 text-xs rounded-md hover:border-zinc-500 transition-colors bg-transparent cursor-pointer"
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "flex-start" }}>
          {/* Day labels column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 22 }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  height: 11,
                  width: 28,
                  fontSize: 10,
                  lineHeight: "11px",
                  color: "#8b949e",
                  textAlign: "right",
                  paddingRight: 4,
                  visibility: label ? "visible" : "hidden",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Month labels + grid */}
          <div>
            {/* Month labels */}
            <div style={{ display: "flex", gap: 4, marginBottom: 6, height: 18 }}>
              {weeks.map((_, i) => {
                const ml = monthLabels.find((m) => m.col === i);
                return (
                  <div
                    key={i}
                    style={{
                      width: 11,
                      fontSize: 10,
                      color: "#8b949e",
                      overflow: "visible",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ml ? ml.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Squares grid */}
            <div style={{ display: "flex", gap: 4 }}>:
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>:
                  {week.contributionDays.map((day, di) => (
                    <div
                      key={di}
                      title={
                        day.inYear
                          ? `${day.date}: ${day.contributionCount} commit${day.contributionCount !== 1 ? "s" : ""}`
                          : undefined
                      }
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 2,
                        backgroundColor: day.color,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "#8b949e" }}>Less</span>
        {LEGEND_COLORS.map((c) => (
          <div
            key={c}
            style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: c }}
          />
        ))}
        <span style={{ fontSize: 10, color: "#8b949e" }}>More</span>
      </div>
    </div>
  );
}
