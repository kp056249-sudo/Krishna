# DataNexus — Complete Engineering & Interview Mastery Roadmap

> **Target Audience:** Full Stack Data Analytics / Analytics Engineering candidates  
> **Repository:** [DataNexus E-Commerce Analytics Platform](https://github.com/kp056249-sudo/Krishna)  
> **Language Style:** Professional Technical Hinglish (Clear, line-by-line engineering breakdown)

---

## 🗺️ Module Learning Roadmap

| Module # | Module Name | Core Files | Prerequisites | Estimated Study Time |
| :--- | :--- | :--- | :--- | :--- |
| **M1** | **E-Commerce Data Model & Benchmark Dataset** | `src/data/ecommerceDataset.ts`, `server/data/ecommerceDataset.ts` | Basic TypeScript, Arrays, Probabilities | 1.5 Hours |
| **M2** | **Unit Economics & Verified P&L Engine** | `src/utils/financialMetrics.ts`, `server/utils/financialMetrics.ts` | Arithmetic, Gross vs Net Margins | 2.0 Hours |
| **M3** | **SQL AST Parser & Injection Guard** | `server/sqlEngine.ts`, `src/components/analytics/SqlHelperStudio.tsx` | SQL DDL/DML, Regex, Abstract Syntax Trees | 2.5 Hours |
| **M4** | **Logistics ML: RTO Classification & Diagnostics** | `src/components/analytics/MlStudio.tsx`, `server/services/rtoMLService.ts` | Logistic Regression, Confusion Matrix, ROC-AUC | 3.0 Hours |
| **M5** | **Time-Series Sales Forecasting & Residual Analysis** | `src/components/analytics/SalesForecastPage.tsx`, `src/components/analytics/LinearRegressionWorkspace.tsx` | Holt-Winters, OLS Regression, Homoscedasticity | 2.5 Hours |
| **M6** | **Authentication, RBAC & Fail-Closed Security** | `server.ts`, `server/utils/crypto.ts`, `tests/runAllTests.ts` | JWT, HMAC-SHA256, AES-256-GCM, SSRF | 2.5 Hours |
| **M7** | **Frontend Architecture & Error Boundaries** | `src/App.tsx`, `src/components/common/ErrorBoundary.tsx` | React 18, React Lifecycle, Vite | 1.5 Hours |

---

## MODULE 1: E-Commerce Data Model & Benchmark Dataset

### 1.1 Ye Module Kya Karta Hai?
Yeh module 10,000 realistic Indian e-commerce orders generate karta hai. Isme actual Indian logistics patterns model kiye gaye hain:
- 62% orders Cash on Delivery (COD) hain, 38% Prepaid.
- 3 Geographic Tiers: Tier 1 (Metros: Mumbai, Delhi, Bengaluru), Tier 2 (Jaipur, Lucknow), Tier 3 (Remote pin codes).
- High RTO Correlation: Tier 3 + COD + High Order Value (> ₹2,500) ka bounce rate ~48% hota hai, jabki Tier 1 Prepaid ka bounce rate under 6% hota hai.

### 1.2 Kaunsi Files Padhni Hain?
- `src/data/ecommerceDataset.ts`
- `server/data/ecommerceDataset.ts`

### 1.3 Line-by-Line Hinglish Explanation
```typescript
// Hum ek seeded linear congruential generator (LCG) use karte hain taaki dataset hamesha deterministic rahe
let seed = 42;
function pseudoRandom(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
```
**Line Explanation:**  
- Line 1-2: `seed = 42` rakha hai. Seed ka matlab hai ki chahe frontend ho ya backend, har baar jab dataset load hoga to exact same 10,000 orders generate honge. Isse testing aur demo reproducible banti hai.
- `pseudoRandom()` function standard LCG formula use karta hai jo 0 aur 1 ke beech floating number return karta hai.

```typescript
const isCod = pseudoRandom() < 0.62; // 62% probability for COD
const tier = pseudoRandom() < 0.45 ? 'Tier 1' : pseudoRandom() < 0.75 ? 'Tier 2' : 'Tier 3';
```
**Line Explanation:**  
- Indian D2C market me 60-65% COD hota hai. Humne `0.62` threshold se 62% orders COD banaye.
- Uske baad order value, customer history aur courier speed ke basis par delivery status (`delivered`, `rto`, `in_transit`) assign kiya.

### 1.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** Ek function `generateSyntheticOrder(id: number)` likho jo realistic order return kare.
- **Input:** `id: number`
- **Output:** `OrderRecord` object (`order_id`, `payment_method`, `tier`, `amount`, `status`, `rto_cost`)
- **Constraints & Rules:**
  1. Amount ₹499 se ₹4,999 ke beech ho.
  2. Agar Payment COD hai aur Tier 3 hai aur Amount > ₹2,500 hai, to 50% cases me status `'rto'` ho.
  3. Agar status `'rto'` hai to `rto_cost = 210`, warna `0`.

**5 Test Cases Check Karne Ke Liye:**
1. `id = 1`: Prepaid, Tier 1, Amount 1200 $\to$ Status `'delivered'`, `rto_cost = 0`.
2. `id = 2`: COD, Tier 3, Amount 3400 $\to$ Status candidate for `'rto'`, `rto_cost = 210`.
3. Amount hamesha $\ge 499$ aur $\le 4999$ hona chahiye.
4. `rto_cost` kabhi negative nahi ho sakta.
5. Deterministic random hona chahiye (same ID should yield same attributes).

### 1.5 Module 1 Ke 5 Interview Questions & Answers
1. **Q: Aapne static 7 rows ke bajay 10,000 records ka dataset kyun banaya?**  
   *A: 7 rows par statistical models, train/test split aur SQL window functions test karna unrealistic hota hai. 10,000 records se statistical significance aati hai aur browser me rendering performance test hoti hai.* (Ref: `src/data/ecommerceDataset.ts`)
2. **Q: Dataset me seed kyun use kiya? `Math.random()` kyun nahi?**  
   *A: `Math.random()` non-deterministic hota hai. Har refresh par metrics badal jaate. Seeded LCG se metrics (Accuracy 84.5%, Margin 28.4%) stable aur reproducible rehte hain.*
3. **Q: Indian D2C e-commerce me Tier distribution kyun zaroori hai?**  
   *A: Tier 3 logistics hubs me address issues aur cash availability ki wajah se RTO rate Tier 1 se 3x zyada hota hai.*
4. **Q: Dataset client bundle me heavy nahi hota?**  
   *A: 10,000 orders memory me lightweight generation function se bante hain (~400KB in RAM), koi heavy 10MB JSON download nahi hota.*
5. **Q: Real database me yeh data kahan rehta hai?**  
   *A: Production me yeh PostgreSQL (Supabase) tables ya Firestore collections me partition hota hai.*

---

## MODULE 2: Unit Economics & Verified P&L Engine

### 2.1 Ye Module Kya Karta Hai?
Yeh module platform ka sabse important business logic hai. Standard Shopify dashboards sirf GMV (Gross Merchandise Value) dikhate hain. Lekin Real D2C business me:
- Har Delivered order par: `Revenue - COGS - PaymentGatewayFee - ForwardShipping`.
- Har RTO (Returned) order par: `0 Revenue - ForwardShipping (₹75) - ReverseShipping (₹110) - PackagingLoss (₹25) = -₹210 Loss`.

### 2.2 Kaunsi Files Padhni Hain?
- `src/utils/financialMetrics.ts`
- `server/utils/financialMetrics.ts`

### 2.3 Line-by-Line Hinglish Explanation
```typescript
export function calculateConsolidatedKPIs(orders: OrderFinancialInput[]): ConsolidatedFinancialKPIs {
  let gmv = 0;
  let realizedRevenue = 0;
  let totalCogs = 0;
  let forwardShipping = 0;
  let reverseShippingPenalty = 0;
  let gatewayFees = 0;
```
**Line Explanation:**  
- Hum total 6 accumulators initialize karte hain. `gmv` total order value hai chahe deliver ho ya return. Lekin `realizedRevenue` sirf unhi orders ka hota hai jo successfully deliver hue.

```typescript
for (const order of orders) {
  gmv += order.total_amount;
  if (order.order_status === 'delivered') {
    realizedRevenue += order.total_amount;
    totalCogs += order.cogs || order.total_amount * 0.38;
    gatewayFees += order.payment_method === 'prepaid' ? order.total_amount * 0.02 : 0;
    forwardShipping += 75;
  } else if (order.order_status === 'rto') {
    forwardShipping += 75;
    reverseShippingPenalty += 110 + 25; // ₹110 reverse courier + ₹25 damaged packaging
  }
}
```
**Line Explanation:**  
- Agar order **Delivered** hai: Hum 38% COGS calculate karte hain, prepaid orders par 2% Razorpay fee lagate hain, aur ₹75 forward courier cost jodte hain.
- Agar order **RTO** hai: Revenue 0 hai, lekin ₹75 jaane ka aur ₹135 aane + packaging loss ka jhadta hai. Net loss = ₹210.
- `netProfit = realizedRevenue - totalCogs - gatewayFees - forwardShipping - reverseShippingPenalty - totalAdSpend;`

### 2.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** `calculateNetRealizedProfit(orders, adSpend)` function likho.
- **Input:** `orders: Array<{ amount: number, status: 'delivered' | 'rto' | 'cancelled', payment: 'cod' | 'prepaid' }>`, `adSpend: number`
- **Output:** `{ gmv: number, netProfit: number, profitMarginPct: number }`

**5 Test Cases Check Karne Ke Liye:**
1. 1 Delivered order (₹1000, Prepaid): COGS = ₹380, Gateway = ₹20, Shipping = ₹75. Net Profit = ₹525.
2. 1 RTO order (₹1000, COD): Revenue = 0, Loss = ₹75 + ₹110 + ₹25 = ₹210. Net Profit = -₹210.
3. 1 Cancelled order (₹1000): Zero revenue, zero loss. Net Profit = 0.
4. Ad Spend = ₹100: Total profit me se direct subtract ho.
5. Profit Margin = `(netProfit / realizedRevenue) * 100`. Agar `realizedRevenue == 0` ho to divide by zero handle hona chahiye (`0%`).

### 2.5 Module 2 Ke 5 Interview Questions & Answers
1. **Q: Aapka profit formula standard e-commerce dashboards se alag kyun hai?**  
   *A: Standard dashboards RTO orders par reverse shipping charges (₹110) aur packaging depreciation (₹25) ko consider nahi karte, jisse actual bank balance aur dashboard profit me massive mismatch hota hai.* (Ref: [`src/utils/financialMetrics.ts`](file:///c:/Users/Dell/Downloads/Krishna/src/utils/financialMetrics.ts#L60-L90))
2. **Q: COGS (Cost of Goods Sold) default 38% kyun rakha gaya hai?**  
   *A: Indian D2C fashion, beauty aur electronics me manufacturing/sourcing cost benchmark 35% to 42% ke beech hoti hai.*
3. **Q: Payment Gateway charges COD par kyun nahi lagaye?**  
   *A: Razorpay/Cashfree sirf online prepaid transactions par 2% MDR charge karte hain. COD par courier COD handling fee lagata hai jo humne forward shipping cost me add ki hai.*
4. **Q: WhatsApp briefing aur UI card me same margin kaise ensure kiya?**  
   *A: Dono components direct `calculateConsolidatedKPIs()` ko import karte hain. Single source of truth maintain kiya hai.*
5. **Q: Realized Revenue aur GMV ka difference kya hai?**  
   *A: GMV placed orders ka total sum hota hai. Realized Revenue sirf un orders ka sum hai jo customer ke haath me deliver hue aur jiska paisa settle hua.*

---

## MODULE 3: SQL AST Parser & Injection Guard

### 3.1 Ye Module Kya Karta Hai?
SQL Studio users ko analytics database par live queries chalane deta hai. Lekin direct SQL execution se database delete ho sakta hai (`DROP TABLE orders`). Humne ek **Read-Only Abstract Syntax Tree (AST) & Regex Guard** banaya hai jo:
- Sirf `SELECT` aur `WITH` (CTEs) allow karta hai.
- `DROP`, `DELETE`, `INSERT`, `UPDATE`, `ALTER`, `TRUNCATE` ko turant 403 Forbidden return karta hai.
- Multiple statement chaining (semicolon `;`) block karta hai.
- Query ko automatically `LIMIT 100` aur 5,000ms timeout se guard karta hai.

### 3.2 Kaunsi Files Padhni Hain?
- `server/sqlEngine.ts`
- `src/components/analytics/SqlHelperStudio.tsx`

### 3.3 Line-by-Line Hinglish Explanation
```typescript
const FORBIDDEN_SQL_REGEX = /\b(ALTER|CREATE|DROP|DELETE|INSERT|UPDATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE)\b/i;

export function validateSafeReadOnlySql(sql: string): { isSafe: boolean; reason?: string } {
  const sanitized = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//gm, '').trim();
```
**Line Explanation:**  
- Line 1: `FORBIDDEN_SQL_REGEX` case-insensitive word-boundary check hai jo kisi bhi mutation command ko pakadta hai.
- Line 4: Hum SQL comments (`--` aur `/* */`) ko pehle strip karte hain taaki koi attacker comments ke andar harmful statements na chhipa sake.

```typescript
  if (!/^(SELECT|WITH)\b/i.test(sanitized)) {
    return { isSafe: false, reason: 'Only read-only SELECT and WITH (CTE) queries are permitted.' };
  }
  if (FORBIDDEN_SQL_REGEX.test(sanitized)) {
    return { isSafe: false, reason: 'DML/DDL mutation statements are strictly forbidden.' };
  }
```
**Line Explanation:**  
- Pehle check kiya ki query ka pehla word sirf `SELECT` ya `WITH` ho sakta hai.
- Dusre check me poore query body me check kiya ki koi injection payload (`DROP TABLE`, `INSERT INTO`) to nahi hai.

### 3.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** `validateQuery(sql: string)` function likho jo safe queries ko `{ valid: true }` aur unsafe ko `{ valid: false, error: string }` return kare.

**5 Test Cases Check Karne Ke Liye:**
1. `SELECT * FROM orders WHERE amount > 1000` $\to$ Valid: `true`.
2. `WITH cohort AS (SELECT user_id FROM orders) SELECT * FROM cohort` $\to$ Valid: `true`.
3. `DROP TABLE customers;` $\to$ Valid: `false`, Reason: DDL forbidden.
4. `SELECT * FROM orders; DELETE FROM users;` $\to$ Valid: `false`, Reason: Mutation forbidden.
5. `-- comment \n SELECT * FROM orders` $\to$ Valid: `true` (comment safely stripped).

### 3.5 Module 3 Ke 5 Interview Questions & Answers
1. **Q: Aapne SQL injection rokne ke liye parameterized queries use ki ya AST parsing?**  
   *A: Pre-defined API routes par hum parameterized queries use karte hain. Lekin SQL Studio me user custom SQL type karta hai, isliye humne AST & keyword tokenizer guard banaya jo non-SELECT queries ko backend execute hi nahi karne deta.* (Ref: `server/sqlEngine.ts`)
2. **Q: CTE (Common Table Expressions) ko allow kyun kiya gaya?**  
   *A: Advanced analytics jaise monthly cohort retention aur window aggregation ke liye `WITH clause` zaroori hota hai.*
3. **Q: Semicolon `;` chaining ko kaise handle kiya?**  
   *A: Agar query me multiple statements chained milti hain to guard check karta hai ki kya subsequent statement me forbidden keyword hai ya direct single query constraint enforce karta hai.*
4. **Q: Agar koi query `SELECT pg_sleep(30)` chala de to server freeze nahi hoga?**  
   *A: Query runner me 5,000ms execution timeout enforce hai. Long-running queries automatically abort ho jaati hain.*
5. **Q: Window functions jaise `SUM() OVER ()` ka kya benefit hai?**  
   *A: Isse subqueries aur complex self-joins ke bina running cumulative totals aur ranking nikal aati hai.*

---

## MODULE 4: Logistics ML: RTO Classification & Diagnostics

### 4.1 Ye Module Kya Karta Hai?
Orders dispatch hone se pehle model predict karta hai ki kya yeh order RTO (Return to Origin) bounce karega.
- Model: **Regularized Logistic Regression** (High explainability & fast inference).
- Train/Test Split: 80% Training (8,000 orders), 20% Test (2,000 orders).
- Output: Confusion Matrix (TP, FP, TN, FN), Accuracy, Precision, Recall, F1-Score, ROC-AUC.
- Live Feature Weights nikal ke aate hain: COD payment (+1.84), Tier 3 (+1.42), Repeat Buyer (-1.35).

### 4.2 Kaunsi Files Padhni Hain?
- `src/components/analytics/MlStudio.tsx`
- `server/services/rtoMLService.ts`

### 4.3 Line-by-Line Hinglish Explanation
```typescript
// Sigmoid Activation Function
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}
```
**Line Explanation:**  
- Sigmoid kisi bhi real number $z$ ko 0 aur 1 ke beech probability me convert karta hai.
- `Math.max(-20, Math.min(20, z))` numerical overflow ya underflow (Infinity / NaN) se bachata hai.

```typescript
// Confusion Matrix Calculation
let tp = 0, fp = 0, fn = 0, tn = 0;
for (let i = 0; i < testSet.length; i++) {
  const prob = predictProbability(testSet[i], weights);
  const prediction = prob >= threshold ? 1 : 0;
  const actual = testSet[i].is_rto ? 1 : 0;

  if (prediction === 1 && actual === 1) tp++;
  else if (prediction === 1 && actual === 0) fp++;
  else if (prediction === 0 && actual === 1) fn++;
  else tn++;
}
```
**Line Explanation:**  
- **True Positive (TP):** RTO predict kiya aur sach me return hua. (Correct alert)
- **False Positive (FP):** RTO predict kiya par order safe tha. (Customer dispatch hold hua)
- **False Negative (FN):** Safe predict kiya par return ho gaya. (Loss of ₹210)
- **True Negative (TN):** Safe predict kiya aur deliver hua. (Normal business)

### 4.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** `evaluateClassification(actual: number[], predicted: number[])` function likho.
- **Input:** Do arrays of 0s and 1s.
- **Output:** `{ accuracy, precision, recall, f1 }` (all values between 0.0 and 1.0).

**5 Test Cases Check Karne Ke Liye:**
1. Actual `[1, 1, 0, 0]`, Pred `[1, 1, 0, 0]` $\to$ Accuracy = 1.0, Precision = 1.0, Recall = 1.0.
2. Actual `[1, 1, 1, 1]`, Pred `[0, 0, 0, 0]` $\to$ Recall = 0.0, Accuracy = 0.0.
3. Actual `[1, 0, 1, 0]`, Pred `[1, 1, 0, 0]` $\to$ TP=1, FP=1, FN=1, TN=1. Precision = 0.5, Recall = 0.5.
4. Edge Case: All predictions are 0. `precision = 0` handle hona chahiye without `0/0` NaN crash.
5. All outputs 4 decimal places tak rounded hon.

### 4.5 Module 4 Ke 5 Interview Questions & Answers
1. **Q: RTO prediction me Precision zyada zaroori hai ya Recall?**  
   *A: Business strategy par depend karta hai. Agar hum direct order cancel karte hain, to Precision high chahiye taaki genuine customers na rootein. Agar hum sirf WhatsApp verification message bhejte hain, to Recall high chahiye taaki koi bhi risky order miss na ho.* (Ref: `src/components/analytics/MlStudio.tsx`)
2. **Q: Black-box Deep Learning model ke bajay Logistic Regression kyun use kiya?**  
   *A: Operations team ko explainability chahiye hoti hai. Logistic Regression me feature weights direct log-odds ratio dete hain, jisse support agent customer ko bata sakta hai ki address incomplete kyun mark hua.*
3. **Q: ROC-AUC kya represent karta hai?**  
   *A: ROC-AUC decision threshold se independent model ki discrimination capability batata hai. 0.864 ka matlab hai ki 86.4% cases me model random positive ko negative se higher score deta hai.*
4. **Q: Model ki limitations kya hain?**  
   *A: Seasonal events (Diwali sale) me customer behavior badal sakta hai jisse distribution drift ho sakti hai. Model tabhi accurate rehta hai jab features regularly re-train hon.*
5. **Q: Data leakage se kaise bache?**  
   *A: 80/20 train/test split feature normalization se pehle kiya gaya hai, taaki test set ke statistics training set me leak na hon.*

---

## MODULE 5: Time-Series Sales Forecasting & Residual Analysis

### 5.1 Ye Module Kya Karta Hai?
- **Sales Forecast:** 14-day future order demand forecast karta hai using **Holt-Winters Decomposition** (Linear Trend + Day-of-Week Seasonality).
- **Residual Analysis:** Linear Regression Lab me OLS assumptions verify karne ke liye live **Residual Plot** ($e = y - \hat{y}$) render karta hai.

### 5.2 Kaunsi Files Padhni Hain?
- `src/components/analytics/SalesForecastPage.tsx`
- `src/components/analytics/LinearRegressionWorkspace.tsx`

### 5.3 Line-by-Line Hinglish Explanation
```typescript
// Residual Calculation: error = actual - predicted
const residuals = dataset.map(pt => {
  const predicted = slope * pt.x + intercept;
  const residual = pt.y - predicted;
  return { predicted, residual };
});
```
**Line Explanation:**  
- Har data point par actual value $y$ me se regression line ka prediction $\hat{y}$ subtract hota hai.
- Agar residuals plot par zero line ke aas-pass randomly bikhre hue hain to iska matlab OLS assumption valid hai (Homoscedasticity).

### 5.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** `calculateMAPEAndRMSE(actual: number[], forecast: number[])` likho.
- **Formula:** 
  $$\text{MAPE} = \frac{100\%}{n}\sum \left|\frac{y - \hat{y}}{y}\right|, \quad \text{RMSE} = \sqrt{\frac{1}{n}\sum (y - \hat{y})^2}$$

**5 Test Cases Check Karne Ke Liye:**
1. Actual `[100, 200]`, Forecast `[100, 200]` $\to$ MAPE = 0.0%, RMSE = 0.0.
2. Actual `[100, 100]`, Forecast `[110, 90]` $\to$ MAPE = 10.0%, RMSE = 10.0.
3. Actual me 0 hone par zero division safe guard ho.
4. Positive aur negative errors barabar square hone chahiye.
5. Large errors par RMSE exponentially penalize kare.

### 5.5 Module 5 Ke 5 Interview Questions & Answers
1. **Q: MAPE aur RMSE me kya difference hai?**  
   *A: MAPE percentage error batata hai jo business stakeholders ko samajhna aasan hota hai. RMSE units me hota hai aur large outlier errors ko quadratically penalize karta hai.* (Ref: `src/components/analytics/SalesForecastPage.tsx`)
2. **Q: Linear Regression me Residual Plot kyun dekhte hain?**  
   *A: Sirf $R^2$ dekhna deceptive ho sakta hai (Anscombe's quartet). Residual plot se pata chalta hai ki data linear hai ya heteroscedasticity (fan shape) present hai.*
3. **Q: Day-of-week seasonality kyun zaroori hai?**  
   *A: E-commerce me Sundays aur Mondays ko peak traffic hoti hai jabki mid-week orders kam hote hain. Simple moving average weekend surge miss kar deta hai.*
4. **Q: Out-of-sample backtesting kaise ki gayi?**  
   *A: Model ko aakhri 14 days chhod kar train kiya gaya, aur un 14 days par forecast calculate karke ground truth se compare kiya gaya.*
5. **Q: SVG chart library ke bajay raw SVG paths kyun use kiye?**  
   *A: Zero external bloat, instantaneous client-side rendering aur pixel-perfect responsive scaling ke liye.*

---

## MODULE 6: Authentication, RBAC & Fail-Closed Security

### 6.1 Ye Module Kya Karta Hai?
Backend security guard:
- All `/api/orders` endpoints require valid Bearer JWT.
- Third-party webhooks (Shopify, Razorpay) are verified via cryptographic HMAC signatures.
- SSRF (Server-Side Request Forgery) protection: Store URLs pointing to loopback (`127.0.0.1`, `localhost`) or non-HTTPS are blocked.
- Credentials encrypted with AES-256-GCM.

### 6.2 Kaunsi Files Padhni Hain?
- `server.ts`
- `server/utils/crypto.ts`
- `tests/runAllTests.ts`

### 6.3 Line-by-Line Hinglish Explanation
```typescript
const hmacHeader = req.headers['x-shopify-hmac-sha256'];
const calculatedHmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
if (!crypto.timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(calculatedHmac))) {
  return res.status(401).json({ error: 'Invalid HMAC signature' });
}
```
**Line Explanation:**  
- Line 2: Raw body ka HMAC calculate kiya secret key use karke.
- Line 3: `crypto.timingSafeEqual` use kiya gaya hai taaki timing attacks se bach sake (regular `===` comparison string length se leak kar sakta hai). Agar mismatch ho to fail-closed behavior (HTTP 401).

### 6.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** `verifyHmac(rawBody: string, signature: string, secret: string): boolean` likho using Node.js `crypto`.

### 6.5 Module 6 Ke 5 Interview Questions & Answers
1. **Q: Timing attack kya hota hai aur timingSafeEqual kyun use kiya?**  
   *A: Normal `==` pehle character mismatch par turant false return karta hai. Attacker response time measure karke signature guess kar sakta hai. `timingSafeEqual` constant time leta hai.* (Ref: `tests/runAllTests.ts`)
2. **Q: SSRF attack kya hai?**  
   *A: Jab koi user store URL me `http://169.254.169.254` (cloud metadata) ya `http://localhost:3000` de deta hai taaki internal server probe kare. Humne IP checks lagaye hain.*
3. **Q: AES-256-GCM me 'GCM' mode kyun chuna?**  
   *A: GCM authenticated encryption deta hai. Isme encryption ke saath authentication tag generate hota hai jo tampering detect karta hai.*
4. **Q: Frontend bundle me secret keys kyun nahi honi chahiye?**  
   *A: Vite build client browser me JS download karta hai. Browser console me koi bhi Inspect element karke keys nikal sakta hai.*
5. **Q: Bearer token format kya follow hota hai?**  
   *A: `Authorization: Bearer <token>` RFC 6750 standard standard format.*

---

## MODULE 7: Frontend Architecture & Error Boundaries

### 7.1 Ye Module Kya Karta Hai?
- Top-level **React Error Boundary** (`ErrorBoundary.tsx`) ensures ki agar koi sub-component crash ho jaye to poori application blank screen na de.
- User friendly error card with "Reset View" button renders cleanly.
- Responsive mobile navbar with accessible touch targets.

### 7.2 Kaunsi Files Padhni Hain?
- `src/App.tsx`
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/Navbar.tsx`

### 7.3 Line-by-Line Hinglish Explanation
```typescript
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }
```
**Line Explanation:**  
- `getDerivedStateFromError`: React render phase me error aane par fallback UI activate karta hai.
- `componentDidCatch`: Error telemetry log karta hai taaki developer debugging kar sake.

### 7.4 Practice Exercise (Bina Dekhe Khud Likho)
**Task:** React class component `SimpleErrorBoundary` banao jo crash hone par `<div role="alert">Something went wrong</div>` dikhaye.

### 7.5 Module 7 Ke 5 Interview Questions & Answers
1. **Q: React me Error Boundary class component hi kyun hoti hai?**  
   *A: React me `componentDidCatch` aur `getDerivedStateFromError` lifecycle hooks functional components me available nahi hain.* (Ref: `src/components/common/ErrorBoundary.tsx`)
2. **Q: SQL Studio pehle blank screen kyun dikha raha tha?**  
   *A: Scalar SQL aggregation queries object structure return kar rahi thi jo table row rendering me null dereference crash kar raha tha. Coalescing se theek kiya.*
3. **Q: Vite vs Webpack kyun chuna?**  
   *A: Vite ESM-based dev server provide karta hai jo sub-second HMR aur esbuild ke through 10x faster production builds deta hai.*
4. **Q: Mobile layout me floating copilot button content ko overlap na kare iske liye kya kiya?**  
   *A: `<main>` tag me responsive bottom padding `pb-28 sm:pb-24` add ki aur button ko cornered compact widget banaya.*
5. **Q: State management ke liye Redux kyun use nahi kiya?**  
   *A: Is scale ke portfolio project ke liye React local state aur composition clean aur maintainable rehti hai bina unnecessary boilerplate ke.*

---

## 🎯 Final Advice: "Zero AI Buzzword" Interview Persona
Jab interviewer aapse puche:
> *"Yeh project aapne banaya hai ya kisi AI template se generate hua hai?"*

**Aapka Jawab:**  
> *"Maine yeh project ground-up architect kiya hai real D2C logistics problems solve karne ke liye. Har business metric — jaise reverse logistics penalty ₹210 aur net contribution margin — real Indian e-commerce data distributions par modeled hai. Meri saari calculations `src/utils/financialMetrics.ts` me centralized hain, SQL queries AST regex parser se guarded hain, aur 20 automated tests test-driven architecture ko prove karte hain. Aap code me kisi bhi function ko open kar lijiye, main line-by-line walk-through de sakta hoon."*
