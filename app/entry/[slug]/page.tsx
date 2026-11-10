import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, BadgeRow } from "@/components/badges";
import { TestedBadge } from "@/components/review-card";
import { controlLabel, energyDetail, localLabel, routeLabel, routeTone } from "@/lib/classify";
import { getEntry } from "@/lib/entries";
import { getPublishedReviewForEntry } from "@/lib/reviews";
import { brandPath, entryPath, formatAuDate, testedPath } from "@/lib/site";
import type { Entry } from "@/lib/types";

function describe(entry: Entry): string {
  const energy =
    entry.energy_dashboard === "y"
      ? "Energy Dashboard ready"
      : entry.energy_dashboard === "partial"
        ? "partial Energy Dashboard support"
        : "no Energy Dashboard support";
  return `${entry.brand} ${entry.model} (${entry.type}) on Home Assistant: ${localLabel(entry.local).toLowerCase()}, ${controlLabel(entry.control).toLowerCase()}, ${energy}. ${entry.gotchas}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) {
    return { title: "Model not found" };
  }
  return {
    title: `${entry.brand} ${entry.model}`,
    description: describe(entry),
    alternates: { canonical: entryPath(entry.slug) },
    openGraph: {
      title: `${entry.brand} ${entry.model}`,
      description: describe(entry),
      url: entryPath(entry.slug),
    },
  };
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (entry === null) {
    return <p className="rounded-2xl border border-line bg-card px-4 py-3">The directory cannot reach its database just now.</p>;
  }
  if (!entry) notFound();
  const homeTest = await getPublishedReviewForEntry(entry.slug);

  const correction = `/submit?kind=correction&slug=${encodeURIComponent(entry.slug)}&brand=${encodeURIComponent(entry.brand)}&model=${encodeURIComponent(entry.model)}`;

  return (
    <article className="mx-auto grid max-w-3xl gap-6">
      <p className="text-sm text-muted">
        <Link href="/search" className="font-semibold text-eucalyptus">
          Directory
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={brandPath(entry.brand)} className="font-semibold text-eucalyptus">
          {entry.brand}
        </Link>
      </p>
      <header>
        <p className="text-sm font-semibold text-muted">{entry.type}</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">{entry.model}</h1>
        <p className="mt-2 text-sm text-muted">Last verified {formatAuDate(entry.last_verified)}</p>
        <BadgeRow entry={entry} className="mt-4" />
        {homeTest ? (
          <p className="mt-4">
            <Link href={testedPath(homeTest.slug)} className="inline-flex flex-wrap items-center gap-2">
              <TestedBadge />
              <span className="text-sm font-semibold text-eucalyptus">Read the home test</span>
            </Link>
          </p>
        ) : null}
      </header>

      <section className="grid gap-3 rounded-2xl border border-line bg-card p-4">
        <h2 className="font-display text-xl">At a glance</h2>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-semibold">Local or cloud</dt>
            <dd className="text-muted">{entry.local}</dd>
          </div>
          <div>
            <dt className="font-semibold">Control</dt>
            <dd className="text-muted">{entry.control}</dd>
          </div>
          <div>
            <dt className="font-semibold">Energy Dashboard</dt>
            <dd className="text-muted">{energyDetail(entry.energy_dashboard)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl">Integrations</h2>
        {entry.integrations.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No integration is listed for this model.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {entry.integrations.map((integration) => (
              <li key={`${integration.route}-${integration.url}`} className="rounded-2xl border border-line bg-card p-3">
                <Badge tone={routeTone(integration.route)}>{routeLabel(integration.route)}</Badge>
                <a href={integration.url} className="mt-2 block font-semibold text-eucalyptus underline-offset-2 hover:underline" rel="noreferrer">
                  {integration.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl">Gotchas</h2>
        <p className="mt-2 leading-relaxed">{entry.gotchas || "None recorded."}</p>
      </section>

      <section>
        <h2 className="font-display text-xl">Sources</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {entry.sources.map((source) => (
            <li key={source}>
              <a href={source} className="break-all text-eucalyptus underline-offset-2 hover:underline" rel="noreferrer">
                {source}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p>
        <Link href={correction} className="font-semibold text-eucalyptus">
          Suggest a correction
        </Link>
      </p>
    </article>
  );
}
