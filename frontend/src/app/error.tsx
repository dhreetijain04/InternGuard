"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="noise flex min-h-screen items-center justify-center px-6 text-center"><div><p className="text-sm font-semibold text-rose-300">Something went wrong</p><h1 className="mt-3 text-3xl font-bold text-white">The service needs another try.</h1><p className="mt-3 text-sm text-slate-400">Your submitted text was not shown as a successful result.</p><div className="mt-7 flex justify-center gap-3"><button onClick={reset} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">Try again</button><Link href="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Home</Link></div></div></main>;
}
