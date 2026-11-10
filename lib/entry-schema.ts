import type { EnergyDashboard, Entry, Integration } from "@/lib/types";
import { cleanText, isHttpUrl, slugPattern } from "@/lib/text";

export type ParseResult = { ok: true; entry: Entry } | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseIntegration(value: unknown, index: number): Integration | string {
  const record = asRecord(value);
  if (!record) return `Integration ${index + 1} must be an object`;
  const route = cleanText(record.route, 80);
  const name = cleanText(record.name, 160);
  const url = cleanText(record.url, 500);
  if (!route || !name || !url) return `Integration ${index + 1} needs route, name, and url`;
  if (!isHttpUrl(url)) return `Integration ${index + 1} url must be http or https`;
  return { route, name, url };
}

export function parseEntry(value: unknown): ParseResult {
  const record = asRecord(value);
  if (!record) return { ok: false, error: "Entry must be a JSON object" };

  const slug = cleanText(record.slug, 80);
  const brand = cleanText(record.brand, 80);
  const model = cleanText(record.model, 200);
  const type = cleanText(record.type, 80);
  const local = cleanText(record.local, 300);
  const control = cleanText(record.control, 400);
  const gotchas = cleanText(record.gotchas, 2000);
  const energy = cleanText(record.energy_dashboard, 20);
  const lastVerified = cleanText(record.last_verified, 10);

  if (!slugPattern(slug)) return { ok: false, error: "Slug must be lowercase words separated by hyphens" };
  if (!brand) return { ok: false, error: "Brand is required" };
  if (!model) return { ok: false, error: "Model is required" };
  if (!type) return { ok: false, error: "Type is required" };
  if (!local) return { ok: false, error: "Local/cloud field is required" };
  if (!control) return { ok: false, error: "Control field is required" };
  if (energy !== "y" && energy !== "partial" && energy !== "n") {
    return { ok: false, error: "energy_dashboard must be y, partial, or n" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastVerified)) {
    return { ok: false, error: "last_verified must be YYYY-MM-DD" };
  }

  if (!Array.isArray(record.integrations)) return { ok: false, error: "integrations must be an array" };
  if (record.integrations.length > 12) return { ok: false, error: "Too many integrations" };
  const integrations: Integration[] = [];
  for (let index = 0; index < record.integrations.length; index += 1) {
    const parsed = parseIntegration(record.integrations[index], index);
    if (typeof parsed === "string") return { ok: false, error: parsed };
    integrations.push(parsed);
  }

  if (!Array.isArray(record.sources)) return { ok: false, error: "sources must be an array" };
  if (record.sources.length < 1 || record.sources.length > 12) {
    return { ok: false, error: "Provide between 1 and 12 source URLs" };
  }
  const sources: string[] = [];
  for (const source of record.sources) {
    const url = cleanText(source, 500);
    if (!isHttpUrl(url)) return { ok: false, error: "Every source must be an http or https URL" };
    sources.push(url);
  }

  const entry: Entry = {
    slug,
    brand,
    model,
    type,
    integrations,
    local,
    control,
    energy_dashboard: energy as EnergyDashboard,
    gotchas,
    sources,
    last_verified: lastVerified,
  };
  return { ok: true, entry };
}
