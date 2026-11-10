import { NextResponse } from "next/server";
import { AdminError, adminJson, readJson } from "@/lib/admin";
import { getSql } from "@/lib/db";
import { parseEntry } from "@/lib/entry-schema";
import { upsertEntry } from "@/lib/entries";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export const POST = adminJson(async (request) => {
  const body = await readJson(request);
  const record = asRecord(body);
  const list = record && Array.isArray(record.entries) ? record.entries : [record && "entry" in record ? record.entry : body];
  if (list.length === 0) throw new AdminError("Provide an entry", 400);
  if (list.length > 100) throw new AdminError("Too many entries", 400);

  const slugs: string[] = [];
  const sql = getSql();
  for (const item of list) {
    const parsed = parseEntry(item);
    if (!parsed.ok) throw new AdminError(parsed.error, 400);
    await upsertEntry(sql, parsed.entry);
    slugs.push(parsed.entry.slug);
  }
  return NextResponse.json({ ok: true, slugs });
});
