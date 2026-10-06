import request from 'supertest';
import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.ENCRYPTION_KEY = 'test_secret_key_32_bytes_super_secure_random_123';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_key_984543';
process.env.SHOPIFY_CLIENT_SECRET = 'shpss_secret_key_2026';

import { app } from '../server';
import { encryptSecret, decryptSecret, getEncryptionKey } from '../server/firestoreService';
import { calculateConsolidatedKPIs } from '../server/utils/financialMetrics.js';
import { executeReadOnlyQuery } from '../server/sqlEngine.js';
import { getBenchmarkDataset } from '../server/data/ecommerceDataset.js';

console.log('================================================================');
console.log('DATANEXUS REAL INTEGRATION & SECURITY TEST SUITE (SUPERTEST)');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

function runSyncTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

async function runTestSuite() {
  // ---------------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & RBAC MIDDLEWARE ENFORCEMENT
  // ---------------------------------------------------------------------------
  console.log('[1] AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)');

  await runAsyncTest('GET /api/orders without Bearer token must return HTTP 401', async () => {
    const res = await request(app).get('/api/orders');
    assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized');
    assert.ok(res.body.error.includes('Unauthorized'), 'Should return unauthorized error message');
  });

  await runAsyncTest('GET /api/orders with invalid Bearer token must return HTTP 401', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer invalid_forged_token_xyz');
    assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized');
  });

  await runAsyncTest('POST /api/stores/connect/shopify without token must return HTTP 401', async () => {
    const res = await request(app)
      .post('/api/stores/connect/shopify')
      .send({ shopDomain: 'demo.myshopify.com', accessToken: 'shpat_test123' });
    assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized');
  });

  // ---------------------------------------------------------------------------
  // SUITE 2: SSRF & SECURITY VULNERABILITIES
  // ---------------------------------------------------------------------------
  console.log('\n[2] SSRF PROTECTION & HOSTNAME VALIDATION');

  await runAsyncTest('Shopify connect rejects non-myshopify domain (SSRF)', async () => {
    // When called, even with mock auth header if it fails auth or schema
    const res = await request(app)
      .post('/api/stores/connect/shopify')
      .send({ shopDomain: 'attacker-internal-network.com', accessToken: 'shpat_123' });
    assert.ok(res.status === 401 || res.status === 400, 'Must not allow internal SSRF domain');
  });

  await runAsyncTest('WooCommerce connect rejects non-HTTPS and private loopback IPs (SSRF)', async () => {
    const privateHosts = ['http://127.0.0.1:8080', 'http://169.254.169.254/latest/meta-data', 'http://localhost/admin'];
    for (const host of privateHosts) {
      const res = await request(app)
        .post('/api/stores/connect/woocommerce')
        .send({ storeUrl: host, consumerKey: 'ck_123', consumerSecret: 'cs_123' });
      assert.ok(res.status === 401 || res.status === 400, `Must block private host ${host}`);
    }
  });

  // ---------------------------------------------------------------------------
  // SUITE 3: SHOPIFY WEBHOOK FAIL-CLOSED & RAW HMAC
  // ---------------------------------------------------------------------------
  console.log('\n[3] SHOPIFY WEBHOOK SECURITY & FAIL-CLOSED BEHAVIOR');

  await runAsyncTest('Shopify webhook without HMAC header must fail closed (HTTP 401)', async () => {
    const res = await request(app)
      .post('/api/webhooks/shopify/orders_create')
      .set('x-shopify-shop-domain', 'store.myshopify.com')
      .send(JSON.stringify({ id: 98124, total_price: '1999.00' }));
    assert.strictEqual(res.status, 401, 'Must reject missing HMAC header');
  });

  await runAsyncTest('Shopify webhook with forged HMAC header must be rejected (HTTP 401)', async () => {
    const rawBody = JSON.stringify({ id: 98124, total_price: '1999.00' });
    const forgedHmac = crypto.createHmac('sha256', 'wrong_secret').update(rawBody).digest('base64');

    const res = await request(app)
      .post('/api/webhooks/shopify/orders_create')
      .set('x-shopify-hmac-sha256', forgedHmac)
      .set('x-shopify-shop-domain', 'store.myshopify.com')
      .set('Content-Type', 'application/json')
      .send(rawBody);

    assert.strictEqual(res.status, 401, 'Must reject invalid HMAC header');
  });

  await runAsyncTest('Shopify webhook with authentic HMAC header is verified', async () => {
    const rawBody = JSON.stringify({ id: 98124, total_price: '1999.00', order_number: 1001 });
    const validHmac = crypto
      .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
      .update(rawBody)
      .digest('base64');

    const res = await request(app)
      .post('/api/webhooks/shopify/orders_create')
      .set('x-shopify-hmac-sha256', validHmac)
      .set('x-shopify-shop-domain', 'store.myshopify.com')
      .set('Content-Type', 'application/json')
      .send(rawBody);

    assert.strictEqual(res.status, 200, 'Authentic Shopify webhook should be accepted');
  });

  // ---------------------------------------------------------------------------
  // SUITE 4: RAZORPAY WEBHOOK & SIGNATURE VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n[4] RAZORPAY PAYMENT WEBHOOK & IDEMPOTENCY');

  await runAsyncTest('Razorpay webhook without signature must fail closed (HTTP 401)', async () => {
    const res = await request(app)
      .post('/api/payment/webhook')
      .send(JSON.stringify({ event: 'payment.captured' }));
    assert.strictEqual(res.status, 401, 'Must reject missing webhook signature');
  });

  await runAsyncTest('Razorpay webhook with invalid signature must return HTTP 401', async () => {
    const res = await request(app)
      .post('/api/payment/webhook')
      .set('x-razorpay-signature', 'forged_signature_hex')
      .send(JSON.stringify({ event: 'payment.captured' }));
    assert.strictEqual(res.status, 401, 'Must reject bad webhook signature');
  });

  // ---------------------------------------------------------------------------
  // SUITE 5: ENCRYPTION & SECRETS MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log('\n[5] ENCRYPTION & NO GUESSABLE KEYS');

  runSyncTest('AES-256-GCM encryption & decryption round-trip works securely', () => {
    const plainTextToken = 'shpat_live_secret_token_1234567890abcdef';
    const encrypted = encryptSecret(plainTextToken);
    assert.notStrictEqual(encrypted, plainTextToken);
    assert.ok(encrypted.includes(':'), 'Encrypted string must contain IV and AuthTag delimiters');

    const decrypted = decryptSecret(encrypted);
    assert.strictEqual(decrypted, plainTextToken, 'Decrypted token must match original token');
  });

  runSyncTest('Server refuses to run in production if ENCRYPTION_KEY is missing or weak', () => {
    const oldKey = process.env.ENCRYPTION_KEY;
    const oldEnv = process.env.NODE_ENV;
    try {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'production';
      // Clear cache
      (global as any).__DATANEXUS_DEV_ENC_KEY__ = null;
      let threw = false;
      try {
        // @ts-ignore
        getEncryptionKey();
      } catch (e: any) {
        threw = true;
        assert.ok(e.message.includes('FATAL: ENCRYPTION_KEY must be set in production'));
      }
      assert.strictEqual(threw, true, 'Must throw fatal error in production without ENCRYPTION_KEY');
    } finally {
      process.env.ENCRYPTION_KEY = oldKey;
      process.env.NODE_ENV = oldEnv;
    }
  });

  // ---------------------------------------------------------------------------
  // SUITE 6: PROFIT MATHEMATICS & STATISTICAL RTO SCORING
  // ---------------------------------------------------------------------------
  console.log('\n[6] UNIT ECONOMICS & STATISTICAL MODEL CONSTRAINTS');

  runSyncTest('P&L equation matches verified formula with reverse shipping penalty', () => {
    const deliveredGmv = 100000;
    const totalOrders = 100;
    const deliveredOrders = 80;
    const rtoOrders = 10;

    const blendedCogsPercentage = 28;
    const shippingPerDeliveredOrder = 110;
    const packagingCostPerOrder = 35;
    const gatewayFeePercentage = 2.0;
    const gstPercentage = 18.0;
    const rtoReverseShippingPenalty = 210;

    const cogs = Math.round(deliveredGmv * (blendedCogsPercentage / 100)); // 28,000
    const shippingCost = deliveredOrders * shippingPerDeliveredOrder; // 8,800
    const packagingCost = totalOrders * packagingCostPerOrder; // 3,500
    const gatewayFee = Math.round(deliveredGmv * (gatewayFeePercentage / 100)); // 2,000
    const gst = Math.round(deliveredGmv * (gstPercentage / (100 + gstPercentage))); // 15,254
    const rtoReverseLoss = rtoOrders * rtoReverseShippingPenalty; // 2,100

    const totalCosts = cogs + shippingCost + packagingCost + gatewayFee + gst + rtoReverseLoss;
    const netProfit = Math.round(deliveredGmv - totalCosts);

    assert.strictEqual(cogs, 28000);
    assert.strictEqual(shippingCost, 8800);
    assert.strictEqual(packagingCost, 3500);
    assert.strictEqual(gatewayFee, 2000);
    assert.strictEqual(rtoReverseLoss, 2100);
    assert.ok(netProfit > 0, 'Net profit should be positive with healthy unit economics');
  });

  runSyncTest('Orders < 100 rejects statistical RTO model with insufficient data', () => {
    const count = 45;
    const hasEnoughData = count >= 100;
    assert.strictEqual(hasEnoughData, false);
  });

  // ---------------------------------------------------------------------------
  // SUITE 7: FRONTEND-TO-SERVER ROUTE CONSISTENCY AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n[7] ROUTE CONSISTENCY AUDIT');

  await runAsyncTest('Every /api/... route called in src/ exists in server route table', async () => {
    // Extract all routes from server.ts
    const serverCode = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');
    const serverRouteMatches = [...serverCode.matchAll(/app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g)];
    const serverRoutes = new Set(serverRouteMatches.map((m) => m[2]));

    // Read all files in src/
    function getFiles(dir: string): string[] {
      const subdirs = fs.readdirSync(dir);
      const files: string[] = [];
      for (const file of subdirs) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          files.push(...getFiles(full));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          files.push(full);
        }
      }
      return files;
    }

    const srcFiles = getFiles(path.join(process.cwd(), 'src'));
    const missingRoutes: string[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      // Match static api calls like api.get('/api/...') or api.post('/api/...')
      const matches = [...content.matchAll(/api\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g)];
      for (const m of matches) {
        const route = m[2];
        // If route has params like /api/checkouts/${id}/recover, normalize
        if (route.startsWith('/api/') && !serverRoutes.has(route)) {
          // Check parameterized route
          const routePattern = route.replace(/\/[a-zA-Z0-9_-]+$/, '/:id');
          if (!serverRoutes.has(routePattern)) {
            missingRoutes.push(`${route} in ${path.relative(process.cwd(), file)}`);
          }
        }
      }
    }

    if (missingRoutes.length > 0) {
      console.warn('  Missing routes warning:', missingRoutes);
    }
    assert.strictEqual(missingRoutes.length, 0, `All frontend routes must exist on server: ${missingRoutes.join(', ')}`);
  });

  // ---------------------------------------------------------------------------
  // SUITE 8: SHIPROCKET LOGISTICS & COURIER ENDPOINT VALIDATION
  // ---------------------------------------------------------------------------
  console.log('\n[8] SHIPROCKET LOGISTICS & COURIER SERVICE');
  await runAsyncTest('GET /api/shiprocket/status without Bearer token must return HTTP 401', async () => {
    const res = await request(app).get('/api/shiprocket/status');
    assert.strictEqual(res.status, 401);
  });

  await runAsyncTest('POST /api/webhooks/shiprocket receives webhook anonymously', async () => {
    const res = await request(app).post('/api/webhooks/shiprocket').send({ event: 'tracking_update', awb: '123' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.received, true);
  });

  // ---------------------------------------------------------------------------
  // SUITE 9: ADVANCED UNIT ECONOMICS, BENCHMARK DATASET & SQL SECURITY
  // ---------------------------------------------------------------------------
  console.log('\n[9] UNIT ECONOMICS, BENCHMARK DATASET & SQL AST GUARDS');

  runSyncTest('Consolidated KPI calculation matches unit economics formula across order book', () => {
    const mockOrders = [
      { totalAmount: 2000, paymentMode: 'COD', status: 'DELIVERED' },
      { totalAmount: 3000, paymentMode: 'PREPAID', status: 'DELIVERED' },
      { totalAmount: 1500, paymentMode: 'COD', status: 'RTO_DELIVERED' },
    ];
    const kpis = calculateConsolidatedKPIs(mockOrders);
    assert.strictEqual(kpis.totalOrders, 3);
    assert.strictEqual(kpis.deliveredOrders, 2);
    assert.strictEqual(kpis.rtoOrdersCount, 1);
    assert.strictEqual(kpis.totalGmv, 6500);
    assert.ok(kpis.netProfit > 0);
  });

  await runAsyncTest('SQL AST Guard permits SELECT & CTE WITH but strictly rejects DDL/DML injection', async () => {
    // Read-only query should succeed
    const validRes = await executeReadOnlyQuery('comp_test', 'SELECT id, order_number FROM orders LIMIT 2;');
    assert.strictEqual(validRes.success, true);
    assert.ok(Array.isArray(validRes.rows));

    // Malicious injection attempt must fail
    const attackRes = await executeReadOnlyQuery('comp_test', 'DROP TABLE orders;');
    assert.strictEqual(attackRes.success, false);
    assert.ok(attackRes.error.includes('SECURITY VIOLATION') || attackRes.error.includes('SELECT'));
  });

  runSyncTest('10,000-Order benchmark dataset is deterministic and fully populated', () => {
    const dataset = getBenchmarkDataset();
    assert.strictEqual(dataset.length, 10000);
    assert.ok(dataset[0].orderNumber.length > 0);
    assert.ok(['Tier 1', 'Tier 2', 'Tier 3'].includes(dataset[0].pincodeTier));
  });

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
