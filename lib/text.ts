export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugPattern(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function oneParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : "";
}

export function safeReferrer(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return null;
  }
}

export function referrerHost(value: string | null): string | null {
  if (!value) return null;
  const host = value.trim().toLowerCase();
  if (!/^[a-z0-9.-]{1,253}$/.test(host) || host.includes("..")) return null;
  return host;
}

export function safeInternalPath(value: string, fallback: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  const path = value.split("#")[0]?.split("?")[0] ?? fallback;
  if (!/^\/[a-zA-Z0-9/_-]{0,200}$/.test(path)) return fallback;
  return value.slice(0, 300);
}
