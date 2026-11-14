import Link from "next/link";

export default function NotFound() {
  return <main className="noise flex min-h-screen items-center justify-center px-6 text-center"><div><p className="font-mono text-sm text-cyan-300">404</p><h1 className="mt-3 text-3xl font-bold text-white">That report is unavailable.</h1><p className="mt-3 text-sm text-slate-400">The page may have moved or the analysis may no longer exist.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Home</Link><Link href="/analyze" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">Analyze a listing</Link></div></div></main>;
}
