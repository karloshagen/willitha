import type { Metadata } from "next";
import { SubmitForm } from "@/components/forms";
import { oneParam } from "@/lib/text";

export const metadata: Metadata = {
  title: "Submit a device or correction",
  description: "Send a new Australian battery or inverter, or a correction, for the Will It HA review queue.",
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ok = oneParam(params.ok) === "1";
  const error = oneParam(params.error);
  const defaults = {
    kind: oneParam(params.kind) === "correction" ? "correction" : "new",
    slug: oneParam(params.slug),
    brand: oneParam(params.brand),
    model: oneParam(params.model),
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-5 py-8 sm:py-12">
      <header>
        <h1 className="font-display text-4xl">Submit</h1>
        <p className="mt-2 text-muted">
          New gear or a correction goes into a review queue. Nothing is published until it is checked against a source.
        </p>
      </header>
      {ok ? (
        <p className="rounded-2xl border border-line bg-eucalyptus-soft px-4 py-3 text-sm">
          Thanks. It is in the queue.
        </p>
      ) : null}
      {error === "invalid" ? (
        <p className="rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
          Add a brand, model, type, and at least one note, source, or gotcha.
        </p>
      ) : null}
      {error === "rate" ? (
        <p className="rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
          Too many submissions from this network. Try again in an hour.
        </p>
      ) : null}
      {error === "unavailable" ? (
        <p className="rounded-2xl border border-line bg-rose-soft px-4 py-3 text-sm">
          The form could not be saved just now. Try again shortly.
        </p>
      ) : null}
      <SubmitForm defaults={defaults} />
    </div>
  );
}
