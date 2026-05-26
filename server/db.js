import pg from "pg";

const { Pool } = pg;
let pool;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function ensureSchema() {
  if (!hasDatabase()) return false;
  await getPool().query(`
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
  `);
  return true;
}

export async function insertBillingEvent(event) {
  if (!hasDatabase()) return false;
  await ensureSchema();
  await getPool().query(
    `insert into billing_events (stripe_event_id, event_type, event_payload)
     values ($1, $2, $3)
     on conflict (stripe_event_id) do nothing`,
    [event.id, event.type, event]
  );
  return true;
}

export async function saveProject(payload) {
  await ensureSchema();
  const result = await getPool().query(
    `insert into brand_projects (owner_key, business_name, brand_profile, launch_targets)
     values ($1, $2, $3, $4)
     returning id, created_at, updated_at`,
    [
      payload.ownerKey,
      payload.brandProfile?.businessName || "Untitled Startup",
      payload.brandProfile,
      payload.launchTargets || {}
    ]
  );
  const project = result.rows[0];
  await saveGeneratedAssets(project.id, payload.ownerKey, payload.brandProfile);
  await saveRegenerationEvents(project.id, payload.ownerKey, payload.brandProfile?.memory || []);
  return project;
}

export async function saveGeneratedAssets(projectId, ownerKey, brandProfile) {
  const assets = [
    ["logo", brandProfile?.logo],
    ["favicon", brandProfile?.favicon],
    ["heroImage", brandProfile?.heroImage],
    ["screenshotConcepts", brandProfile?.screenshotConcepts],
    ["landingPage", brandProfile?.landingPage]
  ].filter(([, value]) => Boolean(value));

  for (const [assetType, assetPayload] of assets) {
    await getPool().query(
      `insert into generated_assets (project_id, owner_key, asset_type, asset_payload)
       values ($1, $2, $3, $4)`,
      [projectId, ownerKey, assetType, assetPayload]
    );
  }
}

export async function saveRegenerationEvents(projectId, ownerKey, memory) {
  for (const reason of memory.slice(0, 8)) {
    await getPool().query(
      `insert into regeneration_events (project_id, owner_key, reason, event_payload)
       values ($1, $2, $3, $4)`,
      [projectId, ownerKey, reason, { source: "brandProfile.memory" }]
    );
  }
}

export async function saveExportEvent(payload) {
  await ensureSchema();
  const result = await getPool().query(
    `insert into export_events (project_id, owner_key, export_target, export_payload)
     values ($1, $2, $3, $4)
     returning id, created_at`,
    [
      payload.projectId || null,
      payload.ownerKey,
      payload.exportTarget || "full-production",
      payload
    ]
  );
  return result.rows[0];
}
