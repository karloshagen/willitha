# Will It HA

A living directory of batteries and inverters sold in Australia, rated for Home Assistant. Each model records the integration route (official core, HACS custom, Modbus, or cloud only), whether access is local or cloud, whether Home Assistant can control it, Energy Dashboard support, gotchas, sources, and the date the note was last verified.

The audience is Australian Home Assistant users choosing a system or already running one. Spelling and prices are Australian. The starting catalogue is 44 sourced models across 21 brands, including Sigenergy, GoodWe, iStore, Sungrow, Redback, and Selectronic.

The public site does not name a person, address, household, or employer.

## Scripts

```bash
npm install
npm run migrate   # apply db/schema.sql
npm run seed      # idempotent upsert of data/seed.json by slug
npm run dev
npm run check     # validate the seed file and email rules, no database
npm run lint
npm run build
npm run email     # preview emails/newsletter
```

`npm run seed` only writes rows that are in `data/seed.json`. Run it again after editing that file; existing slugs are updated, unknown slugs are left as they are.

Postgres is reached with the `postgres` driver (postgres.js) using `DATABASE_URL`, or `POSTGRES_URL` if `DATABASE_URL` is unset. That is the shape Vercel Marketplace Neon injects. Prepared statements are disabled so the Neon pooler works. Set `sslmode=disable` only for a local database.

## Environment variables

Copy `.env.example` to `.env.local`. No real secrets belong in the repo.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes, or `POSTGRES_URL` | Postgres connection string. Preferred when both are set. |
| `POSTGRES_URL` | Yes, or `DATABASE_URL` | Accepted as a fallback, including the Vercel Marketplace Neon variable. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical origin. Defaults to `https://willitha.au`. |
| `ADMIN_TOKEN` | For admin API | Bearer token for `/api/admin/*`. If unset, every admin call returns 401. |
| `RESEND_API_KEY` | For email | Resend API key. Signup and sponsor forms still save to the database when this is missing. |
| `RESEND_AUDIENCE_ID` | For the newsletter list | Resend segment id. Audiences were renamed to segments; put the segment id here. The signup call adds the contact with `segments: [{ id }]`, then tries the legacy audience field if that fails. |
| `EMAIL_FROM` | For sponsor enquiry mail | From address, for example `Will It HA <newsletter@willitha.au>`. |
| `OWNER_EMAIL` | For sponsor enquiry mail | One recipient. Mail is skipped when both recipient variables are empty. |
| `CEO_EMAIL` | For sponsor enquiry mail | Second recipient. Either recipient is enough. |

Sponsor enquiry mail is sent only when `RESEND_API_KEY`, `EMAIL_FROM`, and at least one of `OWNER_EMAIL` or `CEO_EMAIL` are set. A missing Resend configuration does not crash the request.

## Admin API

Every route requires `Authorization: Bearer <ADMIN_TOKEN>` and speaks JSON. A missing or wrong token returns `401` `{ "error": "Unauthorised" }`. Validation errors return `400` with an `error` string. The token is never written to the error log.

### `GET /api/admin/queue`

Pending submissions, oldest first.

```json
{
  "submissions": [
    {
      "id": 1,
      "kind": "new",
      "slug": "",
      "payload": {},
      "status": "pending",
      "created_at": "2026-11-10T00:00:00.000Z"
    }
  ]
}
```

`kind` is `new` or `correction`.

### `POST /api/admin/approve`

```json
{ "id": 1, "action": "approve", "entry": { "slug": "goodwe-et", "brand": "GoodWe" } }
```

`action` is `approve` or `reject`. Approve requires a full entry object (same shape as `data/seed.json`) and upserts it by slug, then marks the submission `approved`. Reject marks it `rejected` and does not write an entry. A submission that is not pending returns `409`.

```json
{ "ok": true, "id": 1, "status": "approved", "slug": "goodwe-et" }
```

### `POST /api/admin/entries`

Upsert curated entries without a submission. Send one entry, `{ "entry": { ... } }`, or `{ "entries": [ ... ] }`.

```json
{ "ok": true, "slugs": ["goodwe-et"] }
```

An entry needs `slug`, `brand`, `model`, `type`, `integrations` (array of `{ route, name, url }`), `local`, `control`, `energy_dashboard` (`y`, `partial`, or `n`), `gotchas`, at least one `sources` URL, and `last_verified` (`YYYY-MM-DD`).

### `GET /api/admin/stats`

```json
{
  "entries": 44,
  "signups": { "total": 0, "d7": 0, "d30": 0 },
  "pageviews": {
    "total": 0,
    "d7": 0,
    "d30": 0,
    "top_paths_7d": [{ "path": "/", "views": 1 }],
    "top_paths_30d": [{ "path": "/", "views": 1 }]
  },
  "sponsor_clicks": { "total": 0, "d7": 0, "d30": 0 },
  "submissions": { "pending": 0, "total": 0, "d7": 0, "d30": 0 },
  "inquiries": { "total": 0, "d7": 0, "d30": 0 },
  "errors": { "total": 0, "d7": 0, "d30": 0 }
}
```

### `GET /api/admin/searches`

Top zero-result searches.

```json
{
  "searches": [
    { "query": "powerwall 4", "count": 2, "last_seen": "2026-11-10T00:00:00.000Z", "filters": {} }
  ]
}
```

The stored query includes filter labels when the box was empty, for example `type:battery local-only`.

### `GET /api/admin/sponsors` and `POST /api/admin/sponsors`

GET returns `{ "weeks": [], "links": [] }`.

POST upserts a tracking link, a sponsor week, or both:

```json
{
  "link": { "slug": "acme", "url": "https://example.com/landing", "sponsor_name": "Acme Solar" },
  "week": {
    "week_start": "2026-11-09",
    "sponsor_name": "Acme Solar",
    "url_slug": "acme",
    "blurb": "Acme installs batteries in Victoria."
  }
}
```

`week_start` is the first day of a 7-day slot. The bar shows the row where today in Australia/Sydney falls in `[week_start, week_start + 7 days)`. The public sponsor URL is `/go/acme`, which logs a click and redirects. Create the link before the week or the bar falls back to the house ad.

## What the pages do

- `/` shows a one-line pitch, search, a short ranked list, brand links, and email signup.
- `/search` filters by type, brand, route, local only, and has control. Text search matches brand, model, type, and gotchas. An empty result is stored in `zero_result_searches`.
- `/entry/[slug]` shows every field, sources, the last verified date, and a correction link into the submit form.
- `/brand/[brand]` lists that brand. The URL slug is the brand name in lowercase.
- `/submit` stores a pending row in `submissions`. A hidden honeypot field and an hourly limit sit in front of it.
- Email signup validates the address, rejects `test@`, `+test` aliases, `example.com`, Mailinator, and a disposable-domain list, saves `signups`, and adds a Resend contact when configured.
- The sponsor bar reads `sponsor_weeks` for the current Sydney week, or a house ad to `/sponsor`. Closing it stores the week id in `localStorage`.
- `/sponsor` reads subscriber count, page views for 30 days, and entry count from the database. The enquiry form writes `sponsor_inquiries` and emails the configured recipients. There is no checkout.
- `/go/[slug]` reads `links`, writes `sponsor_clicks` (`slug`, `ts`, referrer without the query string, path), and returns 302.
- Page views are a same-origin POST to `/api/beacon`: path, timestamp, and referrer host. No IP address is stored.
- Server errors are written to `errors` from route handlers and `instrumentation.ts`. Request headers are not stored.

## Newsletter

`emails/newsletter.tsx` is a React Email template: five one-line picks, a “Sponsored by” line (use a `/go/...` URL), and an unsubscribe link whose href is the Resend Broadcasts placeholder `{{{RESEND_UNSUBSCRIBE_URL}}}`. Preview it with `npm run email`. Sending the broadcast is done in Resend; this app does not schedule it.

## Deploy

Import the repo into Vercel. The framework preset is Next.js. Attach Neon from the Vercel Marketplace so `DATABASE_URL` or `POSTGRES_URL` is present, set the other variables, then run `npm run migrate` and `npm run seed` against that database (locally with the production URL, or from a one-off shell). The app builds without a database; pages show a short unavailable message until the tables exist.

## Not in this version

- No card checkout. Sponsorship is an enquiry.
- The newsletter template is not sent on a schedule.
- Signup does not send a confirmation email.
- Browser-only crashes are not written to `errors` (server render and route failures are).
- The page-view beacon can be inflated by a same-origin client. It ignores `/api` and `/_next`.
- Local-only and has-control filters use the same rules as the badges, applied on the server after the SQL text match.
- There is no admin web UI, only the token API.
- `npm run seed` does not delete rows that are no longer in the file.
