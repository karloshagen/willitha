import { Resend } from "resend";
import { logError } from "@/lib/errors";

export async function addSignupToAudience(email: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return null;

  try {
    const resend = new Resend(apiKey);
    const created = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: audienceId }],
    });
    if (!created.error && created.data?.id) return created.data.id;

    const added = await resend.contacts.segments.add({
      email,
      segmentId: audienceId,
    });
    if (!added.error) return null;

    const legacy = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (legacy.error) {
      await logError(new Error(`Resend contact was not saved: ${legacy.error.message}`), "/signup");
      return null;
    }
    return legacy.data?.id ?? null;
  } catch (error) {
    await logError(error, "/signup");
    return null;
  }
}

export async function sendSponsorInquiry(input: {
  id: number;
  name: string;
  company: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const recipients = [process.env.OWNER_EMAIL, process.env.CEO_EMAIL].filter(
    (value): value is string => Boolean(value && value.trim()),
  );
  if (!apiKey || !from || recipients.length === 0) return false;

  const text = [
    "New sponsor enquiry from the Will It HA site.",
    "",
    `Name: ${input.name}`,
    `Company: ${input.company || "(none)"}`,
    `Email: ${input.email}`,
    "",
    input.message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send(
      {
        from,
        to: recipients,
        replyTo: input.email,
        subject: `Will It HA sponsor enquiry from ${input.company || input.name}`,
        text,
      },
      { idempotencyKey: `sponsor-inquiry/${input.id}` },
    );
    if (error) {
      await logError(new Error(`Sponsor enquiry email failed: ${error.message}`), "/sponsor");
      return false;
    }
    return true;
  } catch (error) {
    await logError(error, "/sponsor");
    return false;
  }
}
