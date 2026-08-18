import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-xs font-mono uppercase tracking-[0.35em] text-[#3fb950]">Guhan Srinivasan</p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          I come from a business background, but I run my numbers and build using code.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Over the last 2 years, the portfolio is the more convincing proof of my technical ability — every shipped demo, repo, and product trace shows how I think and build.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/cv"
            className="rounded-full border border-zinc-700 px-8 py-3 text-base font-semibold text-zinc-100 transition hover:border-white hover:bg-zinc-900"
          >
            My CV
          </Link>
          <Link
            href="/portfolio"
            className="rounded-full bg-[#3fb950] px-8 py-3 text-base font-semibold text-black transition hover:bg-[#52d869]"
          >
            My portfolio
          </Link>
        </div>
      </main>
    </div>
  );
}
