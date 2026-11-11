import type { Metadata } from "next";
import Link from "next/link";
import { EntryCard } from "@/components/entry-card";
import { SearchForm } from "@/components/forms";
import { hasActiveSearch, listBrands, listRoutes, listTypes, logZeroResult, readFilters, searchEntries } from "@/lib/entries";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const filters = readFilters(await searchParams);
  const title = filters.q ? `Results for ${filters.q}` : "Search the directory";
  return {
    title,
    description: "Search Australian batteries and inverters by brand, model, type, route, local access, and control.",
    alternates: { canonical: "/search" },
    robots: hasActiveSearch(filters) ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = readFilters(raw);
  const [entries, types, brands, routes] = await Promise.all([
    searchEntries(filters),
    listTypes(),
    listBrands(),
    listRoutes(),
  ]);

  if (entries && entries.length === 0 && hasActiveSearch(filters)) {
    await logZeroResult(filters);
  }

  return (
    <div className="grid gap-6 py-8 sm:py-12">
      <div>
        <h1 className="font-display text-4xl">Directory</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Filter the Australian catalogue. Core means it ships with Home Assistant. HACS is a custom integration.
          Modbus means you bring a register map. Cloud only means there is no local access.
        </p>
      </div>
      <SearchForm filters={filters} types={types ?? []} brands={brands ?? []} routes={routes ?? []} />
      {entries === null ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          The directory cannot reach its database just now.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {entries.length} {entries.length === 1 ? "match" : "matches"}
          </p>
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-6">
              <p>Nothing in the directory matches that.</p>
              <Link href="/submit" className="mt-2 inline-flex font-semibold text-eucalyptus">
                Send the details for review
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {entries.map((entry) => (
                <EntryCard key={entry.slug} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
