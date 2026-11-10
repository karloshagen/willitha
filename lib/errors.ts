let logging = false;

function redact(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "postgres://[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .slice(0, 4000);
}

function shouldIgnore(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("digest" in error)) return false;
  const digest = String((error as { digest: unknown }).digest);
  return (
    digest.startsWith("NEXT_REDIRECT") ||
    digest === "NEXT_NOT_FOUND" ||
    digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return redact(error.message);
  return redact(String(error));
}

export async function logError(error: unknown, path?: string | null): Promise<void> {
  if (logging || shouldIgnore(error)) return;
  logging = true;
  try {
    const { databaseUrl, getSql } = await import("@/lib/db");
    if (!databaseUrl()) return;
    const message = errorMessage(error);
    const stack = error instanceof Error && error.stack ? redact(error.stack).slice(0, 4000) : null;
    const cleanPath = path ? path.split("?")[0]?.slice(0, 300) ?? null : null;
    await getSql()`
      INSERT INTO errors (message, stack, path)
      VALUES (${message}, ${stack}, ${cleanPath})
    `;
  } catch {
    console.error("Could not store an error log");
  } finally {
    logging = false;
  }
}
