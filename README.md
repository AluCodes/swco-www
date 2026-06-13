# SWCO — Share & Work Co.

A Next.js 14 web application for Share & Work Co., featuring a tour booking landing page, Stripe Terminal payment processing, and a payout management dashboard.

---

## Tech Stack

- **Framework:** Next.js 16 (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Payments:** Stripe (Terminal SDK + REST API)
- **Package Manager:** pnpm
- **Runtime:** Node.js 24

---

## Project Structure

```
swco-www/
├── pages/
│   ├── index.tsx              # Da Nang tour booking landing page
│   ├── terminal.tsx           # Stripe Terminal POS interface
│   ├── payout.tsx             # Payout summary dashboard (protected)
│   ├── thank-you.tsx          # Post-booking confirmation page
│   ├── maintenance.tsx        # Maintenance mode page
│   └── api/
│       ├── terminal/
│       │   ├── connection-token.ts   # Stripe Terminal connection token
│       │   ├── payment-intent.ts     # Create payment intents
│       │   ├── process-payment.ts    # Process payments
│       │   ├── reader-process-payment.ts
│       │   ├── price.ts              # Fetch product prices
│       │   └── log.ts                # Terminal event logging
│       └── payout/
│           └── summary.ts            # Stripe payout summary (protected)
├── components/
│   └── ui/
│       └── button.tsx         # shadcn/ui Button component
├── lib/
│   ├── constants.ts           # App-wide constants (webhook URLs, Stripe version)
│   ├── utils.ts               # Tailwind cn() helper
│   └── api-logger.ts          # API request/response logger
├── public/                    # Static assets
└── styles/
    └── globals.css            # Tailwind v4 base styles + CSS variables
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Stripe](https://stripe.com) account with Terminal enabled

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Internal API security (hourly rotating hash)
SECRET_SALT=your_super_secret_salt_here

# Payout page access token
PAYOUT_ACCESS_TOKEN=your_secure_bearer_token_here

# (Production only) Allowed request origins
# ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

Generate secure values with:

```bash
openssl rand -base64 32
```

See [ENV_SETUP.md](./ENV_SETUP.md) for full details on each variable.

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server at `http://localhost:3000` |
| `pnpm build` | Build the production application |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

---

## Pages

### `/` — Landing Page
Tour booking landing page for Da Nang experiences. Visitors can submit a booking enquiry via a form that sends data to the configured webhook (`BOOKING_WEBHOOK_URL`).

### `/terminal` — Stripe Terminal
In-person POS interface powered by the Stripe Terminal JS SDK. Supports:
- Reader discovery and connection
- Product/price lookup from Stripe
- Payment intent creation and collection
- Real-time event log

### `/payout` — Payout Dashboard (Protected)
Internal dashboard displaying Stripe payout summaries and balance transactions. Protected by three security layers — see [Security](#security) below.

Access via:
```
http://localhost:3000/payout?auth=YOUR_PAYOUT_ACCESS_TOKEN
```

### `/thank-you` — Booking Confirmation
Post-submission confirmation page shown after a successful booking enquiry.

### `/maintenance` — Maintenance Mode
Static maintenance page for use during deployments or planned downtime.

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/terminal/connection-token` | POST | Issues a Stripe Terminal connection token |
| `/api/terminal/payment-intent` | POST | Creates a new payment intent |
| `/api/terminal/process-payment` | POST | Processes a collected payment |
| `/api/terminal/reader-process-payment` | POST | Triggers reader-side payment processing |
| `/api/terminal/price` | GET | Fetches product prices from Stripe |
| `/api/terminal/log` | POST | Records terminal events |
| `/api/payout/summary` | GET | Returns payout summary data (protected) |

---

## Security

The `/payout` page and `/api/payout/summary` endpoint use three independent security layers:

1. **Page-level token** — Bearer token checked in `getServerSideProps` before rendering. Pass via `?auth=TOKEN` or `Authorization: Bearer TOKEN` header.
2. **Origin/Referer check** — API validates that requests originate from an allowed domain. Localhost is automatically permitted in development.
3. **Hourly rotating hash** — An HMAC-SHA256 hash derived from `SECRET_SALT` + current UTC date-hour is generated server-side on page load and sent as `x-internal-key` on API requests. The hash rotates automatically every hour.

See [ENV_SETUP.md](./ENV_SETUP.md) and [HASH_AUTH_SETUP.md](./HASH_AUTH_SETUP.md) for full details.

---

## Docker

Two Dockerfiles are provided:

| File | Purpose |
|---|---|
| `Dockerfile.prod` | Optimised multi-stage production build (non-root user, BuildKit cache) |
| `Dockerfile.uat` | UAT/staging build |

Build and run production image:

```bash
docker build -f Dockerfile.prod -t swco-www .
docker run -p 3000:3000 --env-file .env.local swco-www
```

Push scripts:

```bash
./push-to-registry-prod.sh   # Push production image
./push-to-registry-uat.sh    # Push UAT image
```

---

## External Integrations

| Service | Purpose |
|---|---|
| Stripe API | Payment processing, Terminal, payouts |
| `workflow.pixelcollab.co` | Booking enquiry webhook receiver |

---

## Development Notes

- The `X-Powered-By` header is removed in `next.config.js` for security.
- Images are optimised for WebP/AVIF and served from `kaesolegacy.com` and localhost.
- Add new shadcn/ui components with: `npx shadcn@latest add <component>`
- CSS design tokens (colors, radius, etc.) are defined as CSS variables in [styles/globals.css](styles/globals.css).
