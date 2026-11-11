import { signUp, submitDevice, submitSponsorInquiry } from "@/app/actions";
import type { SearchFilters } from "@/lib/types";

const fieldClass =
  "mt-1 min-h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-eucalyptus";

function Honeypot() {
  return (
    <div className="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
      <label>
        Company website
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SignupForm() {
  return (
    <form action={signUp} className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
      <Honeypot />
      <input type="hidden" name="next" value="/" />
      <p className="text-sm text-muted">
        The weekly note. Five Australian picks, plus the week’s sponsor.
      </p>
      <label className="sr-only" htmlFor="signup-email">
        Email address
      </label>
      <input
        id="signup-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.net"
        className="h-10 w-full rounded-full border border-line bg-white px-3 text-sm sm:max-w-[200px]"
      />
      <button type="submit" className="text-left text-sm font-medium text-blue">
        Join the list
      </button>
    </form>
  );
}

export function SearchForm({
  filters,
  types,
  brands,
  routes,
}: {
  filters: SearchFilters;
  types: string[];
  brands: string[];
  routes: string[];
}) {
  return (
    <form action="/search" method="get" className="grid gap-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
      <div>
        <label htmlFor="q" className="text-sm font-semibold">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={filters.q}
          placeholder="Brand, model, or a gotcha"
          className={fieldClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold">
          Type
          <select name="type" defaultValue={filters.type} className={fieldClass}>
            <option value="">Any type</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Brand
          <select name="brand" defaultValue={filters.brand} className={fieldClass}>
            <option value="">Any brand</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Route
          <select name="route" defaultValue={filters.route} className={fieldClass}>
            <option value="">Any route</option>
            {routes.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-5">
        <label className="inline-flex min-h-11 items-center gap-2">
          <input type="checkbox" name="local" value="1" defaultChecked={filters.localOnly} className="size-4 accent-eucalyptus" />
          Local only
        </label>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input type="checkbox" name="control" value="1" defaultChecked={filters.hasControl} className="size-4 accent-eucalyptus" />
          Has control
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper">
          Update results
        </button>
        <a href="/search" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-muted">
          Clear
        </a>
      </div>
    </form>
  );
}

export function HomeSearch({ query = "" }: { query?: string }) {
  return (
    <form action="/search" method="get" className="flex flex-col gap-2.5 sm:flex-row sm:items-center" role="search">
      <label htmlFor="home-q" className="sr-only">
        Search the directory
      </label>
      <input
        id="home-q"
        name="q"
        defaultValue={query}
        placeholder="Sigenergy, Powerwall, Modbus…"
        className="h-12 w-full rounded-full border border-line bg-white px-[18px] text-[15px] text-ink outline-none placeholder:text-faint"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-ink px-[22px] text-sm font-semibold tracking-[-0.01em] text-white"
      >
        Search
      </button>
    </form>
  );
}

export function SubmitForm({
  defaults,
}: {
  defaults: { kind: string; slug: string; brand: string; model: string };
}) {
  const correction = defaults.kind === "correction";
  return (
    <form action={submitDevice} className="relative grid gap-4">
      <Honeypot />
      <fieldset className="flex gap-4 text-sm font-semibold">
        <legend className="sr-only">Submission type</legend>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input type="radio" name="kind" value="new" defaultChecked={!correction} />
          New device
        </label>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input type="radio" name="kind" value="correction" defaultChecked={correction} />
          Correction
        </label>
      </fieldset>
      <label className="text-sm font-semibold">
        Existing slug
        <input name="slug" defaultValue={defaults.slug} className={fieldClass} placeholder="Only for a correction" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Brand
          <input name="brand" required defaultValue={defaults.brand} className={fieldClass} />
        </label>
        <label className="text-sm font-semibold">
          Model
          <input name="model" required defaultValue={defaults.model} className={fieldClass} />
        </label>
      </div>
      <label className="text-sm font-semibold">
        Type
        <input name="type" required className={fieldClass} placeholder="hybrid inverter, battery, string inverter" />
      </label>
      <label className="text-sm font-semibold">
        Local or cloud
        <input name="local" className={fieldClass} placeholder="local, cloud, or local or cloud" />
      </label>
      <label className="text-sm font-semibold">
        Control
        <input name="control" className={fieldClass} placeholder="control, partial, read-only" />
      </label>
      <label className="text-sm font-semibold">
        Energy Dashboard
        <select name="energy_dashboard" defaultValue="" className={fieldClass}>
          <option value="">Unsure</option>
          <option value="y">Yes</option>
          <option value="partial">Partial</option>
          <option value="n">No</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Integrations
        <textarea
          name="integrations"
          rows={4}
          className={fieldClass}
          placeholder="One per line: route | name | https://source"
        />
      </label>
      <label className="text-sm font-semibold">
        Gotchas
        <textarea name="gotchas" rows={4} className={fieldClass} />
      </label>
      <label className="text-sm font-semibold">
        Sources
        <textarea name="sources" rows={3} className={fieldClass} placeholder="One URL per line" />
      </label>
      <label className="text-sm font-semibold">
        Notes
        <textarea name="notes" rows={3} className={fieldClass} placeholder="What should change, and how you checked it" />
      </label>
      <label className="text-sm font-semibold">
        Email <span className="font-normal text-muted">(optional, never shown on the site)</span>
        <input name="email" type="email" autoComplete="email" className={fieldClass} />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">
        Send for review
      </button>
    </form>
  );
}

export function SponsorInquiryForm() {
  return (
    <form action={submitSponsorInquiry} className="relative grid gap-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="text-sm font-semibold">
          Company
          <input name="company" autoComplete="organization" className={fieldClass} />
        </label>
      </div>
      <label className="text-sm font-semibold">
        Email
        <input name="email" type="email" required autoComplete="email" className={fieldClass} />
      </label>
      <label className="text-sm font-semibold">
        Message
        <textarea name="message" required rows={5} className={fieldClass} placeholder="What you would like to sponsor, and the week you have in mind" />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">
        Get in touch
      </button>
    </form>
  );
}
