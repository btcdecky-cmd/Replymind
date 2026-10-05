# ReplyMind — Build State

## Current milestone
MILESTONE 1 — Repository + architecture + design system (in progress)

## Completed features
- Workspace inspected (TanStack Start, Better Auth, Neon/PGLite)
- Auth enabled (email/password + Google + X via Grok broker)
- Auth schema copied to `migrations/0001_auth.sql`
- Database flag on (`deploy.database: true`)

## Remaining features
- Design system, landing, auth screens
- Dashboard, upload, AI, replies, history
- Privacy, PWA, tests, deploy docs, GitHub push

## Known bugs
- None yet (app not fully scaffolded)

## Next exact task
Write schema, design tokens, routes, AI service, and UI; then start the preview.

## Environment variables required
Platform-injected (do not write `.env`):
- `XAI_API_KEY` (server, AI)
- `DATABASE_URL` (server, Neon in production; PGLite in preview)
- Auth broker credentials (platform)

Optional object storage (falls back to private DB blobs):
- `STORAGE_ENDPOINT`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_BUCKET`

## Deployment status
Not deployed. Preview target: `0.0.0.0:8080`.

## Latest successful build
None yet.

## Latest Git commit
None yet (repo not initialized).
