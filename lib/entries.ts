import { hasControl, isLocalOnly } from "@/lib/classify";
import { getSql, type Database } from "@/lib/db";
import { logError } from "@/lib/errors";
import type { EnergyDashboard, Entry, Integration, SearchFilters } from "@/lib/types";

type EntryRow = {
  slug: string;
  brand: string;
  model: string;
  type: string;
  integrations: unknown;
  local: string;
  control: string;
  energy_dashboard: string;
  gotchas: string;
  sources: unknown;
  last_verified: string | Date | null;
};

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function dateOnly(value: string | Date | null): string {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function mapIntegration(value: unknown): Integration | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.route !== "string" || typeof record.name !== "string" || typeof record.url !== "string") {
    return null;
  }
  return { route: record.route, name: record.name, url: record.url };
}

export function mapEntry(row: EntryRow): Entry {
  const energy: EnergyDashboard =
    row.energy_dashboard === "y" || row.energy_dashboard === "partial" || row.energy_dashboard === "n"
      ? row.energy_dashboard
      : "n";
  return {
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    type: row.type,
    integrations: asArray(row.integrations).flatMap((item) => {
      const integration = mapIntegration(item);
      return integration ? [integration] : [];
    }),
    local: row.local,
    control: row.control,
    energy_dashboard: energy,
    gotchas: row.gotchas ?? "",
    sources: asArray(row.sources).filter((item): item is string => typeof item === "string"),
    last_verified: dateOnly(row.last_verified),
  };
}

export async function upsertEntry(sql: Database, entry: Entry): Promise<void> {
  await sql`
    INSERT INTO entries (
      slug, brand, model, type, integrations, local, control,
      energy_dashboard, gotchas, sources, last_verified, updated_at
    ) VALUES (
      ${entry.slug},
      ${entry.brand},
      ${entry.model},
      ${entry.type},
      ${sql.json(entry.integrations)},
      ${entry.local},
      ${entry.control},
      ${entry.energy_dashboard},
      ${entry.gotchas},
      ${sql.json(entry.sources)},
      ${entry.last_verified},
      now()
    )
    ON CONFLICT (slug) DO UPDATE SET
      brand = EXCLUDED.brand,
      model = EXCLUDED.model,
      type = EXCLUDED.type,
      integrations = EXCLUDED.integrations,
      local = EXCLUDED.local,
      control = EXCLUDED.control,
      energy_dashboard = EXCLUDED.energy_dashboard,
      gotchas = EXCLUDED.gotchas,
      sources = EXCLUDED.sources,
      last_verified = EXCLUDED.last_verified,
      updated_at = now()
  `;
}

async function queryEntries(run: (sql: Database) => Promise<EntryRow[]>): Promise<Entry[] | null> {
  try {
    const rows = await run(getSql());
    return rows.map(mapEntry);
  } catch (error) {
    await logError(error);
    return null;
  }
}

export async function listEntries(): Promise<Entry[] | null> {
  return queryEntries((sql) => sql<EntryRow[]>`
    SELECT slug, brand, model, type, integrations, local, control,
           energy_dashboard, gotchas, sources, last_verified
    FROM entries
    ORDER BY brand, model
  `);
}

export async function getEntry(slug: string): Promise<Entry | null | undefined> {
  const rows = await queryEntries((sql) => sql<EntryRow[]>`
    SELECT slug, brand, model, type, integrations, local, control,
           energy_dashboard, gotchas, sources, last_verified
    FROM entries
    WHERE slug = ${slug}
    LIMIT 1
  `);
  if (rows === null) return null;
  return rows[0];
}

export async function listBrands(): Promise<string[] | null> {
  try {
    const rows = await getSql()<Array<{ brand: string }>>`
      SELECT DISTINCT brand FROM entries ORDER BY brand
    `;
    return rows.map((row) => row.brand);
  } catch (error) {
    await logError(error);
    return null;
  }
}

export async function listTypes(): Promise<string[] | null> {
  try {
    const rows = await getSql()<Array<{ type: string }>>`
      SELECT DISTINCT type FROM entries ORDER BY type
    `;
    return rows.map((row) => row.type);
  } catch (error) {
    await logError(error);
    return null;
  }
}

export async function listRoutes(): Promise<string[] | null> {
  try {
    const rows = await getSql()<Array<{ route: string }>>`
      SELECT DISTINCT item->>'route' AS route
      FROM entries, LATERAL jsonb_array_elements(integrations) AS item
      WHERE item->>'route' IS NOT NULL AND item->>'route' <> ''
      ORDER BY route
    `;
    const routes = rows.map((row) => row.route);
    if (!routes.includes("none known")) routes.push("none known");
    return routes;
  } catch (error) {
    await logError(error);
    return null;
  }
}

export async function entriesForBrand(brand: string): Promise<Entry[] | null> {
  return queryEntries((sql) => sql<EntryRow[]>`
    SELECT slug, brand, model, type, integrations, local, control,
           energy_dashboard, gotchas, sources, last_verified
    FROM entries
    WHERE brand = ${brand}
    ORDER BY model
  `);
}

export async function searchEntries(filters: SearchFilters): Promise<Entry[] | null> {
  const like = filters.q ? `%${filters.q.replace(/[%_\\]/g, "")}%` : "";
  const rows = await queryEntries((sql) => sql<EntryRow[]>`
    SELECT slug, brand, model, type, integrations, local, control,
           energy_dashboard, gotchas, sources, last_verified
    FROM entries
    WHERE TRUE
      ${like ? sql`AND (brand ILIKE ${like} OR model ILIKE ${like} OR type ILIKE ${like} OR gotchas ILIKE ${like})` : sql``}
      ${filters.type ? sql`AND type ILIKE ${filters.type}` : sql``}
      ${filters.brand ? sql`AND brand ILIKE ${filters.brand}` : sql``}
      ${filters.route ? sql`AND (
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(integrations) AS item
          WHERE item->>'route' = ${filters.route}
        )
        OR (${filters.route} = 'none known' AND jsonb_array_length(integrations) = 0)
      )` : sql``}
    ORDER BY brand, model
  `);
  if (!rows) return null;
  return rows.filter((entry) => {
    if (filters.localOnly && !isLocalOnly(entry.local)) return false;
    if (filters.hasControl && !hasControl(entry.control)) return false;
    return true;
  });
}

export function readFilters(raw: Record<string, string | string[] | undefined>): SearchFilters {
  const one = (key: string) => {
    const value = raw[key];
    const text = Array.isArray(value) ? value[0] : value;
    return (text ?? "").trim();
  };
  return {
    q: one("q").slice(0, 120),
    type: one("type").slice(0, 80),
    brand: one("brand").slice(0, 80),
    route: one("route").slice(0, 80),
    localOnly: one("local") === "1",
    hasControl: one("control") === "1",
  };
}

export function hasActiveSearch(filters: SearchFilters): boolean {
  return Boolean(
    filters.q || filters.type || filters.brand || filters.route || filters.localOnly || filters.hasControl,
  );
}

export function searchLabel(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(filters.q);
  if (filters.type) parts.push(`type:${filters.type}`);
  if (filters.brand) parts.push(`brand:${filters.brand}`);
  if (filters.route) parts.push(`route:${filters.route}`);
  if (filters.localOnly) parts.push("local-only");
  if (filters.hasControl) parts.push("has-control");
  return parts.join(" ").slice(0, 300);
}

export async function logZeroResult(filters: SearchFilters): Promise<void> {
  try {
    await getSql()`
      INSERT INTO zero_result_searches (query, filters)
      VALUES (${searchLabel(filters)}, ${getSql().json({ ...filters })})
    `;
  } catch (error) {
    await logError(error, "/search");
  }
}
