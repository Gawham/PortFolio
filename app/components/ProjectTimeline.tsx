"use client";

import { useState } from "react";

export type TimelineRepo = {
  name: string;
  goal: string;
  last_updated: string;
};

export type TimelineVideo = {
  title: string;
  shareableLink: string;
  visibility: string;
};

export type TimelineProject = {
  id: string;
  name: string;
  color: string;
  repos: TimelineRepo[];
  videos: TimelineVideo[];
  firstDate: string;
  lastDate: string;
};

function getYouTubeId(url: string) {
  return url.split("/").pop() ?? "";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const TIMELINE_START = new Date("2023-01-01").getTime();
const TIMELINE_END = new Date("2026-12-31").getTime();
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

function pct(ts: number) {
  return Math.round(((ts - TIMELINE_START) / TIMELINE_SPAN) * 10000) / 100;
}

function DateBar({ first, last, color }: { first: string; last: string; color: string }) {
  const start = new Date(first).getTime();
  const end = new Date(last).getTime();
  const left = Math.max(0, pct(start));
  const right = Math.min(100, pct(end));
  const width = Math.max(1, right - left);

  return (
    <div className="relative h-1.5 bg-zinc-800 rounded-full w-full mt-2 mb-1">
      <div
        className="absolute h-full rounded-full"
        style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.85 }}
      />
    </div>
  );
}

function VideoThumb({ video }: { video: TimelineVideo }) {
  const id = getYouTubeId(video.shareableLink);
  return (
    <a
      href={video.shareableLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-shrink-0 w-28 rounded overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
        alt={video.title}
        className="w-full aspect-video object-cover opacity-70 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center group-hover:bg-white/20">
          <svg className="w-3 h-3 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <p className="text-[9px] text-zinc-400 px-1 py-0.5 truncate bg-black/60">{video.title}</p>
    </a>
  );
}

export default function ProjectTimeline({ projects }: { projects: TimelineProject[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-700" />

      <div className="space-y-0">
        {projects.map((project, i) => {
          const isOpen = expanded.has(project.id);
          const isLast = i === projects.length - 1;

          return (
            <div key={project.id} className="relative pl-8">
              {/* Dot on spine */}
              <div
                className="absolute left-0 top-5 w-[15px] h-[15px] rounded-full border-2 border-black z-10"
                style={{ backgroundColor: project.color }}
              />

              <div className={`pb-8 ${isLast ? "" : ""}`}>
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white">{project.name}</h3>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: project.color + "22", color: project.color }}
                      >
                        {project.repos.length} codebase{project.repos.length !== 1 ? "s" : ""}
                      </span>
                      {project.videos.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400">
                          {project.videos.length} video{project.videos.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Date span + bar */}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                      <span>{fmtDate(project.firstDate)}</span>
                      <span>→</span>
                      <span>{fmtDate(project.lastDate)}</span>
                    </div>
                    <DateBar first={project.firstDate} last={project.lastDate} color={project.color} />
                  </div>

                  {/* Video thumbnails (always visible) */}
                  {project.videos.length > 0 && (
                    <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
                      {project.videos.map((v) => (
                        <VideoThumb key={v.shareableLink} video={v} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggle(project.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  {isOpen ? "hide codebases" : `show ${project.repos.length} codebases`}
                </button>

                {/* Expanded repo list */}
                {isOpen && (
                  <div className="mt-3 border-l-2 pl-4 space-y-2" style={{ borderColor: project.color + "44" }}>
                    {project.repos.map((repo) => (
                      <div key={repo.name} className="group">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-zinc-300">{repo.name}</span>
                          <span className="text-[10px] text-zinc-600 font-mono">{fmtDate(repo.last_updated)}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-1 mt-0.5">
                          {repo.goal}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
