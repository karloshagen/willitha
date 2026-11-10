import type { Metadata } from "next";
import Link from "next/link";
import { ReviewCard } from "@/components/review-card";
import { listPublishedReviews, listReviewCategories } from "@/lib/reviews";
import { oneParam } from "@/lib/text";

export const metadata: Metadata = {
  title: "Tested at home",
  description:
    "Hands-on Home Assistant notes from gear running at home, starting with solar and batteries and open to any device.",
  alternates: { canonical: "/tested" },
};

export default async function TestedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const category = oneParam((await searchParams).category).slice(0, 80);
  const [reviews, categories] = await Promise.all([
    listPublishedReviews(category),
    listReviewCategories(),
  ]);

  return (
    <div className="grid min-w-0 gap-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-eucalyptus">Tested at home</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">Gear running at home</h1>
        <p className="mt-3 text-lg leading-snug">
          Hands-on notes from Home Assistant devices in daily use. Energy gear first, and room for CT clamps, smart plugs, hot water controllers, and sensors.
        </p>
      </header>

      {reviews === null ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          Reviews are unavailable just now.
        </p>
      ) : categories && categories.length > 0 ? (
        <ul className="flex max-w-full flex-wrap gap-2">
          <li>
            <Link
              href="/tested"
              className={`inline-flex rounded-full border px-3 py-1.5 text-sm ${category ? "border-line bg-card" : "border-eucalyptus bg-eucalyptus-soft text-eucalyptus"}`}
            >
              All
            </Link>
          </li>
          {categories.map((item) => (
            <li key={item}>
              <Link
                href={`/tested?category=${encodeURIComponent(item)}`}
                className={`inline-flex rounded-full border px-3 py-1.5 text-sm ${
                  item === category ? "border-eucalyptus bg-eucalyptus-soft text-eucalyptus" : "border-line bg-card"
                }`}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {reviews === null ? null : reviews.length === 0 && !category ? (
        <section className="rounded-3xl border border-dashed border-line bg-card px-5 py-8">
          <h2 className="font-display text-2xl">First reviews coming soon</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            These will be written from devices that are actually installed, not from a spec sheet. The directory stays available in the meantime.
          </p>
          <Link href="/search" className="mt-4 inline-flex font-semibold text-eucalyptus">
            Browse the directory
          </Link>
        </section>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">No reviews in this category yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
