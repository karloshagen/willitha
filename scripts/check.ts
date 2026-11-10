import { readFileSync } from "node:fs";
import { hasControl, isLocalOnly, localKind } from "../lib/classify";
import { checkEmail } from "../lib/email-address";
import { parseEntry } from "../lib/entry-schema";
import type { Entry } from "../lib/types";

const raw: unknown = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));
if (!Array.isArray(raw)) throw new Error("Seed file must be an array");

const entries: Entry[] = raw.map((item) => {
  const parsed = parseEntry(item);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.entry;
});

const brands = new Set(entries.map((entry) => entry.brand));
if (entries.length !== 44) throw new Error(`Expected 44 entries, got ${entries.length}`);
if (brands.size !== 21) throw new Error(`Expected 21 brands, got ${brands.size}`);

const slugs = new Set(entries.map((entry) => entry.slug));
if (slugs.size !== entries.length) throw new Error("Duplicate slugs in the seed");

const bySlug = Object.fromEntries(entries.map((entry) => [entry.slug, entry]));

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

expect(isLocalOnly(bySlug["enphase-iq-gateway"].local), "Envoy should count as local");
expect(!isLocalOnly(bySlug["growatt-sph"].local), "Growatt is cloud or local, not local only");
expect(localKind(bySlug["growatt-sph"].local) === "mixed", "Growatt should be mixed");
expect(!isLocalOnly(bySlug["tesla-powerwall-3"].local), "Powerwall 3 is limited local");
expect(localKind(bySlug["tesla-powerwall-3"].local) === "limited", "Powerwall 3 limited");
expect(!isLocalOnly(bySlug["sigenergy-sigenstor"].local), "SigenStor offers cloud");
expect(isLocalOnly(bySlug["goodwe-et"].local), "GoodWe ET is local");
expect(hasControl(bySlug["byd-lvs-victron"].control), "BYD on Victron has control");
expect(!hasControl(bySlug["byd-hvs-hvm-goodwe"].control), "BYD on GoodWe core is read-only");
expect(hasControl(bySlug["istore-battery"].control), "iStore battery has a local control path");
expect(!hasControl(bySlug["goodwe-lynx"].control), "Lynx via core is read-only");
expect(!hasControl(bySlug["byd-lvs-selectronic"].control), "Selectronic HA path is read-only");
expect(hasControl(bySlug["fronius-gen24"].control), "GEN24 partial control");
expect(!hasControl(bySlug["fronius-primo-symo"].control), "Primo is read-only");
expect(!hasControl(bySlug["sma-tripower-x"].control), "ennexOS has no known control");
expect(hasControl(bySlug["redback-smart-hybrid"].control) === false, "Redback control is unverified");

expect(checkEmail("ada@bigpond.com").ok, "bigpond should pass");
expect(checkEmail("ada@optusnet.com.au").ok, "optusnet should pass");
expect(checkEmail("Ada.News@Gmail.com").ok && checkEmail("Ada.News@Gmail.com").ok, "normalise case");
const gmail = checkEmail("Ada.News@Gmail.com");
expect(gmail.ok && gmail.email === "ada.news@gmail.com", "lowercase email");
expect(!checkEmail("test@gmail.com").ok, "test@ blocked");
expect(!checkEmail("test1@gmail.com").ok, "test1@ blocked");
expect(!checkEmail("owner+test@gmail.com").ok, "+test blocked");
expect(!checkEmail("owner+testing@gmail.com").ok, "+testing blocked");
expect(checkEmail("owner+news@gmail.com").ok, "+news allowed");
expect(!checkEmail("a@mailinator.com").ok, "mailinator blocked");
expect(!checkEmail("a@spam.mailinator.com").ok, "mailinator subdomain blocked");
expect(!checkEmail("a@example.com").ok, "example.com blocked");
expect(!checkEmail("not-an-email").ok, "invalid blocked");
expect(checkEmail("testing@gmail.com").ok, "testing@ is not test@");

console.log(`Seed ok: ${entries.length} entries, ${brands.size} brands.`);
