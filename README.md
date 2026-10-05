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

---

## 🇮🇳 हिंदी गाइड: Local me kaise chalayein & Render pe deploy karein

### 1. Local me chalane ka tareeka (Local Setup)

#### Step 1: Dependencies install karein
Terminal / Git Bash kholein aur command chalayein:
```bash
npm install --legacy-peer-deps
```

#### Step 2: .env file configure karein
Apni `.env` file kholein aur Telegram Bot ke liye ye 2 zaroori keys bharein:
1. `BOT_TOKEN`: Telegram par [@BotFather](https://t.me/BotFather) se mila hua apna bot token paste karein (e.g. `BOT_TOKEN=123456789:ABC...`).
2. `AI_API_KEY`: Aapki Google Gemini API key (already set ho chuki hai).

Baaki variables already configured hain:
```env
OWNER_ID=8203364513
AI_MODEL=gemini-3.8-flash
IMAGE_MODEL=imagen-3.0-generate-002
BOT_MODE=polling
PORT=3000
```

#### Step 3: Project build aur start karein
```bash
npm run build
npm start
```
Browser me `http://localhost:3000` kholein.
Aapka bot automatically start ho jayega aur Telegram par live ho jayega!

---

### 2. Telegram Bot Features & Testing

1. **Telegram par bot kholein:**
   - Bot Link: [https://t.me/kp_support_2026_bot](https://t.me/kp_support_2026_bot)
   - Username: `@kp_support_2026_bot`
2. **Commands:**
   - `/start` — Welcome message aur options.
   - `/help` — Full feature list aur instructions.
   - `/image <description>` ya `/imagine <description>` — AI se nayi photo generate karwayein.
   - **Photo Editing:** Koi bhi photo bhejein aur caption me edit instruction likhein (e.g. *"background change karo"*, *"make it anime style"*).
3. **Owner Forwarding:**
   - Har customer ka message aur bot ka reply aapko (Owner ID: `8203364513`) Telegram me forward hoga.
   - Agar aap us notification par Telegram me 'Reply' karenge, toh aapka reply direct us customer tak pahunch jayega!

---

### 3. Render par Live Deploy karne ka tareeka

1. **GitHub par push karein:**
```bash
git add .
git commit -m "feat: complete kp support telegram bot with gemini and imagen"
git push -u origin main
```

2. **Render Dashboard Settings (New Web Service):**
   - **Service Type:** Web Service
   - **Environment:** Node
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`

3. **Render Environment Variables (Dashboard me daalein):**
   Render Dashboard > Service > **Environment** tab me jaakar ye variables add karein:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `BOT_TOKEN` = `(Aapka BotFather se mila token)`
   - `OWNER_ID` = `8203364513`
   - `AI_API_KEY` = `(Aapki Gemini API key)`
   - `AI_MODEL` = `gemini-3.8-flash`
   - `IMAGE_MODEL` = `imagen-3.0-generate-002`
   - `BOT_MODE` = `polling` *(Webhook mode ke liye `BOT_MODE=webhook` set karein)*
   - `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, etc. (jo pehle se configured the)

Deploy hone ke baad aapki website aur Telegram Bot dono 24/7 internet par live chalenge!
