import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSql } from "@/lib/db";

async function clientKey(action: string): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  const digest = createHash("sha256").update(`willitha|${action}|${ip}`).digest("hex").slice(0, 32);
  return `${action}:${digest}`;
}

/** Returns true when the caller is over the hourly limit. The stored key is a hash, not an IP. */
export async function overRateLimit(action: string, limit: number): Promise<boolean> {
  const bucket = await clientKey(action);
  const rows = await getSql()<Array<{ hits: number }>>`
    INSERT INTO rate_limits (bucket, hits, window_start)
    VALUES (${bucket}, 1, now())
    ON CONFLICT (bucket) DO UPDATE SET
      hits = CASE
        WHEN rate_limits.window_start < now() - interval '1 hour' THEN 1
        ELSE rate_limits.hits + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < now() - interval '1 hour' THEN now()
        ELSE rate_limits.window_start
      END
    RETURNING hits
  `;
  return (rows[0]?.hits ?? 1) > limit;
}
