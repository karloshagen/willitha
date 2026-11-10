import { getSql } from "@/lib/db";
import { logError } from "@/lib/errors";
import { sydneyToday, sydneyWeekStart } from "@/lib/site";
import type { CurrentSponsor, SponsorLink, SponsorWeek } from "@/lib/types";

function dateOnly(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export async function getCurrentSponsor(): Promise<CurrentSponsor> {
  const house: CurrentSponsor = { kind: "house", id: `house:${sydneyWeekStart()}` };
  try {
    const today = sydneyToday();
    const weeks = await getSql()<
      Array<{ week_start: string | Date; sponsor_name: string; url_slug: string; blurb: string }>
    >`
      SELECT week_start, sponsor_name, url_slug, blurb
      FROM sponsor_weeks
      WHERE week_start <= ${today}::date
        AND week_start + 7 > ${today}::date
      ORDER BY week_start DESC
      LIMIT 1
    `;
    const week = weeks[0];
    if (!week) return house;
    const links = await getSql()<Array<{ slug: string }>>`
      SELECT slug FROM links WHERE slug = ${week.url_slug} LIMIT 1
    `;
    if (!links[0]) return house;
    const weekStart = dateOnly(week.week_start);
    return {
      kind: "sponsor",
      id: `sponsor:${weekStart}:${week.url_slug}`,
      name: week.sponsor_name,
      blurb: week.blurb,
      slug: week.url_slug,
      weekStart,
    };
  } catch (error) {
    await logError(error);
    return house;
  }
}

export async function listSponsorWeeks(): Promise<SponsorWeek[]> {
  const rows = await getSql()<
    Array<{ id: number; week_start: string | Date; sponsor_name: string; url_slug: string; blurb: string }>
  >`
    SELECT id, week_start, sponsor_name, url_slug, blurb
    FROM sponsor_weeks
    ORDER BY week_start DESC
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    week_start: dateOnly(row.week_start),
    sponsor_name: row.sponsor_name,
    url_slug: row.url_slug,
    blurb: row.blurb,
  }));
}

export async function listLinks(): Promise<SponsorLink[]> {
  return getSql()<SponsorLink[]>`
    SELECT slug, url, sponsor_name
    FROM links
    ORDER BY sponsor_name, slug
  `;
}

export async function upsertLink(link: SponsorLink): Promise<void> {
  await getSql()`
    INSERT INTO links (slug, url, sponsor_name)
    VALUES (${link.slug}, ${link.url}, ${link.sponsor_name})
    ON CONFLICT (slug) DO UPDATE SET
      url = EXCLUDED.url,
      sponsor_name = EXCLUDED.sponsor_name
  `;
}

export async function upsertSponsorWeek(week: Omit<SponsorWeek, "id">): Promise<SponsorWeek> {
  const rows = await getSql()<
    Array<{ id: number; week_start: string | Date; sponsor_name: string; url_slug: string; blurb: string }>
  >`
    INSERT INTO sponsor_weeks (week_start, sponsor_name, url_slug, blurb)
    VALUES (${week.week_start}::date, ${week.sponsor_name}, ${week.url_slug}, ${week.blurb})
    ON CONFLICT (week_start) DO UPDATE SET
      sponsor_name = EXCLUDED.sponsor_name,
      url_slug = EXCLUDED.url_slug,
      blurb = EXCLUDED.blurb
    RETURNING id, week_start, sponsor_name, url_slug, blurb
  `;
  const row = rows[0];
  return {
    id: Number(row.id),
    week_start: dateOnly(row.week_start),
    sponsor_name: row.sponsor_name,
    url_slug: row.url_slug,
    blurb: row.blurb,
  };
}

export async function findLink(slug: string): Promise<SponsorLink | undefined> {
  const rows = await getSql()<SponsorLink[]>`
    SELECT slug, url, sponsor_name FROM links WHERE slug = ${slug} LIMIT 1
  `;
  return rows[0];
}

export async function logSponsorClick(input: {
  slug: string;
  referrer: string | null;
  path: string;
}): Promise<void> {
  await getSql()`
    INSERT INTO sponsor_clicks (slug, referrer, path)
    VALUES (${input.slug}, ${input.referrer}, ${input.path})
  `;
}
