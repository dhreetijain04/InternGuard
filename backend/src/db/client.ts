import pg from "pg";
import type { AnalysisInput } from "../validators/analysis.js";
import type { Indicator } from "../services/rules.js";

const { Pool } = pg;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) : null;

export type AnalysisRecord = AnalysisInput & {
  id: string;
  userId?: string;
  score: number;
  category: "Low" | "Moderate" | "High";
  indicators: Indicator[];
  extracted: Record<string, string>;
  recommendations: string[];
  aiReasoning: string;
  aiAvailable: boolean;
  checklist: { id: string; label: string; completed: boolean }[];
  createdAt: string;
};

export type AnalysisList = { analyses: AnalysisRecord[]; total: number; page: number; pageSize: number };

const memory: AnalysisRecord[] = [];

export async function listAnalyses(options: { userId?: string; search?: string; category?: string; from?: string; to?: string; page: number; pageSize: number }): Promise<AnalysisList> {
  if (!pool) {
    const filtered = memory.filter((item) => (!options.userId || item.userId === options.userId) && (!options.search || `${item.title} ${item.company}`.toLowerCase().includes(options.search.toLowerCase())) && (!options.category || item.category === options.category) && (!options.from || item.createdAt >= options.from) && (!options.to || item.createdAt <= options.to));
    const start = (options.page - 1) * options.pageSize;
    return { analyses: filtered.slice(start, start + options.pageSize), total: filtered.length, page: options.page, pageSize: options.pageSize };
  }
  const clauses: string[] = [];
  const values: string[] = [];
  if (options.userId) { values.push(options.userId); clauses.push(`user_id = $${values.length}`); }
  if (options.search) { values.push(`%${options.search}%`); clauses.push(`(title ILIKE $${values.length} OR company ILIKE $${values.length})`); }
  if (options.category && ["Low", "Moderate", "High"].includes(options.category)) { values.push(options.category); clauses.push(`category = $${values.length}`); }
  if (options.from) { values.push(options.from); clauses.push(`created_at >= $${values.length}`); }
  if (options.to) { values.push(options.to); clauses.push(`created_at <= $${values.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const count = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM analyses ${where}`, values);
  const offset = (options.page - 1) * options.pageSize;
  const result = await pool.query(`SELECT * FROM analyses ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, options.pageSize, offset]);
  return { analyses: result.rows.map(mapRow), total: Number(count.rows[0]?.count ?? 0), page: options.page, pageSize: options.pageSize };
}

export async function getAnalysis(id: string, userId?: string): Promise<AnalysisRecord | null> {
  if (!pool) return memory.find((item) => item.id === id && (!userId || item.userId === userId)) ?? null;
  const result = await pool.query(userId ? "SELECT * FROM analyses WHERE id = $1 AND user_id = $2" : "SELECT * FROM analyses WHERE id = $1", userId ? [id, userId] : [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function saveAnalysis(record: AnalysisRecord): Promise<AnalysisRecord> {
  if (!pool) { memory.unshift(record); return record; }
  await pool.query(`INSERT INTO analyses (id, user_id, title, company, description, salary, location, work_mode, application_url, contact, score, category, indicators, extracted, recommendations, ai_reasoning, ai_available, checklist, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15::jsonb,$16,$17,$18::jsonb,$19)`, [record.id, record.userId ?? null, record.title, record.company, record.description, record.salary, record.location, record.workMode, record.applicationUrl, record.contact, record.score, record.category, JSON.stringify(record.indicators), JSON.stringify(record.extracted), JSON.stringify(record.recommendations), record.aiReasoning, record.aiAvailable, JSON.stringify(record.checklist), record.createdAt]);
  return record;
}

export async function deleteAnalysis(id: string, userId?: string): Promise<boolean> {
  if (!pool) { const index = memory.findIndex((item) => item.id === id && (!userId || item.userId === userId)); if (index < 0) return false; memory.splice(index, 1); return true; }
  const result = await pool.query(userId ? "DELETE FROM analyses WHERE id = $1 AND user_id = $2" : "DELETE FROM analyses WHERE id = $1", userId ? [id, userId] : [id]);
  return result.rowCount === 1;
}

export async function getChecklist(id: string, userId?: string): Promise<AnalysisRecord["checklist"] | null> {
  const record = await getAnalysis(id, userId);
  return record ? record.checklist : null;
}

export async function updateChecklist(id: string, updates: { id: string; completed: boolean }[], userId?: string): Promise<AnalysisRecord["checklist"] | null> {
  if (pool) {
    const current = await getChecklist(id, userId);
    if (!current) return null;
    const checklist = current.map((item) => {
      const update = updates.find((candidate) => candidate.id === item.id);
      return update ? { ...item, completed: update.completed } : item;
    });
    await pool.query(userId ? "UPDATE analyses SET checklist = $1::jsonb WHERE id = $2 AND user_id = $3" : "UPDATE analyses SET checklist = $1::jsonb WHERE id = $2", userId ? [JSON.stringify(checklist), id, userId] : [JSON.stringify(checklist), id]);
    return checklist;
  }
  const record = memory.find((item) => item.id === id && (!userId || item.userId === userId));
  if (!record) return null;
  record.checklist = record.checklist.map((item) => {
    const update = updates.find((candidate) => candidate.id === item.id);
    return update ? { ...item, completed: update.completed } : item;
  });
  return record.checklist;
}

function mapRow(row: Record<string, unknown>): AnalysisRecord {
  return { ...row, workMode: row.work_mode, applicationUrl: row.application_url, createdAt: row.created_at, indicators: row.indicators, extracted: row.extracted, recommendations: row.recommendations, aiReasoning: row.ai_reasoning, aiAvailable: row.ai_available, checklist: row.checklist ?? [] } as AnalysisRecord;
}
