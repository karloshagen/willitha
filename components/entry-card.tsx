import Link from "next/link";
import { controlLabel, energyLabel, localLabel, primaryRoute, routeLabel } from "@/lib/classify";
import { entryPath } from "@/lib/site";
import type { Entry } from "@/lib/types";

export function EntryCard({ entry }: { entry: Entry }) {
  const tags = [
    routeLabel(primaryRoute(entry.integrations)),
    localLabel(entry.local),
    controlLabel(entry.control),
    energyLabel(entry.energy_dashboard),
  ].join(" · ");

  return (
    <article className="rounded-2xl bg-soft px-5 py-5 sm:px-[26px] sm:pt-[26px] sm:pb-6">
      <div className="flex items-baseline justify-between gap-3 text-xs font-medium text-muted">
        <p>{entry.brand}</p>
        <p className="text-right">{entry.type}</p>
      </div>
      <h2 className="mt-2.5 font-display text-[17px] leading-snug font-semibold tracking-[-0.03em] text-ink sm:text-lg">
        <Link href={entryPath(entry.slug)} className="hover:text-blue">
          {entry.model}
        </Link>
      </h2>
      <p className="mt-3 text-[12.5px] font-medium tracking-[-0.01em] text-muted">{tags}</p>
      {entry.gotchas ? <p className="mt-2.5 text-sm leading-normal text-muted">{entry.gotchas}</p> : null}
    </article>
  );
}
