"use client";

import { useState } from "react";

type Repo = {
  name: string;
  goal: string;
  last_updated: string;
};

export default function RepoTooltip({ repos }: { repos: Repo[] }) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const sorted = [...repos].sort(
    (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
  );

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        className="cursor-default"
      >
        <span className="text-lg sm:text-2xl font-bold text-white">{repos.length}</span>
        <span className="text-zinc-500 ml-1.5">codebases</span>
      </div>

      {hovered && (
        <div
          className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm shadow-2xl p-3"
          style={{
            left: Math.min(pos.x - 144, window.innerWidth - 304),
            top: pos.y,
          }}
        >
          <p className="text-xs font-mono text-[#3fb950] mb-2 tracking-wider">
            {repos.length} codebase{repos.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {sorted.map((repo) => (
              <div key={repo.name} className="border-b border-zinc-800 last:border-0 pb-2 last:pb-0">
                <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{repo.goal}</p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {new Date(repo.last_updated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
