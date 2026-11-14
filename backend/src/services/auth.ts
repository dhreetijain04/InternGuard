import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import pg from "pg";
import type { Request, Response, NextFunction } from "express";

const { Pool } = pg;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) : null;
export type User = { id: string; name: string; email: string; passwordHash: string };
const users: User[] = [];
const sessions = new Map<string, string>();

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(digest, "hex"));
}
export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const normalized = email.toLowerCase();
  if (pool) {
    try {
      const result = await pool.query<User>("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, password_hash AS \"passwordHash\"", [name.trim(), normalized, hashPassword(password)]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") throw new Error("EMAIL_EXISTS");
      throw error;
    }
  }
  if (users.some((user) => user.email === normalized)) throw new Error("EMAIL_EXISTS");
  const user = { id: randomBytes(16).toString("hex"), name: name.trim(), email: normalized, passwordHash: hashPassword(password) };
  users.push(user);
  return user;
}
export async function loginUser(email: string, password: string): Promise<User | null> {
  const normalized = email.toLowerCase();
  const user = pool ? (await pool.query<User>('SELECT id, name, email, password_hash AS "passwordHash" FROM users WHERE email = $1', [normalized])).rows[0] : users.find((item) => item.email === normalized);
  return user && verifyPassword(password, user.passwordHash) ? user : null;
}
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  if (pool) await pool.query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')", [token, userId]);
  else sessions.set(token, userId);
  return token;
}
function cookieToken(req: Request): string | undefined { return req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("internguard_session="))?.split("=")[1]; }
export async function userFromRequest(req: Request): Promise<User | null> {
  const token = cookieToken(req);
  if (!token) return null;
  if (pool) {
    const result = await pool.query<User>('SELECT u.id, u.name, u.email, u.password_hash AS "passwordHash" FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > NOW()', [token]);
    return result.rows[0] ?? null;
  }
  const id = sessions.get(token);
  return id ? users.find((user) => user.id === id) ?? null : null;
}
export function setSessionCookie(res: Response, token: string): void { res.setHeader("Set-Cookie", `internguard_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`); }
export async function clearSession(req: Request, res: Response): Promise<void> { const token = cookieToken(req); if (pool && token) await pool.query("DELETE FROM sessions WHERE token = $1", [token]); if (token) sessions.delete(token); res.setHeader("Set-Cookie", "internguard_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"); }
export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> { if (!(await userFromRequest(req))) { res.status(401).json({ error: "Please sign in to access this resource." }); return; } next(); }
export function publicUser(user: User) { return { id: user.id, name: user.name, email: user.email }; }
export async function updateUser(userId: string, input: { name?: string; email?: string }): Promise<User | null> {
  if (pool) {
    const result = await pool.query<User>('UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING id, name, email, password_hash AS "passwordHash"', [input.name?.trim() || null, input.email?.toLowerCase() || null, userId]);
    return result.rows[0] ?? null;
  }
  const user = users.find((item) => item.id === userId);
  if (!user) return null;
  const normalizedEmail = input.email?.toLowerCase();
  if (normalizedEmail && users.some((item) => item.id !== userId && item.email === normalizedEmail)) throw new Error("EMAIL_EXISTS");
  if (input.name) user.name = input.name.trim();
  if (normalizedEmail) user.email = normalizedEmail;
  return user;
}
export async function deleteUser(userId: string): Promise<boolean> {
  if (pool) return (await pool.query("DELETE FROM users WHERE id = $1", [userId])).rowCount === 1;
  const index = users.findIndex((item) => item.id === userId);
  if (index < 0) return false;
  users.splice(index, 1);
  for (const [token, id] of sessions) if (id === userId) sessions.delete(token);
  return true;
}
