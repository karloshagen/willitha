import { brandSlug } from "@/lib/classify";

export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "https://willitha.au").trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "https://willitha.au";
    }
    return url.origin;
  } catch {
    return "https://willitha.au";
  }
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function entryPath(slug: string): string {
  return `/entry/${slug}`;
}

export function testedPath(slug: string): string {
  return `/tested/${slug}`;
}

export function brandPath(brand: string): string {
  return `/brand/${brandSlug(brand)}`;
}

export function goPath(slug: string, from: string): string {
  const params = new URLSearchParams({ from });
  return `/go/${encodeURIComponent(slug)}?${params.toString()}`;
}

export function sydneyToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function sydneyWeekStart(today = sydneyToday()): string {
  const [year, month, day] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  const weekday = utc.getUTCDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  utc.setUTCDate(utc.getUTCDate() - mondayOffset);
  return utc.toISOString().slice(0, 10);
}

export function formatAuDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "Not recorded";
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
