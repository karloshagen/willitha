import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

export function logoLockupSrc(): string {
  if (!cached) {
    const png = readFileSync(join(process.cwd(), "public/logo-lockup.png"));
    cached = `data:image/png;base64,${png.toString("base64")}`;
  }
  return cached;
}
