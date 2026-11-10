"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { checkEmail } from "@/lib/email-address";
import { getSql } from "@/lib/db";
import { logError } from "@/lib/errors";
import { overRateLimit } from "@/lib/rate-limit";
import { addSignupToAudience, sendSponsorInquiry } from "@/lib/resend-mail";
import { cleanText } from "@/lib/text";

function nextPath(formData: FormData, fallback: string): string {
  const value = cleanText(formData.get("next"), 300);
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

function honeypotFilled(formData: FormData): boolean {
  return cleanText(formData.get("company_website"), 200).length > 0;
}

export async function signUp(formData: FormData) {
  const destination = nextPath(formData, "/");
  const fail = (code: string): never => {
    const url = new URL(destination, "https://willitha.au");
    url.searchParams.set("signup", code);
    redirect(`${url.pathname}${url.search}`);
  };

  if (honeypotFilled(formData)) {
    const url = new URL(destination, "https://willitha.au");
    url.searchParams.set("signedup", "1");
    redirect(`${url.pathname}${url.search}`);
  }

  const checked = checkEmail(cleanText(formData.get("email"), 254));
  if (!checked.ok) fail(checked.reason);
  if (!checked.ok) return;
  const email = checked.email;

  try {
    if (await overRateLimit("signup", 8)) fail("rate");
    const inserted = await getSql()<Array<{ id: number }>>`
      INSERT INTO signups (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    const contactId = await addSignupToAudience(email);
    if (contactId) {
      await getSql()`
        UPDATE signups
        SET resend_contact_id = ${contactId}
        WHERE email = ${email} AND resend_contact_id IS NULL
      `;
    }
    if (inserted.length === 0) fail("exists");
  } catch (error) {
    unstable_rethrow(error);
    await logError(error, "/signup");
    fail("error");
  }

  const url = new URL(destination, "https://willitha.au");
  url.searchParams.set("signedup", "1");
  redirect(`${url.pathname}${url.search}`);
}

export async function submitDevice(formData: FormData) {
  if (honeypotFilled(formData)) redirect("/submit?ok=1");

  const kind = cleanText(formData.get("kind"), 20) === "correction" ? "correction" : "new";
  const payload = {
    kind,
    slug: cleanText(formData.get("slug"), 80),
    brand: cleanText(formData.get("brand"), 80),
    model: cleanText(formData.get("model"), 200),
    type: cleanText(formData.get("type"), 80),
    local: cleanText(formData.get("local"), 300),
    control: cleanText(formData.get("control"), 400),
    energy_dashboard: cleanText(formData.get("energy_dashboard"), 20),
    integrations: cleanText(formData.get("integrations"), 2000),
    gotchas: cleanText(formData.get("gotchas"), 2000),
    sources: cleanText(formData.get("sources"), 2000),
    notes: cleanText(formData.get("notes"), 2000),
    email: cleanText(formData.get("email"), 254),
  };

  const hasSubstance = Boolean(payload.gotchas || payload.notes || payload.sources || payload.integrations);
  if (!payload.brand || !payload.model || !payload.type || !hasSubstance) {
    redirect("/submit?error=invalid");
  }
  if (kind === "correction" && !payload.slug) redirect("/submit?error=invalid");

  try {
    if (await overRateLimit("submit", 5)) redirect("/submit?error=rate");
    await getSql()`
      INSERT INTO submissions (kind, slug, payload)
      VALUES (${kind}, ${payload.slug || null}, ${getSql().json(payload)})
    `;
  } catch (error) {
    unstable_rethrow(error);
    await logError(error, "/submit");
    redirect("/submit?error=unavailable");
  }

  redirect("/submit?ok=1");
}

export async function submitSponsorInquiry(formData: FormData) {
  if (honeypotFilled(formData)) redirect("/sponsor?ok=1");

  const name = cleanText(formData.get("name"), 120);
  const company = cleanText(formData.get("company"), 160);
  const emailRaw = cleanText(formData.get("email"), 254);
  const message = cleanText(formData.get("message"), 4000);
  const email = checkEmail(emailRaw);
  if (!name || !message || message.length < 12 || !email.ok) {
    redirect("/sponsor?error=invalid");
  }

  try {
    if (await overRateLimit("sponsor", 5)) redirect("/sponsor?error=rate");
    const rows = await getSql()<Array<{ id: number }>>`
      INSERT INTO sponsor_inquiries (name, company, email, message)
      VALUES (${name}, ${company || null}, ${email.email}, ${message})
      RETURNING id
    `;
    const id = Number(rows[0]?.id);
    if (id) {
      await sendSponsorInquiry({ id, name, company, email: email.email, message });
    }
  } catch (error) {
    unstable_rethrow(error);
    await logError(error, "/sponsor");
    redirect("/sponsor?error=unavailable");
  }

  redirect("/sponsor?ok=1");
}
