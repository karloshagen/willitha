import type { Metadata } from "next";
import Link from "next/link";
import { EntryCard } from "@/components/entry-card";
import { HomeSearch, SignupForm } from "@/components/forms";
import { ReviewCard } from "@/components/review-card";
import { entryScore } from "@/lib/classify";
import { listBrands, listEntries } from "@/lib/entries";
import { listPublishedReviews } from "@/lib/reviews";
import { brandPath } from "@/lib/site";
import { oneParam } from "@/lib/text";

export const metadata: Metadata = {
  title: { absolute: "Will It HA — Home Assistant Compatibility - For Australians" },
  description:
    "Home Assistant Compatibility - For Australians. Batteries and inverters rated for local control, cloud lock-in, and the Energy Dashboard.",
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
  const [entries, brands, reviews] = await Promise.all([listEntries(), listBrands(), listPublishedReviews()]);
  const featured = entries
    ? [...entries].sort((a, b) => entryScore(b) - entryScore(a) || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)).slice(0, 8)
    : null;

  return (
    <div className="min-w-0">
      {signedUp ? <Notice>You are on the list. The weekly note is short and Australian.</Notice> : null}
      {signupError === "invalid" ? <Notice>Enter a valid email address.</Notice> : null}
      {signupError === "blocked" ? (
        <Notice>Use a real email address. Test and disposable addresses are not accepted.</Notice>
      ) : null}
      {signupError === "exists" ? <Notice>That address is already on the list.</Notice> : null}
      {signupError === "rate" ? <Notice>Too many attempts from this network. Try again in an hour.</Notice> : null}
      {signupError === "error" ? <Notice>The list could not be saved just now. Try again shortly.</Notice> : null}

      <section className="min-w-0 pt-11 pb-11 sm:pt-20 sm:pb-16">
        <p className="mb-[18px] text-[13px] font-medium text-blue">Home Assistant Compatibility - For Australians</p>
        <h1 className="max-w-[16em] font-display text-[36px] leading-[1.04] font-semibold tracking-[-0.038em] text-ink sm:text-[56px] sm:tracking-[-0.045em]">
          Will it work with
          <br />
          Home Assistant?
        </h1>
        <p className="mt-[18px] max-w-[620px] text-[17px] leading-normal text-ink sm:mt-[22px] sm:text-[19px]">
          Australian batteries and inverters, rated for local control,{" "}
          <span className="whitespace-nowrap">cloud lock-in</span>, and the{" "}
          <span className="whitespace-nowrap">Energy Dashboard</span>.
        </p>
        {entries ? (
          <p className="mt-3 max-w-[36em] text-sm leading-normal text-muted">
            {entries.length} models · {brands?.length ?? 0} brands, including Sigenergy, GoodWe, iStore, Sungrow,
            Redback, and Selectronic.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">The directory cannot reach its database just now.</p>
        )}
        <div className="mt-7 max-w-[540px] sm:mt-9">
          <HomeSearch />
        </div>
        <div id="signup" className="mt-[18px] max-w-[540px]">
          <SignupForm />
        </div>
      </section>

      <section aria-labelledby="shortlist" className="min-w-0 pt-3 pb-14 sm:pb-[72px]">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="shortlist" className="font-display text-2xl font-semibold tracking-[-0.03em]">
            A strong shortlist
          </h2>
          <Link href="/search" className="shrink-0 text-sm font-medium text-blue">
            Browse all
          </Link>
        </div>
        <p className="mt-1.5 text-sm text-muted">Local control and Energy Dashboard support rank higher. Open a model for sources.</p>
        {featured && featured.length > 0 ? (
          <div className="mt-[22px] grid gap-3 sm:mt-7 md:grid-cols-2">
            {featured.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        ) : (
          <Notice>{entries ? "The catalogue is empty right now." : "Entries will show once the database is connected."}</Notice>
        )}
      </section>

      <section aria-labelledby="tested" className="min-w-0 pb-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="tested" className="font-display text-2xl font-semibold tracking-[-0.03em]">
            Tested at home
          </h2>
          <Link href="/tested" className="shrink-0 text-sm font-medium text-blue">
            See all
          </Link>
        </div>
        <p className="mt-1.5 text-sm text-muted">Hands-on notes from gear running at home, not from a brochure.</p>
        {reviews === null ? (
          <Notice>Reviews are unavailable just now.</Notice>
        ) : reviews.length === 0 ? (
          <div className="mt-7 rounded-2xl bg-soft px-5 py-6">
            <h3 className="font-display text-xl font-semibold tracking-[-0.03em]">First reviews coming soon</h3>
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
          <h2 id="brands" className="font-display text-2xl font-semibold tracking-[-0.03em]">
            Brands on Australian roofs
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {brands.map((brand) => (
              <li key={brand}>
                <Link href={brandPath(brand)} className="text-sm font-medium text-muted hover:text-blue">
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
