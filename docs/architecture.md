# ReplyMind architecture

## Stack

TanStack Start (Vite) + React 19 + Tailwind v4 + Better Auth + Postgres (Neon in production, PGLite in preview) + xAI Grok for vision and reply drafting.

## Auth

Every private server function uses `authMiddleware` and scopes queries by `context.userId`. Email/password, Google, and X are supported. Gate viewers are signed in automatically.

## Data

Schema lives in `migrations/`. Conversations, analyses, suggestions, usage, and optional screenshot blobs are per-user. Unretained screenshots expire after 24 hours.

## AI

`src/lib/ai` is the only place that talks to xAI. Screenshots are sent as `image_url` data URIs. Output is JSON, validated before it reaches the client. Keys never leave the server.

## Usage

`UsageService` is the single place that reads plan limits and records monthly usage. The UI never enforces quotas.

## Storage

Default: private base64 blobs in Postgres. If `STORAGE_*` env vars are present they can be used later without changing authorization.
