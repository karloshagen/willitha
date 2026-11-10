import { readFileSync } from "node:fs";
import { createSql } from "../lib/db";
import { loadEnvFiles } from "./load-env";

loadEnvFiles();

async function main() {
  const sql = createSql();
  try {
    const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
    await sql.unsafe(schema);
    console.log("Migration applied.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
