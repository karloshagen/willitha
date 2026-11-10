import { NextResponse } from "next/server";
import { adminJson } from "@/lib/admin";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchRow = {
  query: string;
  count: number;
  last_seen: Date | string;
  filters: unknown;
};

export const GET = adminJson(async () => {
  const rows = await getSql()<SearchRow[]>`
    SELECT query,
           count(*)::int AS count,
           max(ts) AS last_seen,
           (array_agg(filters ORDER BY ts DESC))[1] AS filters
    FROM zero_result_searches
    GROUP BY query
    ORDER BY count DESC, last_seen DESC
    LIMIT 50
  `;
  return NextResponse.json({
    searches: rows.map((row) => ({
      query: row.query,
      count: Number(row.count),
      last_seen: row.last_seen instanceof Date ? row.last_seen.toISOString() : String(row.last_seen),
      filters: row.filters,
    })),
  });
});
