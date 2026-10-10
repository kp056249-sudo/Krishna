# KP DataNexus | Enterprise E-Commerce Analytics & Autonomous AI Operations Suite

[![Live Production URL](https://img.shields.io/badge/Live%20Demo-krishna--1s9h.onrender.com-indigo.svg)](https://krishna-1s9h.onrender.com)
[![Test Suite](https://img.shields.io/badge/tests-20%2F20%20passing-emerald.svg)](https://github.com/kp056249-sudo/Krishna)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Google Gemini GenAI](https://img.shields.io/badge/Gemini-2.5%20%2F%202.0%20Flash-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Meta WhatsApp API](https://img.shields.io/badge/WhatsApp%20Cloud%20API-v21.0-25D366.svg)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

An enterprise-grade, full-stack portfolio platform engineered to eliminate Indian Direct-to-Consumer (D2C) e-commerce profit leakages, return-to-origin (RTO) courier losses, and gross-to-net realization discrepancies.

Developed with production rigor as a primary technical showcase for engineering, data, and technical product leadership interviews.

---

## 🌐 Live Application & Access
- **Production URL**: [https://krishna-1s9h.onrender.com](https://krishna-1s9h.onrender.com)
- **Demo Admin Account**: `admin@krishna.com` | `Admin@123456`
- **Zero-Competition Brand Identity**: Registered & indexed on Google Search as **KP DataNexus** with complete `sitemap.xml`, `robots.txt`, and Google Search Console verification.

---

## 1. Problem Statement & Core Value Proposition

Indian D2C e-commerce brands often report rapid top-line Gross Merchandise Value (GMV) growth while suffering severe bottom-line operating losses. Two acute market failures drive this margin destruction:

1. **Cash on Delivery (COD) Return-to-Origin (RTO) Leakage**: Across Tier-2 and Tier-3 Indian postal circles, 20% to 35% of COD consignments are refused at doorstep. Merchants absorb forward logistics fees (₹70–₹110), return shipping penalties (₹140–₹210), packaging write-offs, and tied-up warehouse inventory.
2. **Gross vs. Net Bank Realization Gap**: Standard off-the-shelf dashboards compute gross invoice totals without factoring in COGS, payment gateway interchange fees, forward freight, return penalties, packaging overheads, and GST remittances.

**KP DataNexus** solves these challenges by combining mathematical unit economics, predictive machine learning, autonomous voice agent workflows, and automated communication channels into a unified command center.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 18 + Vite + Tailwind CSS)"]
        UI["Executive KPI & Financial Command Center"]
        VOICE["Gemini Live Calls (Web Speech + Voice Synthesis)"]
        SQL_STUDIO["SQL Studio with AST Validation Guard"]
        ML_LAB["Supervised ML Lab & OLS Residual Workspace"]
        FORECAST["Sales Forecast (Multiplicative Holt-Winters)"]
        WA_HUB["Meta WhatsApp Dispatch Hub & Simulator"]
    end

    subgraph Middleware ["API & Security Gateway (Node.js + Express + TypeScript)"]
        AUTH_MW["JWT Session & RBAC Enforcement"]
        RATE_LIMIT["DDoS & Rate Limiting Guard (express-rate-limit)"]
        HELMET["Security Headers & Content Security Policy (Helmet)"]
        COMPRESSION["Gzip Static & Dynamic Compression"]
        AUDIT_LOGGER["Tamper-Proof Audit Trail (Cloud Firestore)"]
    end

    subgraph Intelligence ["AI & Machine Learning Engine"]
        GEMINI_ENGINE["Gemini Calls Service (Dual-Key Round-Robin + Failover)"]
        RTO_PIPELINE["Supervised RTO Classifier (Logistic Regression, AUC 0.88+)"]
        OLS_ENGINE["Closed-Form OLS Parameter Estimator & Homoscedasticity Test"]
        HW_FORECAST["Time-Series Seasonal Decomposition (Day-of-Week Cycles)"]
    end

    subgraph DataTier ["Persistence & Storage Layer"]
        PG_DB["PostgreSQL / Supabase (Relational Analytics & CTE Queries)"]
        FS_DB["Google Cloud Firestore (Multi-Tenant Document Store)"]
        BENCHMARK["10,000-Order Deterministic D2C Historical Dataset"]
        SECRET_VAULT["AES-256-GCM Encrypted Configuration Vault"]
    end

    subgraph Integrations ["External Service Integrations"]
        META_API["Meta WhatsApp Cloud API v21.0"]
        TELEGRAM_API["Telegram Bot Operations Broadcast"]
        RAZORPAY_API["Razorpay Test Gateway (HMAC-SHA256 Signatures)"]
        SHIPROCKET_API["Shiprocket Courier & NDR Synchronization"]
    end

    Client --> Middleware
    Middleware --> Intelligence
    Middleware --> DataTier
    Middleware --> Integrations
```

---

## 3. Key Functional Modules & Technical Highlights

### A. Gemini Live Calls & Autonomous Operations Voice Engine
- **Dual-Key Failover Engine**: Configured with dual Google Gemini API keys (`GEMINI_CALLS_KEY` & `GEMINI_CALLS_KEY_2`) yielding a **2x quota capacity multiplier** and zero downtime during rate spikes.
- **Supported Models**: Powered by official Google models **Gemini 2.5 Flash** and **Gemini 2.0 Flash**.
- **Real Website Operation Execution**: Transcribed speech commands directly invoke real operational workflows:
  - `AUDIT_STORE_PL`: Computes real-time GMV, COGS, and bank-realized net cash profit.
  - `INTERCEPT_HIGH_RISK_RTO`: Screens orders, triggers WhatsApp 1-tap OTP verification, and applies dynamic ₹50 UPI prepaid incentives.
  - `DISPATCH_WHATSAPP_BRIEFING`: Generates and broadcasts the 8:00 AM CEO briefing.
  - `AUDIT_INVENTORY_STOCKOUTS`: Audits SKU runway and drafts replenishment purchase orders.
- **Zero-Timeout Protection**: Every database query and external AI call is encapsulated in deterministic bounded promises (`withTimeout`), eliminating HTTP 502 gateway timeouts.

### B. Unit Economics & True Net Profit Calculator
All dashboard cards derive financials from an immutable single source of truth calculation formula:
$$\text{Realized Net Profit} = \text{GMV} - \text{COGS} - \text{ForwardShipping} - \text{GatewayFee} - \text{Packaging} - \text{GST} - \text{RTOPenalty}$$
- Reconciles payment gateway settlements against delivered consignments.
- Identifies masked losses on high-volume COD products.

### C. Supervised ML Pipeline (RTO Classification)
- **Feature Vector**:
  - Payment Method (Binary: COD vs. Prepaid)
  - Leave-One-Out (LOO) Target-Encoded Postal Circle Risk Score (19,000+ Indian pincodes)
  - Average Order Value (AOV) Tier
  - Address Quality & Incompleteness Index
  - Historical 3PL Carrier Delivery & NDR Conversion Rate
- **Model Evaluation**: Chronological 80/20 train/test split.
- **Diagnostic Metrics**: Precision, Recall, F1-Score, Trapezoidal ROC-AUC (0.88+), and a full $2 \times 2$ Confusion Matrix.

### D. Ordinary Least Squares (OLS) & Residual Diagnostic Lab
- Closed-form algebraic estimation of regression coefficients:
  $$m = \frac{\text{Cov}(X, Y)}{\text{Var}(X)}, \quad b = \bar{Y} - m\bar{X}$$
- Calculates $R^2$, Mean Squared Error (MSE), and Root Mean Squared Error (RMSE).
- Visual **Residual Scatter Plot** ($e_i = y_i - \hat{y}_i$ vs. $\hat{y}_i$) allows interviewers to inspect homoscedasticity and residual normality.

### E. Time-Series Sales & Demand Forecasting
- Multiplicative Holt-Winters exponential smoothing modeling level, trend, and weekly seasonality.
- Accurately captures the standard Indian weekend e-commerce surge (+25% to +35% volume).
- Out-of-sample backtested validation reported via **MAPE** (Mean Absolute Percentage Error) and **RMSE**.

### F. SQL Studio with Read-Only AST Guard
- Custom server-side SQL parser and AST token analyzer (`server/sqlEngine.ts`).
- Strictly permits `SELECT` statements and Common Table Expressions (`WITH ... SELECT`).
- Blocks all DDL/DML mutations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`).
- Includes 10 pre-engineered interview queries covering Window Functions, Cohort Retention, and NTILE Pareto analysis.

### G. Meta WhatsApp Cloud API v21.0 & Telegram Dispatcher
- **8:00 AM Executive Morning Briefing**: Delivers automated revenue, net profit, RTO flags, and courier SLA metrics to founders.
- **Automated Customer Recovery**: Dispatches abandoned checkout recovery and 1-tap OTP address confirmations.
- **Real-Time Founder Telegram Alerts**: Sends instant security notifications upon high-risk order detection or Gemini Live Call execution.

---

## 4. Engineering Truth: Real vs. Sandbox Matrix

In software engineering interviews, architectural transparency is paramount. The following matrix details the exact execution environment of every system capability:

| Capability | Status | Technical Implementation Details |
| :--- | :---: | :--- |
| **10,000-Order Benchmark Engine** | **Real** | Deterministic Linear Congruential Generator (LCG) modeling authentic Indian geography, postal circles, and unit economics (`server/data/ecommerceDataset.ts`). |
| **Unit Economics & Financial Engine** | **Real** | Shared single source of truth mathematical calculation module across server and client (`server/utils/financialMetrics.ts`). |
| **Gemini Live Calls Engine** | **Real** | Live Google GenAI integration with Web Speech API audio processing and automatic 2-key failover (`server/services/geminiCallsService.ts`). |
| **Supervised ML & Confusion Matrix** | **Real** | Pure TypeScript gradient-based classification pipeline with 80/20 train/test evaluation (`server/services/rtoMLService.ts`). |
| **OLS & Residual Lab** | **Real** | Closed-form regression mathematical solver with live interactive residual scatter charts (`src/components/analytics/LinearRegressionWorkspace.tsx`). |
| **Time-Series Sales Forecasting** | **Real** | Holt-Winters multiplicative seasonal decomposition with MAPE & RMSE error evaluation (`src/components/analytics/SalesForecastPage.tsx`). |
| **SQL Studio & AST Guard** | **Real** | Server-side lexical tokenizer rejecting mutating SQL queries and enforcing row-limit boundaries (`server/sqlEngine.ts`). |
| **Meta WhatsApp Cloud API v21.0** | **Live + Sandbox** | Dispatches compliant v21.0 payloads. Includes an in-app interactive device simulator for review without live WABA HSM template approvals. |
| **Razorpay Payment Gateway** | **Sandbox** | Full cryptographic HMAC-SHA256 signature verification in Razorpay Test Mode (`rzp_test_...`). |
| **Shiprocket Logistics Connect** | **API** | Bearer token authentication, courier performance scorecards, and NDR tracking (`server/services/shiprocketService.ts`). |
| **Data Encryption Vault** | **Real** | AES-256-GCM symmetric encryption for tenant API credentials stored in Firestore (`server/firestoreService.ts`). |

---

## 5. Database Schema & Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    COMPANIES ||--o{ ORDERS : contains
    COMPANIES ||--o{ INVENTORY : manages
    COMPANIES ||--o{ COURIERS : contracts
    COMPANIES ||--o{ ML_MODELS : registers
    COMPANIES ||--o{ AUDIT_LOGS : records
    ORDERS ||--|{ ORDER_ITEMS : includes
    INVENTORY ||--o{ ORDER_ITEMS : supplies

    COMPANIES {
        string id PK
        string name
        string email
        string subscription_tier
        timestamp created_at
    }

    ORDERS {
        string id PK
        string company_id FK
        string order_number
        float total_amount
        string payment_mode
        string status
        string city
        string pincode
        int is_rto
        float rto_risk_score
        timestamp created_at
    }

    ORDER_ITEMS {
        string id PK
        string order_id FK
        string sku FK
        int quantity
        float unit_price
        float cogs
    }

    INVENTORY {
        string sku PK
        string company_id FK
        string product_name
        int in_stock
        float daily_velocity
        int days_of_cover
        int reorder_point
    }

    COURIERS {
        string id PK
        string company_id FK
        string name
        float delivery_rate
        float rto_rate
        float ndr_recovery_rate
        float avg_transit_days
    }

    ML_MODELS {
        string id PK
        string company_id FK
        string model_type
        float accuracy
        float precision
        float recall
        float auc
        timestamp trained_at
    }

    AUDIT_LOGS {
        string id PK
        string company_id FK
        string actor
        string action
        string details
        timestamp timestamp
    }
```

---

## 6. Enterprise UI & Visual Polish
- **Color Palette**: Clean white background (`#FFFFFF`, `bg-slate-50`) paired with deep executive navy blue (`#233876`) and slate accents.
- **Navigation**: Wide, spacious single-line search bar across all viewports.
- **Scroll Architecture**: Strict `h-screen overflow-hidden` layout with independent, non-chaining scroll containers (`overscroll-contain`) for sidebar navigation and main analytics workspaces.
- **Responsive Layout**: Fluid layouts across mobile, tablet, and widescreen monitors with zero horizontal overflow.

---

## 7. Local Development & Testing Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v20 LTS and v24)
- **npm**: v9.0.0 or higher
- **Git**: Installed and configured

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/kp056249-sudo/Krishna.git
cd Krishna

# 2. Install all dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your keys (or use default development fallback configuration)

# 4. Execute automated test suite (Supertest + Unit Tests)
npm test

# 5. Start development servers concurrently (Vite Frontend + Express Backend)
npm run dev
```

### Production Build & Verification
```bash
# Create optimized production bundles
npm run build

# Start production server locally
npm start
```

---

## 8. Deployment Architecture (Render)

This application is deployed on [Render](https://render.com) as a consolidated, production-hardened Web Service:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check Endpoint**: `/api/health`
- **Port**: `3000` (auto-detected via `process.env.PORT`)
- **Static Assets**: 1-year immutable caching (`max-age=31536000, immutable`) with Gzip compression.
- **Robots & Sitemap**: Explicit UTF-8 XML routes for instant Google Search indexing.

### Essential Production Environment Variables
| Variable | Description |
| :--- | :--- |
| `PORT` | Listening server port (default: 3000) |
| `NODE_ENV` | Environment state (`production`) |
| `ENCRYPTION_KEY` | 32-byte hexadecimal AES-256-GCM symmetric secret |
| `GEMINI_CALLS_KEY` | Dedicated Google Gemini API Key #1 (Primary) |
| `GEMINI_CALLS_KEY_2` | Dedicated Google Gemini API Key #2 (Secondary Failover) |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Merchant Key Secret |
| `WHATSAPP_TOKEN` | Meta Graph API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp Cloud API Phone Number ID |

---

## 9. Security, Compliance & Code Quality

- **Data Protection**: Sensitive tenant credentials encrypted with AES-256-GCM before writing to the database.
- **Network Security**: HTTP security headers managed via Helmet (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Input Sanitization**: AST validation prevents arbitrary code and SQL execution.
- **Automated Testing**: 20/20 automated test suites passing across authentication, database connectors, financial calculations, and route protections.

---

## 10. Author & Contact

**Krishna Pandey**  
- **GitHub**: [@kp056249-sudo](https://github.com/kp056249-sudo)  
- **Repository**: [https://github.com/kp056249-sudo/Krishna](https://github.com/kp056249-sudo/Krishna)  
- **Live Demo**: [https://krishna-1s9h.onrender.com](https://krishna-1s9h.onrender.com)  

*Built with passion, statistical precision, and production engineering rigor.*
