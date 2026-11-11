import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryCard } from "@/components/entry-card";
import { brandSlug } from "@/lib/classify";
import { entriesForBrand, listBrands } from "@/lib/entries";
import { brandPath } from "@/lib/site";

async function resolveBrand(slug: string): Promise<string | null | undefined> {
  const brands = await listBrands();
  if (brands === null) return null;
  return brands.find((brand) => brandSlug(brand) === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await resolveBrand(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: `${brand} on Home Assistant`,
    description: `How ${brand} inverters and batteries sold in Australia show up in Home Assistant, including local access, control, and Energy Dashboard support.`,
    alternates: { canonical: brandPath(brand) },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = await resolveBrand(slug);
  if (brand === null) {
    return <p className="rounded-2xl border border-line bg-card px-4 py-3">The directory cannot reach its database just now.</p>;
  }
  if (!brand) notFound();
  const entries = await entriesForBrand(brand);
  if (entries === null) {
    return <p className="rounded-2xl border border-line bg-card px-4 py-3">The directory cannot reach its database just now.</p>;
  }

  return (
    <div className="grid gap-6 py-8 sm:py-12">
      <p className="text-sm">
        <Link href="/search" className="font-semibold text-eucalyptus">
          Directory
        </Link>
      </p>
      <header>
        <h1 className="font-display text-4xl">{brand}</h1>
        <p className="mt-2 max-w-2xl text-muted">
          How {brand} inverters and batteries show up in Australian Home Assistant setups. Notes are community maintained.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => (
          <EntryCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </div>
  );
}
