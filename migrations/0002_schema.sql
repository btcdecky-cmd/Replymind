-- ReplyMind application schema. Per-user rows use TEXT user_id.
-- Images are stored as compressed base64 blobs; retain only when the user
-- opts in (user_preferences.keep_screenshots) or explicitly saves.

create table if not exists conversations (
  id text primary key,
  user_id text not null,
  title text not null default 'Untitled',
  source text not null default 'message',
  archived boolean not null default false,
  saved boolean not null default true,
  instruction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_id_idx on conversations (user_id, updated_at desc);

create table if not exists uploaded_images (
  id text primary key,
  user_id text not null,
  conversation_id text,
  mime_type text not null,
  data_base64 text not null,
  byte_size integer not null,
  retained boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists uploaded_images_user_id_idx on uploaded_images (user_id);
create index if not exists uploaded_images_conversation_idx on uploaded_images (conversation_id);

create table if not exists conversation_messages (
  id text primary key,
  conversation_id text not null,
  user_id text not null,
  role text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists conversation_messages_convo_idx on conversation_messages (conversation_id, created_at);

create table if not exists ai_analyses (
  id text primary key,
  conversation_id text not null,
  user_id text not null,
  summary text not null,
  tone text,
  intent text,
  relationship text,
  latest_message text,
  transcribed text,
  needs_clarification boolean not null default false,
  clarification text,
  created_at timestamptz not null default now()
);
create index if not exists ai_analyses_convo_idx on ai_analyses (conversation_id, created_at desc);

create table if not exists reply_suggestions (
  id text primary key,
  conversation_id text not null,
  analysis_id text,
  user_id text not null,
  style text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists reply_suggestions_convo_idx on reply_suggestions (conversation_id, created_at desc);

create table if not exists usage_records (
  id text primary key,
  user_id text not null,
  kind text not null,
  units integer not null default 1,
  month_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists usage_records_user_month_idx on usage_records (user_id, month_key, kind);

create table if not exists user_preferences (
  user_id text primary key,
  default_tone text not null default 'natural',
  emoji_preference text not null default 'auto',
  appearance text not null default 'system',
  keep_screenshots boolean not null default false,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
