"use client";

import { useState, useCallback } from "react";

export type CarouselVideo = {
  title: string;
  description?: string;
  shareableLink: string;
  visibility: string;
  category: string;
  mediaType?: "video" | "image";
  imageSrc?: string;
  posterSrc?: string;
  projectName: string;
  projectColor: string;
  repoCount: number;
  repoNames: { name: string; goal: string; last_updated: string }[];
};

function getYouTubeId(url: string) {
  return url.split("/").pop() ?? "";
}

const CATEGORY_LABELS: Record<string, string> = {
  "vibecoded search algo": "Search & RAG",
  "vibecoded web3 software": "Web3",
  "vibecoded real estate for usa software": "Real Estate Data Analysis USA",
  "vibecoded crm": "CRM & Outreach",
  "vibecoded fintech": "Fintech",
};

function Thumbnail({
  video,
  onClick,
  dimmed,
}: {
  video: CarouselVideo;
  onClick?: () => void;
  dimmed?: boolean;
}) {
  const isImage = video.mediaType === "image";
  const vid = getYouTubeId(video.shareableLink);
  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isImage ? video.imageSrc ?? video.shareableLink : `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
        alt={video.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          if (!isImage) {
            (e.target as HTMLImageElement).src =
              `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
          }
        }}
      />
      {dimmed && <div className="absolute inset-0 bg-black/60" />}
    </div>
  );
}

export default function VideoCarousel({ videos }: { videos: CarouselVideo[] }) {
  const defaultIndex = videos.findIndex((v) => v.title === "Altimate Code Hackathon — 2nd Place");
  const [current, setCurrent] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + videos.length) % videos.length), [videos.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % videos.length), [videos.length]);

  const video = videos[current];
  const prevIdx = (current - 1 + videos.length) % videos.length;
  const nextIdx = (current + 1) % videos.length;

  return (
    <div className="relative w-full">
      {/* Three-panel layout */}
      <div className="relative flex min-w-0 items-center gap-0 sm:gap-3">
        {/* Prev panel */}
        <div className="hidden sm:block flex-shrink-0 w-[30%] aspect-video rounded-xl overflow-hidden">
          <Thumbnail video={videos[prevIdx]} onClick={prev} dimmed />
        </div>

        {/* Left arrow — sits between prev panel and main */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/90 sm:static sm:h-10 sm:w-10 sm:translate-y-0 sm:flex-shrink-0"
          aria-label="Previous"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Main video */}
        <div
          className="relative flex-1 aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const tooltip = e.currentTarget.querySelector("[data-repo-tooltip]") as HTMLElement | null;
            if (tooltip) {
              tooltip.style.left = `${rect.left + rect.width / 2}px`;
              tooltip.style.top = `${rect.bottom + 8}px`;
              tooltip.style.opacity = "1";
              tooltip.style.pointerEvents = "auto";
            }
          }}
          onMouseLeave={() => {
            const tooltip = document.querySelector("[data-repo-tooltip]") as HTMLElement | null;
            if (!tooltip) return;
            setTimeout(() => {
              if (tooltip.matches(":hover")) return;
              tooltip.style.opacity = "0";
              tooltip.style.pointerEvents = "none";
            }, 150);
          }}
        >
          <Thumbnail video={video} />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

          {/* Play button */}
          {video.mediaType !== "image" && (
            <a
              href={video.shareableLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center group"
              aria-label={`Watch ${video.title}`}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-110 transition-all duration-200">
                <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </a>
          )}

          {/* Bottom overlay: title + meta */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 pointer-events-none">
            <div className="flex items-end justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-semibold text-white leading-tight">{video.mediaType === "image" || video.posterSrc ? video.title : CATEGORY_LABELS[video.category] ?? video.category}</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 line-clamp-2">{video.description ?? video.title}</p>
              </div>

              {/* Repo count badge / event poster */}
              <div className="flex-shrink-0 text-right">
                {video.posterSrc ? (
                  <div className="w-20 sm:w-32 md:w-40 rounded-lg overflow-hidden border border-white/20 bg-black/40 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.posterSrc}
                      alt={`${video.title} event poster`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div
                      className="font-bold tabular-nums"
                      style={{ color: video.projectColor, fontSize: "clamp(3rem, 12vw, 12rem)", lineHeight: 1 }}
                    >
                      {video.repoCount}
                    </div>
                    <div className="text-white font-mono" style={{ fontSize: "clamp(1rem, 3.5vw, 44px)" }}>codebases</div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Tooltip */}
          <div
            data-repo-tooltip
            className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm shadow-2xl p-3 transition-opacity duration-150 opacity-0 pointer-events-none"
            style={{ transform: "translate(-50%, 0)" }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0";
              (e.currentTarget as HTMLElement).style.pointerEvents = "none";
            }}
          >
            <p className="text-xs font-mono mb-2 tracking-wider" style={{ color: video.projectColor }}>
              {video.repoCount} codebase{video.repoCount !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              {video.repoNames.map((repo) => (
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
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/90 sm:static sm:h-10 sm:w-10 sm:translate-y-0 sm:flex-shrink-0"
          aria-label="Next"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Next panel */}
        <div className="hidden sm:block flex-shrink-0 w-[18%] aspect-video rounded-xl overflow-hidden">
          <Thumbnail video={videos[nextIdx]} onClick={next} dimmed />
        </div>
      </div>

      {/* Title / subtitle strip */}
      <div className="text-center pt-4 pb-2">
        <h2 className="text-xl font-semibold text-white leading-tight">
          {video.mediaType === "image" || video.posterSrc ? video.title : CATEGORY_LABELS[video.category] ?? video.category}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">{video.description ?? video.title}</p>
      </div>

      {/* Dot strip */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div className="flex gap-1.5 flex-wrap">
          {videos.map((v, i) => (
            <button
              key={v.shareableLink}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                backgroundColor: i === current ? video.projectColor : "#3f4451",
              }}
              aria-label={`Go to ${v.title}`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {current + 1} / {videos.length}
        </span>
      </div>
    </div>
  );
}
