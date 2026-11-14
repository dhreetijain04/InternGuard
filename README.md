# InternGuard

InternGuard is an AI-assisted job and internship listing risk assessment system. It identifies potential warning signals and explains what to verify; it never declares a listing definitively fake or safe.

## Stack

- `frontend/`: Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide
- `backend/`: Node.js, Express, TypeScript, Zod, parameterized PostgreSQL client, Google Gemini SDK
- `database/001_create_analyses.sql`: PostgreSQL schema, user/session tables, and indexes

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (the API can run in memory for a UI demonstration when `DATABASE_URL` is absent)
- A Gemini API key is optional. Without one, the deterministic rule engine remains available and the report says AI assistance was unavailable.

## Setup

1. Copy `.env.example` to `backend/.env` and set `DATABASE_URL` and, optionally, `GEMINI_API_KEY`.
2. Copy `frontend/.env.example` to `frontend/.env.local` if the API is not at `http://localhost:4000/api`.
3. Create a database and run `database/001_create_analyses.sql` with `psql` or your preferred PostgreSQL client.
4. Install dependencies:

   ```bash
   npm run install:all
   ```

5. Start the API and frontend in separate terminals:

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

Open `http://localhost:3000`.

Frontend routes:

- `/` landing page
- `/dashboard` live analysis dashboard
- `/analyze` listing submission form
- `/history` searchable, filterable history
- `/analysis/:id` saved report detail
- `/results/:id` report alias
- `/about` safety guidance and methodology
- `/how-it-works` pipeline explanation
- `/safety-guide` practical safety guidance
- `/login`, `/register`, `/settings` account screens

## Checks

```bash
npm test
npm run build
npm run lint --prefix frontend
```

The frontend build uses `next build --webpack` because the current Windows environment may load the WebAssembly SWC compiler, which cannot use Turbopack native bindings.

## API

- `GET /api/health` reports API status plus `databaseConfigured` and `geminiConfigured` flags. These flags only describe configuration; they do not prove the external service is reachable.
- `GET /api/analyses` retrieves saved analyses. Optional query parameters are `search`, `category`, `from`, `to`, `page`, and `pageSize`.
- `GET /api/analyses/:id` retrieves one report.
- `POST /api/analyses` creates a report. Required fields are `title` and a 40+ character `description`; optional fields include `company`, `salary`, `location`, `workMode`, `applicationUrl`, and `contact`.
- `DELETE /api/analyses/:id` deletes one report.
- `GET /api/analyses/:id/checklist` retrieves report verification actions.
- `PATCH /api/analyses/:id/checklist` persists checklist completion.
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` manage HTTP-only sessions.
- `GET/PATCH/DELETE /api/users/me` manage the signed-in profile.

Example request:

```bash
curl -X POST http://localhost:4000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{"title":"Frontend Intern","company":"Northstar Labs","description":"Work with the engineering team on accessible React features and tests. Apply through the official careers page.","salary":"INR 20,000/month","location":"Bengaluru","workMode":"Hybrid","applicationUrl":"https://northstar.example/careers","contact":"careers@northstar.example"}'
```

## Detection model

Deterministic rules cover upfront fees, unusually high compensation, early requests for identity or financial credentials, urgency or guarantees, vague employer detail, unprofessional contact channels, and missing context. Rule points are 5, 12, or 22 depending on severity. Gemini findings are labeled separately and can add up to 15 confidence-weighted points. The score is capped at 100 and categorized as Low, Moderate, or High.

Listing text is treated as untrusted input. The backend instructs Gemini not to follow embedded listing instructions, validates its JSON-shaped response, times out after 12 seconds, and falls back to deterministic analysis if the service fails.

Authentication uses an HTTP-only, SameSite session cookie. With `DATABASE_URL` configured, users, sessions, and analyses persist in PostgreSQL and analysis ownership is enforced. Without it, a clearly limited in-memory fallback is used for local UI development only; restart the API to reset that fallback.

## Privacy and reset

Do not submit passwords, OTPs, banking credentials, or sensitive document scans. PostgreSQL records contain the submitted listing and report output so the history feature can work. Reset configured local data with `TRUNCATE analyses, sessions, users CASCADE;`. Never commit `.env` files or real API keys.
