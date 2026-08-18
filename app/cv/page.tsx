import Link from "next/link";
import CVViewer from "../components/CVViewer";

export default function CVPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#3fb950]">My CV</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">Guhan Srinivasan</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/portfolio"
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-[#3fb950] hover:text-white"
            >
              View portfolio
            </Link>
          </div>
        </div>

        <CVViewer />
      </main>
    </div>
  );
}
