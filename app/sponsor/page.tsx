import type { Metadata } from "next";
import Link from "next/link";
import { SponsorInquiryForm } from "@/components/forms";
import { getCurrentSponsor } from "@/lib/sponsors";
import { publicStats } from "@/lib/stats";
import { goPath } from "@/lib/site";
import { oneParam } from "@/lib/text";

export const metadata: Metadata = {
  title: "Sponsor Will It HA",
  description:
    "Sponsor the weekly Australian Home Assistant solar newsletter and the site slot, from A$49 a week. No checkout on this page.",
  alternates: { canonical: "/sponsor" },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default async function SponsorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ok = oneParam(params.ok) === "1";
  const error = oneParam(params.error);
  const [stats, sponsor] = await Promise.all([publicStats(), getCurrentSponsor()]);
  const format = (value: number | undefined) => (typeof value === "number" ? value.toLocaleString("en-AU") : "—");

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <header>
        <p className="text-sm font-semibold text-ochre">From A$49/week</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">Sponsor Will It HA</h1>
        <p className="mt-3 text-lg leading-snug">
          A weekly newsletter for Australian Home Assistant solar owners, plus the sponsor slot on the site.
          No checkout here. Tell us what you want to sponsor and we will reply.
        </p>
      </header>

      <section aria-label="Live audience figures" className="grid gap-3 sm:grid-cols-3">
        <Stat label="Subscribers" value={format(stats?.signups)} />
        <Stat label="Page views, last 30 days" value={format(stats?.pageviews30)} />
        <Stat label="Directory entries" value={format(stats?.entries)} />
      </section>
      {stats === null ? (
        <p className="text-sm text-muted">Live figures appear once the database is connected.</p>
      ) : null}

      {sponsor.kind === "sponsor" ? (
        <p className="text-sm">
          This week:{" "}
          <Link href={goPath(sponsor.slug, "/sponsor")} className="font-semibold text-eucalyptus">
            {sponsor.name}
          </Link>
          {sponsor.blurb ? ` — ${sponsor.blurb}` : null}
        </p>
      ) : (
        <p className="text-sm text-muted">The sponsor slot is open this week.</p>
      )}

      <section className="rounded-3xl border border-line bg-card px-4 py-5 sm:px-6">
        <h2 className="font-display text-2xl">What you get</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
          <li>A line in the weekly email, linking through a tracked /go address.</li>
          <li>The closable sponsor bar on the site for seven days, Australia/Sydney time.</li>
          <li>A short blurb written for people choosing or already running a battery.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">Get in touch</h2>
        {ok ? (
          <p className="mt-3 rounded-2xl border border-line bg-eucalyptus-soft px-4 py-3 text-sm">
            Thanks. The enquiry is saved.
          </p>
        ) : null}
        {error === "invalid" ? (
          <p className="mt-3 rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
            Add your name, a real email address, and a short message.
          </p>
        ) : null}
        {error === "rate" ? (
          <p className="mt-3 rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
            Too many enquiries from this network. Try again in an hour.
          </p>
        ) : null}
        {error === "unavailable" ? (
          <p className="mt-3 rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
            The enquiry could not be saved just now. Try again shortly.
          </p>
        ) : null}
        <div className="mt-4">
          <SponsorInquiryForm />
        </div>
      </section>
    </div>
  );
}
