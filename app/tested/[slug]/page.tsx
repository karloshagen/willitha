import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { Rating, TestedBadge } from "@/components/review-card";
import { getPublishedReview, integrationLabel } from "@/lib/reviews";
import { entryPath, formatAuDate, siteUrl, testedPath } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = await getPublishedReview(slug);
  if (!review) return { title: "Review" };
  return {
    title: review.title,
    description: review.summary,
    alternates: { canonical: testedPath(review.slug) },
    openGraph: {
      title: review.title,
      description: review.summary,
      url: testedPath(review.slug),
      type: "article",
      images: review.photos[0] ? [{ url: review.photos[0].url, alt: review.photos[0].alt }] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await getPublishedReview(slug);
  if (review === null) {
    return <p className="rounded-2xl border border-line bg-card px-4 py-3">Reviews are unavailable just now.</p>;
  }
  if (!review) notFound();

  const published = review.published_at ? formatAuDate(review.published_at.slice(0, 10)) : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    reviewBody: review.summary,
    datePublished: review.published_at,
    dateModified: review.updated_at,
    url: `${siteUrl()}${testedPath(review.slug)}`,
    image: review.photos.map((photo) => photo.url),
    author: { "@type": "Organization", name: "Will It HA" },
    publisher: { "@type": "Organization", name: "Will It HA" },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      "@type": "Product",
      name: review.device_name,
      brand: { "@type": "Brand", name: review.brand },
      category: review.category,
    },
  };

  return (
    <article className="mx-auto grid max-w-3xl gap-6 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <p className="text-sm text-muted">
        <Link href="/tested" className="font-semibold text-eucalyptus">
          Tested at home
        </Link>
      </p>
      <header>
        <TestedBadge />
        <h1 className="mt-3 font-display text-4xl leading-tight">{review.title}</h1>
        <p className="mt-2 text-muted">
          {review.brand} {review.device_name}
          {published ? ` · ${published}` : null}
        </p>
        <div className="mt-3">
          <Rating rating={review.rating} />
        </div>
        <p className="mt-4 text-lg leading-snug">{review.summary}</p>
      </header>

      {review.photos.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {review.photos.map((photo) => (
            <li key={photo.url} className="overflow-hidden rounded-2xl border border-line bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt} className="h-auto w-full" />
            </li>
          ))}
        </ul>
      ) : null}

      <section className="grid gap-3 rounded-2xl border border-line bg-card p-4 text-sm">
        <h2 className="font-display text-xl">Setup</h2>
        <dl className="grid gap-3">
          <div>
            <dt className="font-semibold">Integration</dt>
            <dd className="text-muted">{integrationLabel(review.integration_type)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Local or cloud</dt>
            <dd className="text-muted">{review.local_or_cloud}</dd>
          </div>
          {review.entry_slug ? (
            <div>
              <dt className="font-semibold">Directory entry</dt>
              <dd>
                <Link href={entryPath(review.entry_slug)} className="font-semibold text-eucalyptus">
                  Compatibility notes
                </Link>
              </dd>
            </div>
          ) : null}
          {review.affiliate_url ? (
            <div>
              <dt className="font-semibold">Shop link</dt>
              <dd>
                {review.affiliate_url.startsWith("/") ? (
                  <Link href={review.affiliate_url} className="font-semibold text-eucalyptus">
                    Open the shop link
                  </Link>
                ) : (
                  <a href={review.affiliate_url} className="font-semibold text-eucalyptus" rel="sponsored noreferrer">
                    Open the shop link
                  </a>
                )}
                <p className="text-muted">May be an affiliate link.</p>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {review.pros.length > 0 ? (
            <section className="rounded-2xl border border-line bg-card p-4">
              <h2 className="font-display text-xl">Pros</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {review.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {review.cons.length > 0 ? (
            <section className="rounded-2xl border border-line bg-card p-4">
              <h2 className="font-display text-xl">Cons</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {review.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <Markdown source={review.body} />
    </article>
  );
}
