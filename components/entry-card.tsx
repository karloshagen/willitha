import Link from "next/link";
import { BadgeRow } from "@/components/badges";
import { entryPath } from "@/lib/site";
import type { Entry } from "@/lib/types";

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-3.5 shadow-[0_1px_0_rgba(23,36,28,0.04)]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{entry.brand}</p>
        <p className="text-right text-xs text-muted">{entry.type}</p>
      </div>
      <h2 className="mt-1 font-display text-xl leading-snug text-ink">
        <Link href={entryPath(entry.slug)} className="hover:text-eucalyptus">
          {entry.model}
        </Link>
      </h2>
      <BadgeRow entry={entry} className="mt-2.5" />
      {entry.gotchas ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{entry.gotchas}</p> : null}
    </article>
  );
}
