export type EnergyDashboard = "y" | "partial" | "n";

export type Integration = {
  route: string;
  name: string;
  url: string;
};

export type Entry = {
  slug: string;
  brand: string;
  model: string;
  type: string;
  integrations: Integration[];
  local: string;
  control: string;
  energy_dashboard: EnergyDashboard;
  gotchas: string;
  sources: string[];
  last_verified: string;
};

export type SearchFilters = {
  q: string;
  type: string;
  brand: string;
  route: string;
  localOnly: boolean;
  hasControl: boolean;
};

export type SponsorLink = {
  slug: string;
  url: string;
  sponsor_name: string;
};

export type SponsorWeek = {
  id: number;
  week_start: string;
  sponsor_name: string;
  url_slug: string;
  blurb: string;
};

export type CurrentSponsor =
  | { kind: "house"; id: string }
  | {
      kind: "sponsor";
      id: string;
      name: string;
      blurb: string;
      slug: string;
      weekStart: string;
    };
