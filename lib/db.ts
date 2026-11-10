import postgres, { type Sql } from "postgres";

export type Database = Sql;

type SqlCache = { sql?: Sql };

const globalForSql = globalThis as typeof globalThis & { __willithaSql?: SqlCache };

function connectionTarget(url: string): { url: string; ssl: "require" | false } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const mode = parsed.searchParams.get("sslmode");
    parsed.searchParams.delete("sslmode");
    const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
    const ssl = local || mode === "disable" ? false : "require";
    return { url: parsed.toString(), ssl };
  } catch {
    return { url, ssl: "require" };
  }
}

export function databaseUrl(): string | null {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  return url || null;
}

export function createSql(url = databaseUrl()): Sql {
  if (!url) {
    throw new Error("DATABASE_URL or POSTGRES_URL is not set");
  }
  const target = connectionTarget(url);
  return postgres(target.url, {
    ssl: target.ssl,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
    onnotice: () => undefined,
    connection: { application_name: "willitha" },
    types: {
      date: {
        to: 1082,
        from: [1082],
        serialize: (value: string) => value,
        parse: (value: string) => value,
      },
    },
  });
}

export function getSql(): Sql {
  if (!globalForSql.__willithaSql) globalForSql.__willithaSql = {};
  if (!globalForSql.__willithaSql.sql) {
    globalForSql.__willithaSql.sql = createSql();
  }
  return globalForSql.__willithaSql.sql;
}
