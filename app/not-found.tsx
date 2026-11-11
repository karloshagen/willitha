import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <h1 className="font-display text-4xl">Not in the directory</h1>
      <p className="mt-3 text-muted">That page is not in the catalogue. Try a search, or send the model for review.</p>
      <p className="mt-4 flex gap-4 text-sm font-semibold">
        <Link href="/search" className="text-eucalyptus">
          Search
        </Link>
        <Link href="/submit" className="text-eucalyptus">
          Submit a device
        </Link>
      </p>
    </div>
  );
}
