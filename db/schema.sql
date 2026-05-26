-- Launch OS production schema
create extension if not exists pgcrypto;

create table if not exists brand_projects (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  business_name text not null,
  brand_profile jsonb not null,
  launch_targets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generated_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references brand_projects(id) on delete cascade,
  owner_key text not null,
  asset_type text not null,
  asset_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists regeneration_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references brand_projects(id) on delete cascade,
  owner_key text not null,
  reason text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists export_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references brand_projects(id) on delete set null,
  owner_key text not null,
  export_target text not null,
  export_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique,
  event_type text not null,
  event_payload jsonb not null,
  created_at timestamptz not null default now()
);
