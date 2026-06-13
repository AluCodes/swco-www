# Environment Variables Setup

This document describes the environment variables required for the application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

Your Stripe secret key for API access. Get this from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

### Internal API Security - Hourly Rotating Hash

```env
SECRET_SALT=your_super_secret_salt_here
```

This secret salt is used to generate hourly rotating hash keys for securing internal API endpoints (like the payout summary API). The hash automatically rotates every hour, providing enhanced security through automatic key rotation.

**How it works:**
- A unique hash is generated each hour based on the current UTC date and hour
- Both the API and the client generate the same hash using the shared `SECRET_SALT`
- If someone intercepts the hash, it's only valid for the current hour
- No manual key rotation needed - it's automatic!
- Provides maximum security with 1-hour exposure window

**To generate a secure salt, run:**

```bash
openssl rand -base64 32
```

**Example output:**
```
xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=
```

### Allowed Hosts (Optional - Production Only)

```env
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

Comma-separated list of allowed domains that can access internal APIs. This adds an extra layer of security by checking the Origin/Referer headers.

- **Development:** Not required - localhost is automatically allowed
- **Production:** Recommended to set your production domain(s)
- **Example:** `ALLOWED_HOSTS=myapp.com,www.myapp.com,app.mycompany.com`

### Payout Page Access Token

```env
PAYOUT_ACCESS_TOKEN=your_secure_bearer_token_here
```

Bearer token required to access the `/payout` page. This provides page-level authentication.

**To generate a secure token, run:**

```bash
openssl rand -base64 32
```

**Example output:**
```
kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

This token must be sent in the `Authorization` header when accessing the payout page:
```
Authorization: Bearer kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

## Complete .env.local Example

### Development Environment

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Internal API Security (Hourly Rotating Hash)
SECRET_SALT=xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=

# Payout Page Access
PAYOUT_ACCESS_TOKEN=kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

### Production Environment

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Internal API Security (Hourly Rotating Hash)
SECRET_SALT=xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=

# Allowed Hosts (Production only)
ALLOWED_HOSTS=myapp.com,www.myapp.com

# Payout Page Access
PAYOUT_ACCESS_TOKEN=kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

## Security Notes

- **Never commit** `.env.local` or any file containing actual secrets to version control
- The `SECRET_SALT` is kept server-side only and never exposed to the browser
- The hourly hash is generated server-side in `getServerSideProps` and passed to the client

### Multi-Layer Security Approach

The payout system uses **three layers of security**:

1. **Page-Level Token Authentication** (First layer - Page Access)
   - Validates token before rendering the page
   - Server-side check using `getServerSideProps`
   - Accepts token via query parameter (`?auth=token`) or Authorization header
   - Redirects to home page (`/`) if token is missing or invalid
   - Cannot be bypassed by client-side manipulation
   - Token stored securely in environment variables

2. **Origin/Referer Check** (Second layer - API Access)
   - Validates that API requests come from your own domain
   - Checks the `Origin` and `Referer` HTTP headers
   - Automatically allows localhost for development
   - Prevents cross-origin requests from unauthorized domains
   - Returns `403 Forbidden` if origin is invalid

3. **Hourly Rotating Hash** (Third layer - API Access)
   - Automatically generates a new hash every hour based on UTC date and hour
   - Both client and API generate the same hash using the shared `SECRET_SALT`
   - Hash changes automatically every 60 minutes
   - Intercepted hashes expire within the hour
   - No manual key rotation required
   - Returns `401 Unauthorized` if hash is missing or invalid

### Security Benefits

- **Defense in Depth:** Three independent security layers make it extremely difficult to bypass
- **Automatic Key Rotation:** Hash changes every hour without manual intervention
- **Limited Exposure Window:** Intercepted keys are only valid for the current hour (maximum security)
- **Server-Side Authentication:** Page access validated before any client code runs
- **Flexible Authentication:** Supports both query parameter and Bearer token methods
- **Cross-Origin Protection:** Origin checks prevent CSRF-like attacks
- **Time-Based Security:** Cryptographic hash tied to current UTC date and hour
- **No Client-Side Bypass:** Server-side validation ensures security cannot be circumvented
- **Automatic Development Support:** Localhost is automatically allowed for local testing
- **Comprehensive Logging:** All unauthorized attempts are logged for security monitoring

### Security Considerations for Query Parameter Method

When using the `?auth=token` method, be aware that:

- ✅ **Pros:** Easy to use, works in browsers, shareable links
- ⚠️ **Cons:** Token visible in URL (browser history, server logs, referer headers)

**Best Practices:**

1. **Use Bearer header for programmatic access** - More secure for API clients
2. **Query parameter for internal tools** - Acceptable for internal dashboards with controlled access
3. **Rotate tokens regularly** - Change `PAYOUT_ACCESS_TOKEN` periodically
4. **Use HTTPS in production** - Always use secure connections
5. **Consider session-based auth** - For public-facing applications, implement proper session management

### Additional Production Security Measures

For enhanced security in production, consider:
- IP whitelisting at the infrastructure level
- Rate limiting (e.g., using Vercel Edge Config or Upstash)
- Session-based authentication for logged-in users
- WAF (Web Application Firewall) rules
- Server-side rendering with `getServerSideProps` to hide API calls

## After Setting Up

1. Create `.env.local` file in the root directory
2. Add all required environment variables
3. Generate secure tokens using the commands provided above
4. Restart your Next.js development server: `pnpm dev`
5. The payout summary page requires Bearer token authentication

## Accessing the Payout Page

The `/payout` page requires authentication via either:
1. **Query Parameter** - `?auth=your_token` (easiest for browser access)
2. **Authorization Header** - `Authorization: Bearer your_token` (for API clients)

### Method 1: Browser URL with Query Parameter (Recommended)

Simply add the `auth` parameter to the URL:

```
http://localhost:3000/payout?auth=kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

With additional parameters:

```
http://localhost:3000/payout?auth=YOUR_TOKEN&po_id=po_xxx&limit=50
```

This method works directly in any web browser!

### Method 2: Using cURL with Bearer Token

```bash
curl -H "Authorization: Bearer kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=" \
  "http://localhost:3000/payout?limit=50"
```

### Method 3: Using Postman

1. Open Postman
2. Create a new GET request to `http://localhost:3000/payout`
3. Go to the "Authorization" tab
4. Select "Bearer Token" as the type
5. Paste your token in the Token field
6. Add query parameters (optional): `?po_id=xxx&limit=100`
7. Send the request

### Method 4: Using JavaScript/Fetch

```javascript
fetch('http://localhost:3000/payout?limit=50', {
  headers: {
    'Authorization': 'Bearer kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q='
  }
})
```

### In Your Application

If you're embedding this in another app or iframe, you can either:
- Use the query parameter method: `<iframe src="/payout?auth=token">`
- Set the Authorization header via a proxy or server-side component

## Troubleshooting

### 401 Unauthorized Error

If you see "Unauthorized Access" page:
1. Verify that `.env.local` contains `PAYOUT_ACCESS_TOKEN`
2. Ensure you're sending the correct Bearer token in the Authorization header
3. Token format must be: `Authorization: Bearer your_token_here`
4. Restart the Next.js development server after changing environment variables

### 403 Forbidden Error

If the API returns 403:
1. Check that `NEXT_PUBLIC_INTERNAL_API_KEY` is set correctly
2. Verify origin/referer headers are from allowed domains
3. In production, ensure `ALLOWED_HOSTS` includes your domain

### Page Redirects to Home (/)

If the payout page redirects you to the home page:

1. **Check your token** - Verify it matches `PAYOUT_ACCESS_TOKEN` in `.env.local`
2. **Use query parameter** - Try accessing via `?auth=your_token`
3. **Check environment** - Ensure `.env.local` file exists and `PAYOUT_ACCESS_TOKEN` is set
4. **Restart server** - After changing environment variables, restart: `pnpm dev`

**Example working URL:**
```
http://localhost:3000/payout?auth=kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=
```

