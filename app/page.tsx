import type { Metadata } from "next";
import Link from "next/link";
import { EntryCard } from "@/components/entry-card";
import { HomeSearch, SignupForm } from "@/components/forms";
import { entryScore } from "@/lib/classify";
import { listBrands, listEntries, listTypes } from "@/lib/entries";
import { brandPath } from "@/lib/site";
import { oneParam } from "@/lib/text";

export const metadata: Metadata = {
  title: { absolute: "Will It HA — Australian solar and battery Home Assistant compatibility" },
  description:
    "Australian batteries and inverters, rated for Home Assistant: local or cloud, control, and Energy Dashboard support.",
  alternates: { canonical: "/" },
};

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">{children}</p>;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const signedUp = oneParam(params.signedup) === "1";
  const signupError = oneParam(params.signup);
  const [entries, brands, types] = await Promise.all([listEntries(), listBrands(), listTypes()]);
  const featured = entries
    ? [...entries].sort((a, b) => entryScore(b) - entryScore(a) || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)).slice(0, 8)
    : null;

  return (
    <div className="grid min-w-0 gap-8">
      {signedUp ? <Notice>You are on the list. The weekly note is short and Australian.</Notice> : null}
      {signupError === "invalid" ? <Notice>Enter a valid email address.</Notice> : null}
      {signupError === "blocked" ? (
        <Notice>Use a real email address. Test and disposable addresses are not accepted.</Notice>
      ) : null}
      {signupError === "exists" ? <Notice>That address is already on the list.</Notice> : null}
      {signupError === "rate" ? <Notice>Too many attempts from this network. Try again in an hour.</Notice> : null}
      {signupError === "error" ? <Notice>The list could not be saved just now. Try again shortly.</Notice> : null}

      <section className="min-w-0">
        <p className="text-sm font-semibold text-eucalyptus">For Australian roofs</p>
        <h1 className="mt-1 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          Will it work with Home Assistant?
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-snug text-ink">
          Australian batteries and inverters, rated for local control, cloud lock-in, and the Energy Dashboard.
        </p>
        {entries ? (
          <p className="mt-2 text-sm text-muted">
            {entries.length} models · {brands?.length ?? 0} brands, including Sigenergy, GoodWe, iStore, Sungrow,
            Redback, and Selectronic.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">The directory cannot reach its database just now.</p>
        )}
        <div className="mt-5 max-w-2xl">
          <HomeSearch />
        </div>
        {types && types.length > 0 ? (
          <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
            {types.map((type) => (
              <Link
                key={type}
                href={`/search?type=${encodeURIComponent(type)}`}
                className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-eucalyptus"
              >
                {type}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="shortlist" className="min-w-0">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="shortlist" className="font-display text-2xl">
              A strong shortlist
            </h2>
            <p className="text-sm text-muted">Local control and Energy Dashboard support rank higher. Open a model for sources.</p>
          </div>
          <Link href="/search" className="shrink-0 text-sm font-semibold text-eucalyptus">
            Browse all
          </Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {featured.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        ) : (
          <Notice>{entries ? "The catalogue is empty right now." : "Entries will show once the database is connected."}</Notice>
        )}
      </section>

      {brands && brands.length > 0 ? (
        <section aria-labelledby="brands">
          <h2 id="brands" className="font-display text-2xl">
            Brands on Australian roofs
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {brands.map((brand) => (
              <li key={brand}>
                <Link href={brandPath(brand)} className="inline-flex min-h-10 items-center rounded-full bg-sand px-3 text-sm font-semibold">
                  {brand}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="signup" className="rounded-3xl border border-line bg-card px-4 py-5 sm:px-6">
        <h2 className="font-display text-2xl">The weekly note</h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
          Five Australian Home Assistant solar picks, plus the week’s sponsor. Easy to leave.
        </p>
        <SignupForm />
      </section>
    </div>
  );
}
