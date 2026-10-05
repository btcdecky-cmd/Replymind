# ReplyMind

A mobile-first PWA that reads a conversation screenshot (or pasted thread) and drafts natural replies in the tone you pick.

## Stack

- TanStack Start (React, Vite, TypeScript)
- Tailwind CSS + Radix
- Better Auth (email/password, Google, X)
- Postgres via Prisma-less SQL migrations (Neon in production, embedded PGLite in preview)
- xAI Grok (`grok-4.7`, vision + JSON replies)
- PWA (manifest, icons, service worker, install prompt)

## Local setup

The live preview already runs the app. For a clone:

```bash
npm install
# Auth + database are on. Do not create a .env for local preview.
npm run dev
```

The app listens on `0.0.0.0:8080`.

## Environment

Do not commit secrets. Production injects:

| Variable | Where | Purpose |
| --- | --- | --- |
| `XAI_API_KEY` | server | xAI API |
| `DATABASE_URL` | server | Neon Postgres (PGLite if unset) |
| Auth broker credentials | server | Google / X sign-in |

Optional S3-compatible storage (otherwise images stay as private DB blobs):

- `STORAGE_ENDPOINT`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_BUCKET`

## Database

Migrations in `migrations/` apply on preview startup and during `npm run build`.

```bash
npm run db:migrate
```

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## PWA

Manifest and install tutorial are provided by the host. App icons live in `public/`. `public/sw.js` caches a small offline shell.

## AI

Server-only calls from `src/lib/ai`. Screenshots go in as image inputs. Structured JSON is parsed and validated before the client sees it.

## Product flow

Sign up → dashboard → upload / paste / type → analysis → reply cards (copy, regenerate, shorten, rewrite) → saved history → delete / sign out.
