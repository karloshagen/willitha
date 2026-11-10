"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">The page did not finish loading. Try it again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper"
      >
        Try again
      </button>
    </div>
  );
}
