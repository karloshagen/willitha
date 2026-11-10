import type { EnergyDashboard, Entry, Integration } from "@/lib/types";

const ROUTE_RANK = [
  "official core integration",
  "HACS custom integration",
  "Modbus TCP or RS485",
  "cloud API only",
  "none known",
];

export function brandSlug(brand: string): string {
  return brand
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type LocalKind = "local" | "mixed" | "cloud" | "limited" | "unknown";

export function localKind(local: string): LocalKind {
  const value = local.trim().toLowerCase();
  if (value.startsWith("limited")) return "limited";
  if (!value || value === "unverified" || value.startsWith("unverified")) return "unknown";

  const hasLocal = /\blocal\b/.test(value);
  const hasCloud = /\bcloud\b/.test(value);
  if (hasLocal && hasCloud) {
    const offersCloudPath = /(\bor\b|\+|\;)\s*cloud\b/.test(value);
    if (value.startsWith("local") && !offersCloudPath && /\btoken\b/.test(value)) {
      return "local";
    }
    return "mixed";
  }
  if (hasLocal) return "local";
  if (hasCloud) return "cloud";
  return "unknown";
}

export function isLocalOnly(local: string): boolean {
  return localKind(local) === "local";
}

export function hasControl(control: string): boolean {
  const value = control.trim().toLowerCase();
  if (value.startsWith("control") || value.startsWith("partial")) return true;
  if (
    value.startsWith("read-only") ||
    value.startsWith("none") ||
    value.startsWith("unverified") ||
    value.length === 0
  ) {
    return false;
  }
  if (value.startsWith("via ")) {
    if (/integration is(?: still)? read-only/.test(value)) return false;
    if (/ha path is read-only/.test(value)) return false;
    return true;
  }
  return false;
}

export function primaryRoute(integrations: Integration[]): string {
  if (integrations.length === 0) return "none known";
  const routes = integrations.map((item) => item.route);
  for (const route of ROUTE_RANK) {
    if (routes.includes(route)) return route;
  }
  return routes[0] || "none known";
}

export function routeLabel(route: string): string {
  switch (route) {
    case "official core integration":
      return "Core integration";
    case "HACS custom integration":
      return "HACS custom";
    case "Modbus TCP or RS485":
      return "Modbus";
    case "cloud API only":
      return "Cloud only";
    case "none known":
      return "No integration";
    default:
      return route;
  }
}

export type BadgeTone = "good" | "mid" | "info" | "bad" | "neutral";

export function routeTone(route: string): BadgeTone {
  switch (route) {
    case "official core integration":
      return "good";
    case "HACS custom integration":
      return "mid";
    case "Modbus TCP or RS485":
      return "info";
    case "cloud API only":
      return "neutral";
    case "none known":
      return "bad";
    default:
      return "neutral";
  }
}

export function localLabel(local: string): string {
  switch (localKind(local)) {
    case "local":
      return "Local";
    case "mixed":
      return "Local or cloud";
    case "cloud":
      return "Cloud";
    case "limited":
      return "Limited local";
    default:
      return "Unverified";
  }
}

export function localTone(local: string): BadgeTone {
  switch (localKind(local)) {
    case "local":
      return "good";
    case "mixed":
    case "limited":
      return "mid";
    case "cloud":
      return "neutral";
    default:
      return "bad";
  }
}

export function controlLabel(control: string): string {
  const value = control.trim().toLowerCase();
  if (value.startsWith("control")) return "Control";
  if (value.startsWith("partial")) return "Partial control";
  if (value.startsWith("read-only")) return "Read-only";
  if (value.startsWith("via ") && !hasControl(control)) return "Via inverter · read-only";
  if (value.startsWith("via ")) return "Via inverter";
  if (value.startsWith("unverified")) return "Control unverified";
  if (value.startsWith("none")) return "No control known";
  return "See notes";
}

export function controlTone(control: string): BadgeTone {
  const value = control.trim().toLowerCase();
  if (value.startsWith("control")) return "good";
  if (value.startsWith("partial") || (value.startsWith("via ") && hasControl(control))) return "mid";
  if (value.startsWith("read-only") || (value.startsWith("via ") && !hasControl(control))) return "neutral";
  if (value.startsWith("unverified")) return "mid";
  return "bad";
}

export function energyLabel(energy: EnergyDashboard): string {
  switch (energy) {
    case "y":
      return "Energy Dashboard";
    case "partial":
      return "Energy partial";
    default:
      return "No Energy Dashboard";
  }
}

/** Plain status for the entry page, distinct from the row label. */
export function energyDetail(energy: string): string {
  switch (energy) {
    case "y":
      return "Yes";
    case "partial":
      return "Partial";
    case "n":
      return "No";
    default:
      return "Not confirmed";
  }
}

export function energyTone(energy: EnergyDashboard): BadgeTone {
  switch (energy) {
    case "y":
      return "good";
    case "partial":
      return "mid";
    default:
      return "bad";
  }
}

export function entryScore(entry: Entry): number {
  let score = 0;
  if (entry.energy_dashboard === "y") score += 4;
  else if (entry.energy_dashboard === "partial") score += 2;
  if (hasControl(entry.control)) score += 3;
  if (isLocalOnly(entry.local)) score += 3;
  else if (localKind(entry.local) === "mixed" || localKind(entry.local) === "limited") score += 1;
  if (entry.integrations.some((item) => item.route === "official core integration")) score += 1;
  return score;
}
