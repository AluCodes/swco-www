# Hourly Hash Authentication Setup Guide

## 🔐 What Is This?

Your payout system uses **hourly rotating hash authentication** instead of static API keys. The `x-internal-key` header now contains a dynamically generated hash that:

- ✅ **Rotates automatically every hour**
- ✅ **Expires within 60 minutes if intercepted**
- ✅ **Zero maintenance** - no manual key rotation needed
- ✅ **Maximum security** with time-based cryptographic hashing

## 🚀 Setup Instructions

### Step 1: Generate Your Secret Salt

Run this command to generate a secure random salt:

```bash
openssl rand -base64 32
```

**Example output:**
```
xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=
```

### Step 2: Update Your `.env.local`

**Remove old static key (if it exists):**
```env
NEXT_PUBLIC_INTERNAL_API_KEY=... # ❌ DELETE THIS
INTERNAL_API_KEY=... # ❌ DELETE THIS TOO
```

**Add the new secret salt:**
```env
SECRET_SALT=xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=
```

### Step 3: Complete `.env.local` Example

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Hourly Rotating Hash Security
SECRET_SALT=xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r=

# Payout Page Access Token
PAYOUT_ACCESS_TOKEN=kX9mP2nQ7vR4sT8uW1yA5bC6dE9fG3hJ4kL7mN0oP2q=

# (Optional) Allowed Hosts for Production
# ALLOWED_HOSTS=myapp.com,www.myapp.com
```

### Step 4: Restart Your Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
pnpm dev
```

## 🔍 How It Works

### Hash Generation Algorithm

```typescript
function generateHourlyHash(secret: string): string {
  const now = new Date();
  const dateHour = `${now.toISOString().split('T')[0]}-${now.getUTCHours()}`;
  // Example: "2025-11-10-14" (UTC)
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(dateHour)
    .digest('hex');
  
  return hash;
}
```

### Example Hash Timeline

| UTC Time | Date-Hour String | Generated Hash | Status |
|----------|------------------|----------------|--------|
| 14:00 UTC | `2025-11-10-14` | `abc123...` | ✅ Valid |
| 14:30 UTC | `2025-11-10-14` | `abc123...` | ✅ Valid (same) |
| 14:59 UTC | `2025-11-10-14` | `abc123...` | ✅ Valid (same) |
| 15:00 UTC | `2025-11-10-15` | `def456...` | ✅ New hash! |
| 15:00 UTC | Old: `abc123...` | - | ❌ Expired |

### Request Flow

```
User accesses /payout?auth=TOKEN
        ↓
[SERVER] getServerSideProps validates token
        ↓
[SERVER] Generates hourly hash using SECRET_SALT + current UTC hour
        ↓
    hourlyApiKey = "abc123..."
        ↓
[CLIENT] Receives hourlyApiKey as prop
        ↓
[CLIENT] Makes API call with header:
    x-internal-key: abc123...
        ↓
[API] Generates same hash using SECRET_SALT + current UTC hour
        ↓
[API] Compares: abc123... === abc123... ✅
        ↓
    Access Granted
```

## 🛡️ Security Layers

Your payout system has **3 security layers**:

```
User Request
    ↓
1️⃣ Page-Level Token Check (PAYOUT_ACCESS_TOKEN)
    ↓ [Valid? Page loads]
2️⃣ Origin/Referer Check (Domain validation)
    ↓ [Valid origin? Continue]
3️⃣ Hourly Hash Check (Time-based rotating hash)
    ↓ [Valid hash? Grant access]
✅ Access Granted to Stripe Data
```

**Key Points:**
- Static `NEXT_PUBLIC_INTERNAL_API_KEY` is replaced by hourly rotating hash
- Hash is generated server-side, never exposed in environment variables
- Hash changes every hour automatically
- All three layers must pass for API access

## 🧪 Testing Your Setup

### Test 1: Access the Payout Page

```bash
# Should work (if you have valid PAYOUT_ACCESS_TOKEN)
curl http://localhost:3000/payout?auth=YOUR_PAYOUT_TOKEN
```

### Test 2: Generate Current Hour's Hash (Python)

```python
import hmac
import hashlib
from datetime import datetime

SECRET_SALT = "xK9pR3nT8vU4tX1zA6dF9hL2oQ7sW4yB5eG1jN3mP9r="

# Get current UTC date and hour
now = datetime.utcnow()
date_hour = f"{now.strftime('%Y-%m-%d')}-{now.hour}"

hash_value = hmac.new(
    SECRET_SALT.encode(),
    date_hour.encode(),
    hashlib.sha256
).hexdigest()

print(f"Current Hour: {date_hour}")
print(f"Hash: {hash_value}")
print(f"Valid until: {now.strftime('%Y-%m-%d')} {now.hour}:59:59 UTC")
```

### Test 3: API Call With Valid Hash

```bash
# Generate hash first (use Python script above)
HASH="your_generated_hash_here"

curl -H "x-internal-key: $HASH" \
  "http://localhost:3000/api/payout/summary?limit=10"
```

### Test 4: API Call Without Hash (Should Fail)

```bash
# Should return 401 Unauthorized
curl http://localhost:3000/api/payout/summary?limit=10
# Expected: {"error":"Unauthorized"}
```

## ⏰ Hash Expiration Behavior

### What happens when the hour changes?

**At the top of each hour (e.g., 14:00 → 15:00 UTC):**

1. Old hash (`2025-11-10-14`) immediately becomes invalid
2. New hash (`2025-11-10-15`) is automatically generated
3. Users with the page open will experience:
   - Next API call fails with 401 Unauthorized
   - Need to refresh the page to get new hash

**Example scenario:**
```
13:58 UTC: User loads page → Gets hash for hour "13"
[User works for 3 minutes]
14:01 UTC: User clicks refresh button → Sends old hash
          → API expects hash for hour "14"
          → 401 Unauthorized ❌
          → User refreshes page → New hash generated ✅
```

## 🌍 Timezone Safety

**Q: Does this work across timezones?**

**A:** Yes! Both hash generations use **UTC time** on the server.

| User Location | Local Time | Server Time (UTC) | Hash From |
|---------------|------------|-------------------|-----------|
| Singapore (UTC+8) | 10:00 PM | 14:00 UTC | `2025-11-10-14` |
| New York (UTC-5) | 9:00 AM | 14:00 UTC | `2025-11-10-14` |
| London (UTC+0) | 2:00 PM | 14:00 UTC | `2025-11-10-14` |

**Result:** Everyone gets the same hash at the same moment! ✅

**Why it works:**
- Hash generation happens on the **server** (not client)
- Both page load and API call use the **same server's UTC time**
- Client timezone is completely irrelevant

## 🔧 Migration from Static Keys

### What Changed?

**Before (Static Key):**
```typescript
// .env.local
NEXT_PUBLIC_INTERNAL_API_KEY=static_key_here

// API Call
headers: {
  'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY
}
```

**After (Hourly Hash):**
```typescript
// .env.local
SECRET_SALT=random_salt_here

// Server generates hash
const hourlyApiKey = generateHourlyHash(secretSalt);

// API Call
headers: {
  'x-internal-key': hourlyApiKey  // Dynamic, changes every hour
}
```

### Migration Checklist

- ✅ Remove `NEXT_PUBLIC_INTERNAL_API_KEY` from `.env.local`
- ✅ Add `SECRET_SALT` to `.env.local`
- ✅ Restart development server
- ✅ Test payout page access
- ✅ Update production environment variables
- ✅ Deploy changes

## 💡 Best Practices

1. **Keep SECRET_SALT secure**
   - Never commit to git
   - Never expose to client/browser
   - Store in environment variables only

2. **Use HTTPS in production**
   - Prevents hash interception over network
   - Essential for security

3. **Monitor logs**
   - Check for unauthorized access attempts
   - Look for patterns of 401 errors

4. **Rotate SECRET_SALT periodically**
   - Consider monthly or quarterly rotation
   - Update both dev and production environments

5. **Handle hour transitions gracefully**
   - Consider implementing auto-refresh on 401
   - Or display user-friendly error message

## 🐛 Troubleshooting

### "Unauthorized" Error (401)

**Possible causes:**
1. `SECRET_SALT` not set in `.env.local`
2. Server not restarted after adding `SECRET_SALT`
3. Hash expired (hour changed while page was open)
4. System clock is wrong

**Solutions:**
```bash
# Check environment variable
echo $SECRET_SALT

# Restart server
pnpm dev

# Check system time (should be accurate)
date -u
```

### "Server configuration error" (500)

**Cause:** `SECRET_SALT` environment variable is missing

**Solution:** Add `SECRET_SALT` to your `.env.local` file

### Page Redirects to Home

**Cause:** `PAYOUT_ACCESS_TOKEN` is invalid or missing

**Solution:**
1. Verify `PAYOUT_ACCESS_TOKEN` is set in `.env.local`
2. Pass token in URL: `?auth=YOUR_TOKEN`
3. Or use Bearer header: `Authorization: Bearer YOUR_TOKEN`

### Hash Works in Dev but Not Production

**Causes:**
1. `SECRET_SALT` not set in production environment
2. Production and dev using different `SECRET_SALT` values
3. Production server clock is out of sync

**Solutions:**
1. Verify production environment variables
2. Ensure same `SECRET_SALT` in both environments
3. Check server time synchronization (NTP)

## 📊 Monitoring & Logging

### Key Log Events

```bash
# Success
✅ "Payout Summary API: GET request received"

# Failures
❌ "Payout Summary API: Invalid origin/referer"
❌ "Payout Summary API: Unauthorized access attempt - Invalid or expired hash"
❌ "Payout Summary API: SECRET_SALT not configured"
```

### What to Monitor

1. **401 Errors spike at top of hour** - Normal behavior (users with stale hash)
2. **Consistent 401 errors** - May indicate misconfiguration
3. **403 errors** - Origin/referer validation failures
4. **500 errors** - Server configuration issues

## 🎯 Production Deployment

### Deployment Checklist

1. **Generate Production SECRET_SALT**
   ```bash
   openssl rand -base64 32
   ```

2. **Set Environment Variables**
   - `SECRET_SALT` (new production salt)
   - `PAYOUT_ACCESS_TOKEN` (your bearer token)
   - `ALLOWED_HOSTS` (your production domain)

3. **Deploy Application**
   - Push code changes
   - Deploy to hosting platform
   - Restart application

4. **Verify Configuration**
   ```bash
   # Test page access
   curl -I https://yourdomain.com/payout?auth=YOUR_TOKEN
   
   # Should redirect without token
   curl -I https://yourdomain.com/payout
   ```

5. **Monitor Logs**
   - Check for successful authentication
   - Watch for any 401/403/500 errors
   - Verify hash rotation at top of each hour

## 🔐 Security Summary

**What you get:**
- ✅ Automatic key rotation every 60 minutes
- ✅ Maximum security with 1-hour exposure window
- ✅ No manual key management
- ✅ Server-side generation (secret never leaves server)
- ✅ Timezone-safe (UTC-based)
- ✅ Cryptographically secure (HMAC-SHA256)

**Trade-offs:**
- ⚠️ Users may need to refresh if page open across hour boundary
- ⚠️ Requires server restart if SECRET_SALT changes

## 🎉 You're All Set!

Your payout system now uses enterprise-grade rotating hash authentication. The `x-internal-key` header is now powered by hourly rotating hashes instead of static keys! 🔒

