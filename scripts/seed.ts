import { readFileSync } from "node:fs";
import { createSql } from "../lib/db";
import { parseEntry } from "../lib/entry-schema";
import { upsertEntry } from "../lib/entries";
import { loadEnvFiles } from "./load-env";

loadEnvFiles();

async function main() {
  const file = new URL("../data/seed.json", import.meta.url);
  const raw: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(raw)) {
    throw new Error("Seed file must be a JSON array.");
  }

  const sql = createSql();
  try {
    for (const item of raw) {
      const parsed = parseEntry(item);
      if (!parsed.ok) throw new Error(parsed.error);
      await upsertEntry(sql, parsed.entry);
    }
    console.log(`Upserted ${raw.length} entries by slug.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
