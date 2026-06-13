# Kaeso Legacy - Premium Will Generation Platform

A modern, comprehensive will generation platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Modern Landing Page**: Beautiful, responsive landing page with animated elements
- **Multi-Step Form**: Guided will creation process with 6 comprehensive steps
- **Form Validation**: Robust validation using Zod schemas
- **Real-time Progress Tracking**: Visual progress indicator with step navigation
- **API Integration**: Webhook submission to external services
- **PDF Generation**: API endpoint for document generation
- **Responsive Design**: Mobile-first design approach
- **Stripe Terminal Integration**: POS terminal payment processing
- **Secure Payout Dashboard**: Multi-layer secured payout summary and transaction viewer

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Form Management**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Project Structure

```
/pages
  ├── index.tsx              # Landing page
  ├── _app.tsx              # App wrapper
  ├── create-will/
  │   └── index.tsx         # Multi-step form
  └── api/
      ├── submit-will.js    # Form submission API
      └── generate-pdf.js   # PDF generation API

/components
  └── steps/
      ├── PersonalInfoStep.tsx
      ├── ContactInfoStep.tsx
      ├── AssetsStep.tsx
      ├── BeneficiariesStep.tsx
      ├── ExecutorStep.tsx
      └── ReviewStep.tsx

/lib
  └── validationSchemas.ts  # Zod validation schemas

/styles
  └── globals.css          # Global styles with Tailwind
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd kaeso-legacy
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Form Steps

1. **Personal Information**: Basic details, marital status, children
2. **Contact Details**: Address and contact information
3. **Assets & Property**: Real estate, financial assets, personal property
4. **Beneficiaries**: Who will inherit the estate
5. **Executor & Guardian**: Estate executor and child guardianship
6. **Review & Submit**: Final review and submission

## API Endpoints

### POST /api/will/submit-will

Submits will data to the webhook endpoint.

**Request Body:**

```json
{
  "personal": { ... },
  "contact": { ... },
  "assets": { ... },
  "beneficiaries": [ ... ],
  "executor": { ... },
  "specialInstructions": "...",
  "additionalNotes": "..."
}
```

### POST /api/generate-pdf

Generates PDF document from will data.

### GET /api/payout/summary

**Secured Endpoint** - Retrieves payout summary and transaction data from Stripe.

**Security Requirements:**
- Origin/Referer validation
- API key in `x-internal-key` header

**Query Parameters:**
- `po_id` (optional): Specific payout ID to filter transactions
- `limit` (optional): Number of transactions to retrieve (default: 100)

**Response:**

```json
{
  "transactions": [...],
  "summary": {
    "total_amount": 0,
    "total_fees": 0,
    "total_net": 0,
    "transaction_count": 0
  },
  "payout": { ... },
  "balance": { ... }
}
```

## Configuration

### Webhook URL

The form submission webhook URL is configured in `/pages/api/will/submit-will.js`:

```javascript
const webhookUrl =
  "https://workflow.pixelcollab.co/webhook/kaeso-webhook-submission";
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration. See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

**Required Variables:**

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Internal API Security
NEXT_PUBLIC_INTERNAL_API_KEY=your_random_secret_key_here

# Payout Page Access
PAYOUT_ACCESS_TOKEN=your_secure_bearer_token_here

# Legacy (Optional)
NEXT_PUBLIC_API_URL=http://localhost:3000
WEBHOOK_URL=https://workflow.pixelcollab.co/webhook/kaeso-webhook-submission
```

## Secure Payout Dashboard

The `/payout` page provides a comprehensive view of Stripe transactions and payouts with **three layers of security**:

### Security Layers

1. **Bearer Token Authentication** - Server-side validation before page render
2. **Origin/Referer Validation** - API requests validated against allowed domains
3. **API Key Authentication** - Required header for API access

### Accessing the Payout Page

The payout page requires authentication via **two methods**:

**Method 1: Query Parameter (Browser-Friendly)**

Access directly in your browser by adding the `auth` parameter:

```
http://localhost:3000/payout?auth=your_token_here
http://localhost:3000/payout?auth=your_token_here&limit=50&po_id=po_xxx
```

**Method 2: Bearer Token Header (API Clients)**

```bash
curl -H "Authorization: Bearer your_token_here" \
  "http://localhost:3000/payout?limit=50"
```

For more details and examples, see [ENV_SETUP.md](./ENV_SETUP.md).

## Deployment

### Production (Docker)

For production deployment using Docker and Google Cloud Artifact Registry:

1. **Build the Docker image for Linux/AMD64 platform:**
   ```bash
   docker build --platform linux/amd64 -t kaeso/kaeso-legacy-ui .
   ```

2. **Tag the image for Google Cloud Artifact Registry:**
   ```bash
   docker tag kaeso/kaeso-legacy-ui asia-southeast1-docker.pkg.dev/kaeso-ui/kaeso-legacy-ui/web-image:latest
   ```

3. **Push the image to the registry:**
   ```bash
   docker push asia-southeast1-docker.pkg.dev/kaeso-ui/kaeso-legacy-ui/web-image:latest
   ```

### Vercel (Alternative)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The project can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Customization

### Styling

- Modify `tailwind.config.js` for theme customization
- Update `styles/globals.css` for global styles
- Component-specific styles are in each component file

### Form Fields

- Add new fields in the appropriate step component
- Update validation schemas in `lib/validationSchemas.ts`
- Modify the form data type as needed

### API Integration

- Update webhook URL in `/pages/api/will/submit-will.js`
- Modify PDF generation logic in `/pages/api/generate-pdf.js`
- Add additional API endpoints as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
