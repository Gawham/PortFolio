import fs from "fs";
import path from "path";
import ContributionGraph from "./components/ContributionGraph";
import ProjectTimeline, { type TimelineProject } from "./components/ProjectTimeline";
import VideoCarousel, { type CarouselVideo } from "./components/VideoCarousel";

type Repo = {
  name: string;
  goal: string;
  last_updated: string;
  project_category?: string;
};

type Video = {
  title: string;
  description?: string;
  shareableLink: string;
  visibility: string;
  category: string;
};

function readJson<T>(relPath: string): T {
  const abs = path.join(process.cwd(), "public", "data", relPath);
  return JSON.parse(fs.readFileSync(abs, "utf-8")) as T;
}

// ── project definitions ────────────────────────────────────────────────────
// Each def maps repo categories and video categories into a unified project.
// Uncategorized repos with a matching name prefix get added to a catch group.
const PROJECT_DEFS = [
  {
    id: "insdr",
    name: "Insdr · RAG & Search",
    color: "#3fb950",
    repoCategory: "vibecoded search algo",
    videoCategories: ["vibecoded search algo"],
    namePatterns: [] as RegExp[],
  },
  {
    id: "crm",
    name: "CRM & Outreach",
    color: "#e3b341",
    repoCategory: "vibecoded crm",
    videoCategories: ["vibecoded crm", "vibecoded real estate for usa software"],
    namePatterns: [] as RegExp[],
  },
  {
    id: "fintech",
    name: "Fintech / Glance",
    color: "#bc8cff",
    repoCategory: "vibecoded fintech",
    videoCategories: ["vibecoded fintech"],
    namePatterns: [] as RegExp[],
  },
  {
    id: "gotham",
    name: "Gotham · Web3",
    color: "#da3633",
    repoCategory: "",
    videoCategories: ["vibecoded web3 software"],
    namePatterns: [/^gotham/i],
  },
] as const;

// ── process data ────────────────────────────────────────────────────────────
function processProjects(repos: Repo[], videos: Video[]): TimelineProject[] {
  const usedRepoNames = new Set<string>();
  const usedVideoLinks = new Set<string>();

  const projects: TimelineProject[] = PROJECT_DEFS.map((def) => {
    // Match repos by category or name pattern
    const matchedRepos = repos.filter((r) => {
      if (usedRepoNames.has(r.name)) return false;
      if (def.repoCategory && r.project_category === def.repoCategory) return true;
      if (def.namePatterns.some((p) => p.test(r.name))) return true;
      return false;
    });
    matchedRepos.forEach((r) => usedRepoNames.add(r.name));

    // Match videos by category
    const matchedVideos = videos.filter((v) => {
      if (usedVideoLinks.has(v.shareableLink)) return false;
      if ((def.videoCategories as readonly string[]).includes(v.category)) return true;
      return false;
    });
    matchedVideos.forEach((v) => usedVideoLinks.add(v.shareableLink));

    // Sort repos newest first
    const sorted = [...matchedRepos].sort(
      (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    const dates = sorted.map((r) => r.last_updated).sort();
    const firstDate = dates[0] ?? new Date().toISOString();
    const lastDate = dates[dates.length - 1] ?? new Date().toISOString();

    return {
      id: def.id,
      name: def.name,
      color: def.color,
      repos: sorted,
      videos: matchedVideos,
      firstDate,
      lastDate,
    };
  });

  // Remaining uncategorized repos → "Other" group
  const other = repos.filter((r) => !usedRepoNames.has(r.name));
  if (other.length > 0) {
    const sorted = [...other].sort(
      (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );
    const dates = sorted.map((r) => r.last_updated).sort();
    projects.push({
      id: "other",
      name: "Other Projects",
      color: "#8b949e",
      repos: sorted,
      videos: [],
      firstDate: dates[0] ?? new Date().toISOString(),
      lastDate: dates[dates.length - 1] ?? new Date().toISOString(),
    });
  }

  // Sort projects by most recently active first, skip empty ones
  return projects
    .filter((p) => p.repos.length > 0 || p.videos.length > 0)
    .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
}

function loadCommitsByDate(): Record<string, number> {
  const dir = path.join(process.cwd(), "repo_commit_outputs");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const counts: Record<string, number> = {};
  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(dir, file), "utf-8")
    ) as { date: string; commit_count: number }[];
    for (const entry of data) {
      counts[entry.date] = (counts[entry.date] ?? 0) + entry.commit_count;
    }
  }
  return counts;
}

export default function Home() {
  const repos = readJson<Repo[]>("repos_summary.json");
  const { videos } = readJson<{ videos: Video[]; totalVideos: number }>("vids.json");
  const commitsByDate = loadCommitsByDate();

  const projects = processProjects(repos, videos);
  const totalRepos = repos.length;
  const totalVideos = videos.length;

  // Build lookup: video category → project (for repo count + color + name)
  const categoryToProject = new Map(
    projects.flatMap((p) =>
      p.videos.map((v) => [v.shareableLink, p])
    )
  );

  // Annotate every video with its project context
  const carouselVideos: CarouselVideo[] = videos.map((v) => {
    const proj = categoryToProject.get(v.shareableLink);
    return {
      ...v,
      projectName: proj?.name ?? "Other",
      projectColor: proj?.color ?? "#8b949e",
      repoCount: proj?.repos.length ?? 0,
      repoNames: proj?.repos ?? [],
    };
  });

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-sm text-zinc-400">guhansrinivasan</span>
          <div className="flex gap-5 text-sm text-zinc-500">
            <a href="#activity" className="hover:text-white transition-colors">Activity</a>
            <a href="#timeline" className="hover:text-white transition-colors">Ventures</a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero — profile + commit graph */}
        <section id="activity" className="pt-10 pb-8 border-b border-zinc-800 -mr-6 sm:-mr-16 md:-mr-28" style={{ overflow: 'visible' }}>
          {/* Name + DP */}
          <div className="mb-10 flex items-start gap-5">
            <img src="/1727086616679.jpg" alt="Guhan Srinivasan" className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-zinc-700" />
            <div>
              <p className="text-xs font-mono text-[#3fb950] mb-1 tracking-wider">$ whoami</p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Guhan Srinivasan</h1>
              <p className="text-sm text-zinc-400 mt-3 max-w-xl leading-relaxed">
                Founder who ships. Registered my company in 2024 and been full-time since. Best part — I'm a business grad, never professionally studied engineering.
                <br />
                If you're looking at this from Emergent X × T-Hub — <span className="text-[#3fb950] font-semibold">;&gt;</span> every single line of code I've written across my <span className="text-[#3fb950] font-semibold">2½ years</span> is <span className="text-[#3fb950] font-semibold">vibecoded</span>.
              </p>
            </div>
          </div>
          {/* Insdr CTA */}
          <div className="mb-10 text-center">
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              I'm building the next generation of databases — test it out at <a href="https://app.insdrdata.com/search" target="_blank" rel="noopener noreferrer" className="text-[#3fb950] font-semibold hover:underline">insdrdata.com</a>. I've promised to keep it free for education and update it for every competitive exam.
            </p>
          </div>
          {/* Commit graph */}
          <div className="mb-10">
            <ContributionGraph commitsByDate={commitsByDate} />
          </div>
          {/* Stats */}
          <div className="flex justify-center gap-4 sm:gap-8 font-mono text-sm mb-10">
            <div><span className="text-lg sm:text-2xl font-bold text-white">{totalRepos}</span><span className="text-zinc-500 ml-1.5">codebases</span></div>
            <div><span className="text-lg sm:text-2xl font-bold text-white">{projects.length}</span><span className="text-zinc-500 ml-1.5">ventures</span></div>
            <div><span className="text-lg sm:text-2xl font-bold text-white">{totalVideos}</span><span className="text-zinc-500 ml-1.5">demos</span></div>
          </div>
          {/* Video carousel */}
          <div className="-mx-6 sm:-mx-16 md:-mx-32 lg:-mx-48 xl:-mx-64">
            <VideoCarousel videos={carouselVideos} />
          </div>
        </section>

        {/* Project Timeline */}
        <section id="timeline" className="pt-12 pb-24">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-8">
            Venture Timeline
          </h2>
          <ProjectTimeline projects={projects} />
        </section>
      </main>
    </div>
  );
}
