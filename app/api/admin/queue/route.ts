import { NextResponse } from "next/server";
import { adminJson } from "@/lib/admin";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type QueueRow = {
  id: number | string;
  kind: string;
  slug: string | null;
  payload: unknown;
  status: string;
  created_at: Date | string;
};

export const GET = adminJson(async () => {
  const rows = await getSql()<QueueRow[]>`
    SELECT id, kind, slug, payload, status, created_at
    FROM submissions
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 200
  `;
  return NextResponse.json({
    submissions: rows.map((row) => ({
      id: Number(row.id),
      kind: row.kind,
      slug: row.slug,
      payload: row.payload,
      status: row.status,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    })),
  });
});
