import { getSql } from "@/lib/db";
import { logError } from "@/lib/errors";

type CountRow = { n: number };

async function countWhere(table: "signups" | "pageviews" | "sponsor_clicks" | "submissions" | "sponsor_inquiries" | "errors" | "entries", where: string): Promise<number> {
  const sql = getSql();
  const column =
    table === "signups" || table === "submissions" || table === "sponsor_inquiries"
      ? "created_at"
      : "ts";
  const rows =
    where === "all"
      ? await sql<CountRow[]>`SELECT count(*)::int AS n FROM ${sql(table)}`
      : where === "7"
        ? await sql<CountRow[]>`SELECT count(*)::int AS n FROM ${sql(table)} WHERE ${sql(column)} >= now() - interval '7 days'`
        : await sql<CountRow[]>`SELECT count(*)::int AS n FROM ${sql(table)} WHERE ${sql(column)} >= now() - interval '30 days'`;
  return Number(rows[0]?.n ?? 0);
}

export type PublicStats = {
  signups: number;
  pageviews30: number;
  entries: number;
};

export async function publicStats(): Promise<PublicStats | null> {
  try {
    const sql = getSql();
    const signups = await sql<CountRow[]>`SELECT count(*)::int AS n FROM signups`;
    const pageviews = await sql<CountRow[]>`
      SELECT count(*)::int AS n FROM pageviews WHERE ts >= now() - interval '30 days'
    `;
    const entries = await sql<CountRow[]>`SELECT count(*)::int AS n FROM entries`;
    return {
      signups: Number(signups[0]?.n ?? 0),
      pageviews30: Number(pageviews[0]?.n ?? 0),
      entries: Number(entries[0]?.n ?? 0),
    };
  } catch (error) {
    await logError(error, "/sponsor");
    return null;
  }
}

export type PathCount = { path: string; views: number };

export type AdminStats = {
  entries: number;
  signups: { total: number; d7: number; d30: number };
  pageviews: { total: number; d7: number; d30: number; top_paths_7d: PathCount[]; top_paths_30d: PathCount[] };
  sponsor_clicks: { total: number; d7: number; d30: number };
  submissions: { pending: number; total: number; d7: number; d30: number };
  inquiries: { total: number; d7: number; d30: number };
  errors: { total: number; d7: number; d30: number };
};

async function topPaths(days: 7 | 30): Promise<PathCount[]> {
  const rows = await getSql()<Array<{ path: string; views: number }>>`
    SELECT path, count(*)::int AS views
    FROM pageviews
    WHERE ts >= now() - make_interval(days => ${days})
    GROUP BY path
    ORDER BY views DESC, path
    LIMIT 10
  `;
  return rows.map((row) => ({ path: row.path, views: Number(row.views) }));
}

export async function adminStats(): Promise<AdminStats> {
  const sql = getSql();
  const entries = Number((await sql<CountRow[]>`SELECT count(*)::int AS n FROM entries`)[0]?.n ?? 0);
  const pending = Number(
    (await sql<CountRow[]>`SELECT count(*)::int AS n FROM submissions WHERE status = 'pending'`)[0]?.n ?? 0,
  );

  return {
    entries,
    signups: {
      total: await countWhere("signups", "all"),
      d7: await countWhere("signups", "7"),
      d30: await countWhere("signups", "30"),
    },
    pageviews: {
      total: await countWhere("pageviews", "all"),
      d7: await countWhere("pageviews", "7"),
      d30: await countWhere("pageviews", "30"),
      top_paths_7d: await topPaths(7),
      top_paths_30d: await topPaths(30),
    },
    sponsor_clicks: {
      total: await countWhere("sponsor_clicks", "all"),
      d7: await countWhere("sponsor_clicks", "7"),
      d30: await countWhere("sponsor_clicks", "30"),
    },
    submissions: {
      pending,
      total: await countWhere("submissions", "all"),
      d7: await countWhere("submissions", "7"),
      d30: await countWhere("submissions", "30"),
    },
    inquiries: {
      total: await countWhere("sponsor_inquiries", "all"),
      d7: await countWhere("sponsor_inquiries", "7"),
      d30: await countWhere("sponsor_inquiries", "30"),
    },
    errors: {
      total: await countWhere("errors", "all"),
      d7: await countWhere("errors", "7"),
      d30: await countWhere("errors", "30"),
    },
  };
}
