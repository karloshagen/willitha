import { getSql } from "@/lib/db";
import { logError } from "@/lib/errors";
import { referrerHost } from "@/lib/text";

export const dynamic = "force-dynamic";

function sameSite(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) return false;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || referer;
  if (!candidate) return false;
  try {
    return new URL(candidate).host === host;
  } catch {
    return false;
  }
}

function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 300) return null;
  if (path.startsWith("/api") || path.startsWith("/_next")) return null;
  if (!/^\/[A-Za-z0-9/_\-.]*$/.test(path)) return null;
  return path;
}

export async function POST(request: Request) {
  if (!sameSite(request)) return new Response(null, { status: 204 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const path = cleanPath(record.path);
  if (!path) return new Response(null, { status: 204 });
  const host = referrerHost(typeof record.referrer_host === "string" ? record.referrer_host : null);
  try {
    await getSql()`
      INSERT INTO pageviews (path, referrer_host)
      VALUES (${path}, ${host})
    `;
  } catch (error) {
    await logError(error, path);
  }
  return new Response(null, { status: 204 });
}
