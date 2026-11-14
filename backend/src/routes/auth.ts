import { Router } from "express";
import { z } from "zod";
import { clearSession, createSession, loginUser, publicUser, registerUser, setSessionCookie, userFromRequest } from "../services/auth.js";

export const authRouter = Router();
const credentials = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });

authRouter.post("/register", async (req, res, next) => {
  const input = credentials.extend({ name: z.string().trim().min(2).max(120) }).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Name, email, and a password of at least 8 characters are required." });
  try {
    const user = await registerUser(input.data.name, input.data.email, input.data.password);
    setSessionCookie(res, await createSession(user.id));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return res.status(409).json({ error: "An account with that email already exists." });
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  const input = credentials.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Enter a valid email and password." });
  const user = await loginUser(input.data.email, input.data.password);
  if (!user) return res.status(401).json({ error: "Email or password is incorrect." });
  setSessionCookie(res, await createSession(user.id));
  return res.json({ user: publicUser(user) });
});

authRouter.post("/logout", async (req, res, next) => { try { await clearSession(req, res); return res.status(204).send(); } catch (error) { return next(error); } });
authRouter.get("/me", async (req, res, next) => {
  const user = await userFromRequest(req);
  return user ? res.json({ user: publicUser(user) }) : res.status(401).json({ error: "Not signed in." });
});
