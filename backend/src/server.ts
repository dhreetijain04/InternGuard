import "dotenv/config";
import cors from "cors";
import express from "express";
import { analysesRouter } from "./routes/analyses.js";
import { authRouter } from "./routes/auth.js";
import { deleteUser, publicUser, updateUser, userFromRequest } from "./services/auth.js";
import { rateLimit, secureHeaders } from "./middleware/security.js";

const app = express();
app.disable("x-powered-by");
app.use(secureHeaders);
app.use(rateLimit);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, databaseConfigured: Boolean(process.env.DATABASE_URL), geminiConfigured: Boolean(process.env.GEMINI_API_KEY) }));
app.use("/api/auth", authRouter);
app.get("/api/users/me", async (req, res, next) => {
  try {
  const user = await userFromRequest(req);
  return user ? res.json({ user: publicUser(user) }) : res.status(401).json({ error: "Not signed in." });
  } catch (error) { return next(error); }
});
app.patch("/api/users/me", async (req, res, next) => {
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  try {
    const updated = await updateUser(user.id, { name: typeof req.body?.name === "string" ? req.body.name : undefined, email: typeof req.body?.email === "string" ? req.body.email : undefined });
    return updated ? res.json({ user: publicUser(updated) }) : res.status(404).json({ error: "User not found." });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return res.status(409).json({ error: "That email is already in use." });
    return res.status(400).json({ error: "Profile details are invalid." });
  }
});
app.delete("/api/users/me", async (req, res, next) => {
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  await deleteUser(user.id);
  res.setHeader("Set-Cookie", "internguard_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  return res.status(204).send();
});
app.use("/api/analyses", analysesRouter);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { if (error instanceof Error && error.name === "ZodError") return res.status(400).json({ error: "Please check the listing fields and try again.", details: error.message }); console.error(error); return res.status(500).json({ error: "The analysis could not be completed." }); });

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`InternGuard API listening on http://localhost:${port}`));
