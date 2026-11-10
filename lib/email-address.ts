import { isDisposableDomain } from "@/lib/disposable-domains";

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "blocked" };

export function checkEmail(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, reason: "invalid" };
  }

  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const base = local.split("+")[0] ?? local;
  const tags = local.split("+").slice(1);

  if (base === "test" || /^test\d+$/.test(base)) {
    return { ok: false, reason: "blocked" };
  }
  if (tags.some((tag) => tag === "test" || tag.startsWith("test"))) {
    return { ok: false, reason: "blocked" };
  }
  if (isDisposableDomain(domain)) {
    return { ok: false, reason: "blocked" };
  }

  return { ok: true, email };
}
