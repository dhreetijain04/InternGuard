import type { NextFunction, Request, Response } from "express";

const buckets = new Map<string, { started: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.started > WINDOW_MS) {
    buckets.set(key, { started: now, count: 1 });
    next();
    return;
  }
  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }
  next();
}

export function secureHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
}
