# DataNexus & KP-TECH Enterprise E-Commerce Operating Suite

DataNexus is an enterprise-grade Autonomous E-Commerce Operating System, Financial Reconciliation Platform, and Machine Learning Analytics Suite built for high-growth Indian D2C enterprises and multi-brand retailers.

---

## Key Capabilities & Production Modules

1. **Authentication & Multi-Tenant Security (Zero-Trust)**:
   - **Firebase Authentication**: Email/Password and Google OAuth sign-in.
   - **Server-Side Token Verification**: Every private API route validates the Firebase ID token using `firebase-admin` (`verifyIdToken`).
   - **Strict RBAC**: Role-based access control with `owner`, `admin`, `analyst`, and `viewer` tiers.
   - **Tenant Scoping**: All database records and queries are strictly scoped to the authenticated user's `companyId`.

2. **Persistent Database (Firestore)**:
   - Automated collections for `users`, `companies`, `stores`, `orders`, `inventory`, `costs`, `autopilotRules`, `autopilotLogs`, `auditLogs`, and `payments`.
   - Zero-Trust security rules (`firestore.rules`) deployed via Firebase CLI.

3. **Store Connectivity & Synchronizations**:
   - **Shopify**: Custom App Admin API token validation (`/admin/api/2024-01/shop.json`), AES-256-GCM encrypted token storage, and cursor-paginated order synchronization.
   - **Shopify Webhooks**: Validates `X-Shopify-Hmac-Sha256` signatures on raw incoming payloads.
   - **WooCommerce**: REST API connectivity and synchronization.
   - **CSV Import**: Schema-validated bulk order ingestion.

4. **Payments & Subscription (Razorpay)**:
   - Server-side plan configuration (VIP Enterprise = ₹14,999/month).
   - Real Razorpay Orders API generation.
   - Cryptographic HMAC-SHA256 signature verification with `crypto.timingSafeEqual`.
   - Idempotent payment processing ensuring duplicate webhook retries never double-credit subscriptions.

5. **Financial Reconciliation & RTO Defense**:
   - Mathematically audited P&L calculation:
     $$\text{Net Profit} = \text{Delivered GMV} - (\text{COGS} + \text{Shipping} + \text{Packaging} + \text{Gateway Fee} + \text{GST} + \text{RTO Reverse Logistics Penalty})$$
   - Pincode-level COD refusal scoring with minimum 100 orders statistical threshold.

6. **Autonomous Operations & 8:00 AM WhatsApp Dispatcher**:
   - Automated daily 08:00 AM IST morning executive reports dispatched to WhatsApp.
   - Multi-agent autonomous operations deck monitoring ROAS, inventory run-outs, and courier SLAs.

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your real credentials

# 3. Start development server
npm run dev

# 4. Run automated test suite
npm test
```

## Production Build & Run

```bash
# Build client and compile server
npm run build

# Start production server
npm start
```

For detailed integration guides (Shopify, Razorpay, WhatsApp, Firebase, Gemini), refer to [SETUP.md](./SETUP.md).
