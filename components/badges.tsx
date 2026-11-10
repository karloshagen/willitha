import {
  controlLabel,
  controlTone,
  energyLabel,
  energyTone,
  localLabel,
  localTone,
  primaryRoute,
  routeLabel,
  routeTone,
  type BadgeTone,
} from "@/lib/classify";
import type { Entry } from "@/lib/types";

const tones: Record<BadgeTone, string> = {
  good: "border-eucalyptus/25 bg-eucalyptus-soft text-eucalyptus",
  mid: "border-ochre/30 bg-ochre-soft text-ochre",
  info: "border-sea/20 bg-sea-soft text-sea",
  bad: "border-rose/25 bg-rose-soft text-rose",
  neutral: "border-line bg-sand text-ink",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function BadgeRow({ entry, className = "" }: { entry: Entry; className?: string }) {
  const route = primaryRoute(entry.integrations);
  const extra = Math.max(entry.integrations.length - 1, 0);
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <Badge tone={routeTone(route)}>{routeLabel(route)}</Badge>
      {extra > 0 ? <Badge tone="neutral">+{extra} more</Badge> : null}
      <Badge tone={localTone(entry.local)}>{localLabel(entry.local)}</Badge>
      <Badge tone={controlTone(entry.control)}>{controlLabel(entry.control)}</Badge>
      <Badge tone={energyTone(entry.energy_dashboard)}>{energyLabel(entry.energy_dashboard)}</Badge>
    </div>
  );
}
