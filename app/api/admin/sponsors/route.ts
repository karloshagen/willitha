import { NextResponse } from "next/server";
import { AdminError, adminJson, readJson } from "@/lib/admin";
import { listLinks, listSponsorWeeks, upsertLink, upsertSponsorWeek } from "@/lib/sponsors";
import { cleanText, isHttpUrl, slugPattern } from "@/lib/text";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export const GET = adminJson(async () => {
  const [weeks, links] = await Promise.all([listSponsorWeeks(), listLinks()]);
  return NextResponse.json({ weeks, links });
});

export const POST = adminJson(async (request) => {
  const body = asRecord(await readJson(request));
  if (!body?.link && !body?.week) throw new AdminError("Provide a link, a week, or both", 400);

  let link = null;
  let week = null;

  if (body.link) {
    const record = asRecord(body.link);
    const slug = cleanText(record?.slug, 80);
    const url = cleanText(record?.url, 500);
    const sponsorName = cleanText(record?.sponsor_name, 120);
    if (!slugPattern(slug)) throw new AdminError("Link slug must be lowercase words separated by hyphens", 400);
    if (!isHttpUrl(url)) throw new AdminError("Link url must be http or https", 400);
    if (!sponsorName) throw new AdminError("Link sponsor_name is required", 400);
    await upsertLink({ slug, url, sponsor_name: sponsorName });
    link = { slug, url, sponsor_name: sponsorName };
  }

  if (body.week) {
    const record = asRecord(body.week);
    const weekStart = cleanText(record?.week_start, 10);
    const sponsorName = cleanText(record?.sponsor_name, 120);
    const urlSlug = cleanText(record?.url_slug, 80);
    const blurb = cleanText(record?.blurb, 180);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) throw new AdminError("week_start must be YYYY-MM-DD", 400);
    if (!sponsorName) throw new AdminError("Week sponsor_name is required", 400);
    if (!slugPattern(urlSlug)) throw new AdminError("url_slug must match a link slug", 400);
    week = await upsertSponsorWeek({
      week_start: weekStart,
      sponsor_name: sponsorName,
      url_slug: urlSlug,
      blurb,
    });
  }

  return NextResponse.json({ ok: true, link, week });
});
