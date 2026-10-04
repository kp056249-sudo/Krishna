# DataNexus & KP-TECH Enterprise Setup Guide

Complete zero-to-production deployment and configuration guide for DataNexus Enterprise Operating Suite.

---

## 1. Firebase Authentication & Firestore Setup

1. Open [Firebase Console](https://console.firebase.google.com/) and create or select your Google Cloud project.
2. **Authentication**:
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Email/Password** provider.
   - Enable **Google** provider and configure consent screen.
3. **Firestore Database**:
   - Go to **Build > Firestore Database**.
   - Click **Create database** (Production mode).
   - Ensure the database ID and project match `firebase-applet-config.json`.
4. **Deploy Security Rules**:
   - The security rules in `firestore.rules` enforce Zero-Trust scoping by `companyId`.
   - Rules are automatically deployed via the AI Studio Fax tool or using Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

## 2. Shopify Custom App & Webhook Configuration

1. In your Shopify Store Admin:
   - Navigate to **Settings > Apps and sales channels > Develop apps**.
   - Click **Create an app** (Name: `DataNexus Connector`).
2. **Configuration**:
   - Configure **Admin API integration**:
     - Read scopes: `read_orders`, `read_products`, `read_inventory`, `read_customers`, `read_draft_orders`.
   - Install the app and copy the **Admin API access token** (`shpat_...`).
3. **Webhooks Setup**:
   - Register endpoints pointing to: `https://your-domain.com/api/webhooks/shopify/<topic>`.
   - Topics: `orders/create`, `orders/updated`, `orders/cancelled`, `checkouts/create`.
   - Copy your **API Secret Key** and configure `SHOPIFY_CLIENT_SECRET`.

---

## 3. Razorpay Payments & Webhook Setup

1. In [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys):
   - Generate API Keys: Copy `Key Id` and `Key Secret`.
   - Set in `.env`:
     ```env
     RAZORPAY_KEY_ID=rzp_live_...
     RAZORPAY_KEY_SECRET=...
     ```
2. **Webhook Registration**:
   - Navigate to **Settings > Webhooks > Add New Webhook**.
   - URL: `https://your-domain.com/api/payment/webhook`.
   - Secret: Set a random secret string and place in `RAZORPAY_WEBHOOK_SECRET`.
   - Active Events: Select `payment.captured`, `order.paid`.

---

## 4. Google Gemini 2.5 Flash Setup

1. Obtain your API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set in `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. Real AI calls execute via the secure backend proxy `/api/ai/chat` with rate limiting and grounding over your real Firestore order and revenue data.

---

## 5. WhatsApp 8:00 AM Automated Executive Dispatcher

1. **Twilio Option**:
   - Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER`.
2. **Meta Cloud Graph API Option**:
   - Set `META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, and `META_WABA_ID`.
3. Configure the recipient phone:
   ```env
   FOUNDER_WHATSAPP_PHONE=+919876543210
   ```
4. The background scheduler dispatches the full morning P&L, stockout warnings, and courier SLAs at 08:00 AM IST daily.

---

## 6. Cloud Run Container Deployment

1. Build container using the production Dockerfile:
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/datanexus-suite:latest .
   ```
2. Push to Google Container Registry or Artifact Registry:
   ```bash
   docker push gcr.io/[PROJECT_ID]/datanexus-suite:latest
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy datanexus-suite \
     --image gcr.io/[PROJECT_ID]/datanexus-suite:latest \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --port 3000
   ```
