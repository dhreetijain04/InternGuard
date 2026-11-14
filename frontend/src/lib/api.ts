import type { Analysis, FormData } from "./types";

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const options: RequestInit = { credentials: "include" };

export async function fetchAnalyses(params = ""): Promise<Analysis[]> {
  const response = await fetch(`${API}/analyses${params ? `?${params}` : ""}`, { ...options, cache: "no-store" });
  if (!response.ok) throw new Error("Could not load analyses");
  return (await response.json()).analyses as Analysis[];
}
export async function fetchAnalysis(id: string): Promise<Analysis> {
  const response = await fetch(`${API}/analyses/${id}`, { ...options, cache: "no-store" });
  if (!response.ok) throw new Error("Analysis not found");
  return (await response.json()).analysis as Analysis;
}
export async function createAnalysis(input: FormData): Promise<Analysis> {
  const response = await fetch(`${API}/analyses`, { ...options, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Could not analyze listing");
  return data.analysis as Analysis;
}
export async function deleteAnalysis(id: string): Promise<void> {
  const response = await fetch(`${API}/analyses/${id}`, { ...options, method: "DELETE" });
  if (!response.ok) throw new Error("Could not delete analysis");
}
export async function register(input: { name: string; email: string; password: string }) { return authRequest("/auth/register", input); }
export async function login(input: { email: string; password: string }) { return authRequest("/auth/login", input); }
export async function logout() { await fetch(`${API}/auth/logout`, { ...options, method: "POST" }); }
async function authRequest(path: string, body: unknown) { const response = await fetch(`${API}${path}`, { ...options, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Authentication failed"); return data.user; }
export async function fetchChecklist(id: string) { const response = await fetch(`${API}/analyses/${id}/checklist`, { ...options, cache: "no-store" }); if (!response.ok) throw new Error("Could not load checklist"); return (await response.json()).checklist as { id: string; label: string; completed: boolean }[]; }
export async function updateChecklist(id: string, updates: { id: string; completed: boolean }[]) { const response = await fetch(`${API}/analyses/${id}/checklist`, { ...options, method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) }); if (!response.ok) throw new Error("Could not save checklist"); return (await response.json()).checklist as { id: string; label: string; completed: boolean }[]; }
export async function fetchProfile() { const response = await fetch(`${API}/users/me`, { ...options, cache: "no-store" }); if (!response.ok) throw new Error("Please sign in to manage your profile."); return (await response.json()).user as { id: string; name: string; email: string }; }
export async function updateProfile(input: { name: string; email: string }) { const response = await fetch(`${API}/users/me`, { ...options, method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not update profile."); return data.user as { id: string; name: string; email: string }; }
