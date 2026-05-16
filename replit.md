# Cyber Scout Pro

A professional AI-powered cybersecurity SaaS platform for scanning websites for vulnerabilities, viewing security scores, and generating reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/cyber-scout-pro run dev` — run the frontend (port 21663)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- API: Express 5 with JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/db/src/schema/` — Database schema (users, scans, findings, reports)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/scanner.ts` — Vulnerability scanner logic
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/cyber-scout-pro/src/` — React frontend

## Architecture decisions

- JWT-based authentication stored in localStorage under key `csp_token`; token injected via `setAuthTokenGetter` from the API client
- Vulnerability scanning is async — scan starts immediately, frontend polls `/api/scans/:id` every 3s until complete
- Scanner performs real HTTP header checks when possible, falls back to simulated results
- Security score calculated from finding severities: critical (-25), high (-15), medium (-8), low (-3), info (-1)
- Reports are stored as text content in the DB and downloaded client-side

## Product

- User registration and login with role-based access (admin / user)
- Vulnerability scanner: port scanning, HTTP security header analysis, SSL detection
- Security score (0-100) and risk level (low/medium/high/critical) per scan
- AI-generated security recommendations based on findings
- Scan history with full finding details
- Report generation (TXT and JSON formats) with download
- Admin panel for user management

## Default accounts (demo data)

- **Admin:** admin@cyberscout.pro / password
- **Analyst:** analyst@cyberscout.pro / password

*(password is the literal string "password" — bcrypt hash for demo seed)*

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- The bcrypt hash seeded for demo accounts uses the string "password" — update for production
- Scanner's HTTP header check has an 8s timeout; unreachable hosts fall back to simulated results

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
