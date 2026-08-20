# Environment Variables Setup

This app builds as a static export (`next build` → `out/`) and is hosted on
Cloudflare Pages. All server-side logic (Stripe calls, the internal backend,
the payout gate, the consultation webhook) lives in Cloudflare Pages
Functions under `functions/`, not in Next.js API routes — the browser only
ever calls same-origin `/api/...` paths, never external URLs directly.

Because of that split, environment variables live in two places:

- **`.env.local`** — only read by `next dev`/`next build` for the Next.js
  pages themselves. Nothing in `pages/` currently needs a secret at build
  time, so this file is usually unnecessary; keep it only if you add
  client-facing `NEXT_PUBLIC_*` config later.
- **Cloudflare Pages Functions env** — read via `context.env` inside
  `functions/**`, not `process.env`. Locally this comes from a `.dev.vars`
  file (used by `wrangler pages dev`, i.e. `pnpm start`); in production it's
  set as Pages secrets/vars via the Cloudflare dashboard or
  `wrangler pages secret put <NAME>`. **A `.dev.vars`/`.env.local` file is
  never deployed** — Cloudflare Pages only sees what you configure as
  project secrets/vars.

Copy `.dev.vars.example` to `.dev.vars` to get started locally (gitignored).

## Required Variables

### `STRIPE_SECRET_KEY`

Stripe secret key used server-side by `functions/api/terminal/*` and
`functions/api/payout/summary.ts`. Get this from your
[Stripe Dashboard](https://dashboard.stripe.com/apikeys).

### `API_BASE_URL`

Base URL of the internal backend that stores payment intents, logs, and now
consultation bookings (`functions/_lib/logger.ts`,
`functions/api/terminal/payment-intent.ts`,
`functions/api/consultation.ts` → `${API_BASE_URL}/share-and-work-consultation`).
Never exposed to the browser — only referenced inside Functions.

### `INTERNAL_API_KEY`

Secret salt used to generate an hourly-rotating HMAC hash that gates the
payout summary API (`functions/api/payout/summary.ts`,
`functions/api/payout/verify.ts`). Previously named
`NEXT_PUBLIC_INTERNAL_API_KEY` — renamed because it no longer needs (and
must never have) the `NEXT_PUBLIC_` prefix now that nothing client-side
references it directly; that prefix would have told Next.js to inline the
value into client JS if it were ever read from a component.

**How it works:**
- A unique hash is generated each hour based on the current UTC date and hour
- Both the Function and the client (via `/api/payout/verify`) derive the
  same hash from the shared `INTERNAL_API_KEY`
- If someone intercepts the hash, it's only valid for the current hour

**To generate a secure value:**

```bash
openssl rand -base64 32
```

### `PAYOUT_ACCESS_TOKEN`

Bearer token required to access `/payout`. Checked by
`functions/api/payout/verify.ts`, which the page calls on load (see below).

**To generate a secure value:**

```bash
openssl rand -base64 32
```

### `ALLOWED_HOSTS` (optional)

Comma-separated list of domains allowed to call `/api/payout/summary`,
checked against the `Origin`/`Referer` headers. Localhost is always allowed.

```
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Unused: `API_KEY`

An `API_KEY` variable exists in some older `.env.local` files but is not
referenced anywhere in the codebase — safe to drop.

## Local Development

```bash
cp .dev.vars.example .dev.vars
# fill in real values in .dev.vars (gitignored)
pnpm build          # next build --output export → out/
pnpm start          # wrangler pages dev out — serves static export + functions/
```

`pnpm dev` (`next dev`) still works for iterating on page UI, but it does
**not** run `functions/**` — API calls from pages will 404 under `next dev`.
Use `pnpm start` whenever you need the `/api/*` endpoints to work locally.

## Production (Cloudflare Pages)

1. Connect the repo in the Cloudflare Pages dashboard. Build command
   `pnpm build`, output directory `out`.
2. Set each required variable above as a Pages secret:
   ```bash
   wrangler pages secret put STRIPE_SECRET_KEY --project-name share-and-work
   wrangler pages secret put API_BASE_URL --project-name share-and-work
   wrangler pages secret put INTERNAL_API_KEY --project-name share-and-work
   wrangler pages secret put PAYOUT_ACCESS_TOKEN --project-name share-and-work
   wrangler pages secret put ALLOWED_HOSTS --project-name share-and-work   # optional
   ```
   (or set them via Pages → Settings → Environment variables in the dashboard).

## Accessing the Payout Page

The `/payout` page is a static page. On load, it calls
`GET /api/payout/verify` with the token, and only fetches summary data if
that succeeds — replacing the old `getServerSideProps` gate (which required a
Node server and can't run in a static export).

**Supported method: query parameter**

```
https://yourdomain.com/payout?auth=YOUR_TOKEN
```

With additional parameters:

```
https://yourdomain.com/payout?auth=YOUR_TOKEN&po_id=po_xxx&limit=50
```

An `Authorization: Bearer` header still works if you call
`/api/payout/verify` and `/api/payout/summary` directly (e.g. from a script),
but the `/payout` page itself only reads the `auth` query parameter — there's
no server-rendered request left to attach a header to before the page loads.

### Security layers (unchanged)

1. **Page-level token** — `/api/payout/verify` checks `PAYOUT_ACCESS_TOKEN`
2. **Origin/Referer check** — `/api/payout/summary` validates the caller's domain
3. **Hourly rotating hash** — `/api/payout/summary` requires the current
   `INTERNAL_API_KEY`-derived hash, obtained from step 1

## Troubleshooting

### 401 from `/api/payout/verify` / page redirects to `/`

- Verify `PAYOUT_ACCESS_TOKEN` and `INTERNAL_API_KEY` are set in `.dev.vars`
  (local) or as Pages secrets (production)
- Check the `?auth=` value matches `PAYOUT_ACCESS_TOKEN` exactly

### 403 from `/api/payout/summary`

- In production, ensure `ALLOWED_HOSTS` includes your domain

### API routes 404 locally

- You're probably running `next dev` — use `pnpm start`
  (`wrangler pages dev out`) instead, which serves `functions/**`

