"use client";
import Link from "next/link";
import { ExternalLink, History, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { deleteAnalysis, fetchAnalyses } from "@/lib/api";
import type { Analysis, Category } from "@/lib/types";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void fetchAnalyses().then(setAnalyses).catch(() => setError("Could not load history from the backend.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => analyses.filter((item) => `${item.title} ${item.company}`.toLowerCase().includes(query.toLowerCase()) && (category === "All" || item.category === category)), [analyses, query, category]);
  async function remove(id: string) { if (!window.confirm("Delete this saved analysis? This cannot be undone.")) return; try { await deleteAnalysis(id); setAnalyses((current) => current.filter((item) => item.id !== id)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete analysis."); } }
  return <AppShell><div className="page-heading"><div><div className="eyebrow"><History size={14} className="mr-2 inline" /> Reports</div><h1>Your evidence trail.</h1><p>Search saved reports and revisit what made a listing worth checking.</p></div></div>{error && <div className="alert mb-5">{error}</div>}<section className="card card-pad"><div className="flex flex-col gap-3 md:flex-row"><label className="field relative flex-1"><span className="sr-only">Search reports</span><Search size={16} className="absolute left-3 top-9 text-slate-400" /><input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or company..." /></label><label className="field md:w-48"><span>Risk category</span><select className="select" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option><option>Low</option><option>Moderate</option><option>High</option></select></label></div><div className="table-wrap mt-6">{loading ? <div className="p-10 text-center text-sm text-slate-500">Loading reports...</div> : filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No matching reports found.</div> : <table className="data-table"><thead><tr><th>Listing</th><th>Risk</th><th>Date</th><th className="text-right">Actions</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><Link href={`/results/${item.id}`} className="font-bold text-slate-800 no-underline hover:text-blue-600">{item.title}</Link><span className="mt-1 block text-xs text-slate-500">{item.company || "Company not provided"}</span></td><td><RiskBadge category={item.category} /></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td><div className="flex justify-end gap-2"><Link href={`/results/${item.id}`} className="btn btn-secondary min-h-8 px-2.5 text-xs" aria-label={`Open ${item.title}`}><ExternalLink size={14} /></Link><button className="btn btn-danger min-h-8 px-2.5" onClick={() => void remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table>}</div></section></AppShell>;
}
function RiskBadge({ category }: { category: Category }) { return <span className={`badge ${category === "High" ? "badge-high" : category === "Moderate" ? "badge-moderate" : "badge-low"}`}>{category}</span>; }
