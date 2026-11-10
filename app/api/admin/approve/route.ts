import { NextResponse } from "next/server";
import { AdminError, adminJson, readJson } from "@/lib/admin";
import { getSql } from "@/lib/db";
import { parseEntry } from "@/lib/entry-schema";
import { upsertEntry } from "@/lib/entries";
import type { Entry } from "@/lib/types";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export const POST = adminJson(async (request) => {
  const body = asRecord(await readJson(request));
  const id = Number(body?.id);
  const action = body?.action;
  if (!Number.isInteger(id) || id <= 0) throw new AdminError("id must be a positive integer", 400);
  if (action !== "approve" && action !== "reject") {
    throw new AdminError("action must be approve or reject", 400);
  }

  let entry: Entry | null = null;
  if (action === "approve") {
    if (!body || !("entry" in body)) {
      throw new AdminError("Approve requires an entry object to upsert", 400);
    }
    const parsed = parseEntry(body.entry);
    if (!parsed.ok) throw new AdminError(parsed.error, 400);
    entry = parsed.entry;
  }

  const status = action === "approve" ? "approved" : "rejected";
  await getSql().begin(async (tx) => {
    const rows = await tx<Array<{ id: number | string; status: string }>>`
      SELECT id, status FROM submissions WHERE id = ${id} FOR UPDATE
    `;
    if (!rows[0]) throw new AdminError("Submission not found", 404);
    if (rows[0].status !== "pending") throw new AdminError("Submission is already reviewed", 409);
    if (entry) await upsertEntry(tx, entry);
    await tx`
      UPDATE submissions
      SET status = ${status}, reviewed_at = now()
      WHERE id = ${id}
    `;
  });

  return NextResponse.json({ ok: true, id, status, slug: entry?.slug ?? null });
});
