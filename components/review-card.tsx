import Link from "next/link";
import { Badge } from "@/components/badges";
import { testedPath } from "@/lib/site";
import type { Review } from "@/lib/reviews";

export function TestedBadge() {
  return <Badge tone="good">Tested at home</Badge>;
}

export function Rating({ rating }: { rating: number }) {
  const score = Math.max(1, Math.min(5, rating));
  return (
    <p className="text-sm text-ink">
      <span aria-hidden="true" className="tracking-tight text-ochre">
        {"★".repeat(score)}
        {"☆".repeat(5 - score)}
      </span>{" "}
      <span>{`${score} out of 5`}</span>
    </p>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  const photo = review.photos[0];
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-soft">
      {photo ? (
        // Review photos are owner-supplied external URLs, so they are not passed through the image optimiser.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <TestedBadge />
          <Badge tone="neutral">{review.category}</Badge>
        </div>
        <h2 className="font-display text-xl leading-snug">
          <Link href={testedPath(review.slug)} className="hover:text-eucalyptus">
            {review.title}
          </Link>
        </h2>
        <p className="text-sm text-muted">
          {review.brand} {review.device_name}
        </p>
        <Rating rating={review.rating} />
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{review.summary}</p>
      </div>
    </article>
  );
}
