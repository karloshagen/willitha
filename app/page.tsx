import type { Metadata } from "next";
import Link from "next/link";
import { EntryCard } from "@/components/entry-card";
import { HomeSearch, SignupForm } from "@/components/forms";
import { ReviewCard } from "@/components/review-card";
import { entryScore } from "@/lib/classify";
import { listBrands, listEntries, listTypes } from "@/lib/entries";
import { listPublishedReviews } from "@/lib/reviews";
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
  const [entries, brands, types, reviews] = await Promise.all([
    listEntries(),
    listBrands(),
    listTypes(),
    listPublishedReviews(),
  ]);
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
        <p className="text-sm font-semibold text-eucalyptus">for Australian roofs</p>
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
        <div id="signup" className="mt-5 max-w-2xl rounded-2xl border border-line bg-card px-4 py-3">
          <p className="text-sm leading-snug">
            <span className="font-semibold">The weekly note.</span>{" "}
            <span className="text-muted">Five Australian picks, plus the week’s sponsor. Easy to leave.</span>
          </p>
          <SignupForm />
        </div>
        <div className="mt-5 max-w-2xl">
          <HomeSearch />
        </div>
        {types && types.length > 0 ? (
          <ul className="mt-3 flex max-w-full flex-wrap gap-2">
            {types.map((type) => (
              <li key={type}>
                <Link
                  href={`/search?type=${encodeURIComponent(type)}`}
                  className="inline-flex rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-eucalyptus"
                >
                  {type}
                </Link>
              </li>
            ))}
          </ul>
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

      <section aria-labelledby="tested" className="min-w-0">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="tested" className="font-display text-2xl">
              Tested at home
            </h2>
            <p className="text-sm text-muted">Hands-on notes from gear running at home, not from a brochure.</p>
          </div>
          <Link href="/tested" className="shrink-0 text-sm font-semibold text-eucalyptus">
            See all
          </Link>
        </div>
        {reviews === null ? (
          <Notice>Reviews are unavailable just now.</Notice>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-card px-5 py-6">
            <h3 className="font-display text-xl">First reviews coming soon</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Energy equipment first, then anything else on Home Assistant: CT clamps, smart plugs, hot water controllers, and sensors.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.slice(0, 2).map((review) => (
              <ReviewCard key={review.slug} review={review} />
            ))}
          </div>
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

    </div>
  );
}
