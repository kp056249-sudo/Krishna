import alasql from 'alasql';
import { adminDb } from './firestoreService.js';
import { getBenchmarkEcommerceDataset } from './data/ecommerceDataset.js';

export interface QueryResult {
  success: boolean;
  rows?: any[];
  columns?: string[];
  rowCount?: number;
  error?: string;
  executionTimeMs?: number;
  source?: string;
}

const FORBIDDEN_SQL_KEYWORDS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bUPDATE\b/i,
  /\bINSERT\b/i,
  /\bALTER\b/i,
  /\bTRUNCATE\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
];

/**
 * Executes a strictly READ-ONLY analytical SQL query using an isolated in-memory AlaSQL engine.
 * 
 * Safety & Quality Guards:
 * - Only SELECT and WITH (CTE) queries allowed.
 * - Rejects any data mutation or DDL keywords.
 * - Enforces default LIMIT 100 to prevent buffer exhaustion.
 * - Automatically populates orders, inventory, and stores tables from tenant Firestore + 10,000 benchmark records.
 */
export async function executeReadOnlyQuery(companyId: string, sql: string): Promise<QueryResult> {
  const start = Date.now();
  
  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    return {
      success: false,
      error: 'Empty query provided. Please write a valid SELECT or WITH statement.',
      executionTimeMs: 0
    };
  }

  const trimmedSql = sql.trim();
  const normalizedSql = trimmedSql.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '').trim(); // Remove SQL comments

  // 1. Validate starting statement
  const startsWithSelectOrWith = /^(SELECT|WITH)\b/i.test(normalizedSql);
  if (!startsWithSelectOrWith) {
    return {
      success: false,
      error: 'Security Guard: Only read-only queries starting with SELECT or WITH (Common Table Expression) are permitted in SQL Studio.',
      executionTimeMs: Date.now() - start
    };
  }

  // 2. Scan for mutation keywords
  for (const pattern of FORBIDDEN_SQL_KEYWORDS) {
    if (pattern.test(normalizedSql)) {
      return {
        success: false,
        error: `Security Guard: Mutation operation detected (${pattern.source.replace(/\\b/g, '')}). SQL Studio is restricted to read-only analytical queries.`,
        executionTimeMs: Date.now() - start
      };
    }
  }

  // 3. Multi-statement injection guard (semicolon followed by non-whitespace)
  const statements = normalizedSql.split(';').map(s => s.trim()).filter(Boolean);
  if (statements.length > 1) {
    return {
      success: false,
      error: 'Security Guard: Multiple SQL statements detected. Please execute one analytical query at a time.',
      executionTimeMs: Date.now() - start
    };
  }

  try {
    // Fetch tenant data from Firestore
    let tenantOrders: any[] = [];
    let tenantInventory: any[] = [];
    let tenantStores: any[] = [];

    try {
      const compRef = adminDb.collection('companies').doc(companyId);
      const [ordersSnap, inventorySnap, storesSnap] = await Promise.all([
        compRef.collection('orders').limit(500).get(),
        compRef.collection('inventory').limit(200).get(),
        compRef.collection('stores').limit(50).get()
      ]);

      tenantOrders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      tenantInventory = inventorySnap.docs.map(d => ({ ...d.data(), id: d.id }));
      tenantStores = storesSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch {
      // Fallback cleanly to benchmark data if Firestore offline
    }

    // Load benchmark 10,000 dataset for comprehensive OLAP analytics
    const benchmarkOrders = getBenchmarkEcommerceDataset(10000);
    const combinedOrders = tenantOrders.length > 0 ? [...tenantOrders, ...benchmarkOrders] : benchmarkOrders;

    const inventoryData = tenantInventory.length > 0 ? tenantInventory : [
      { sku: 'SKU-APP-101', name: 'Premium Oversized Cotton Tee', in_stock: 450, stock: 450, daily_velocity: 18, category: 'Apparel', reorder_point: 80 },
      { sku: 'SKU-APP-102', name: 'Slim Fit Denim Jeans (Indigo)', in_stock: 120, stock: 120, daily_velocity: 8, category: 'Apparel', reorder_point: 40 },
      { sku: 'SKU-FTW-201', name: 'Breathable Knit Running Shoes', in_stock: 65, stock: 65, daily_velocity: 12, category: 'Footwear', reorder_point: 50 },
      { sku: 'SKU-FTW-202', name: 'Leather Chelsea Boots (Tan)', in_stock: 28, stock: 28, daily_velocity: 4, category: 'Footwear', reorder_point: 20 },
      { sku: 'SKU-ELE-301', name: 'Active Noise Cancelling TWS Buds', in_stock: 310, stock: 310, daily_velocity: 22, category: 'Electronics', reorder_point: 90 },
      { sku: 'SKU-ELE-302', name: 'Fast-Charging 65W GaN Adapter', in_stock: 520, stock: 520, daily_velocity: 35, category: 'Electronics', reorder_point: 120 },
      { sku: 'SKU-BEA-401', name: 'Vitamin C Brightening Serum 30ml', in_stock: 890, stock: 890, daily_velocity: 45, category: 'Beauty', reorder_point: 150 },
      { sku: 'SKU-BEA-402', name: 'Ceramide Moisture Barrier Gel', in_stock: 410, stock: 410, daily_velocity: 28, category: 'Beauty', reorder_point: 90 },
      { sku: 'SKU-HOM-501', name: 'Aroma Diffuser with Warm LED', in_stock: 95, stock: 95, daily_velocity: 6, category: 'Home', reorder_point: 30 }
    ];

    const storesData = tenantStores.length > 0 ? tenantStores : [
      { id: 'store_shopify_flagship', name: 'Nexus D2C Flagship Store', platform: 'shopify', status: 'connected', region: 'India' },
      { id: 'store_woo_direct', name: 'Nexus Lifestyle Direct', platform: 'woocommerce', status: 'connected', region: 'India' },
      { id: 'store_amazon_in', name: 'Amazon Marketplace IN', platform: 'amazon', status: 'connected', region: 'India' }
    ];

    // Create fresh isolated session
    const db = new (alasql as any).Database();

    db.exec('CREATE TABLE orders');
    db.tables.orders.data = combinedOrders;

    db.exec('CREATE TABLE inventory');
    db.tables.inventory.data = inventoryData;

    db.exec('CREATE TABLE stores');
    db.tables.stores.data = storesData;

    // Enforce row limit if not specified by user
    let executableSql = statements[0];
    if (!/\bLIMIT\b/i.test(executableSql)) {
      executableSql += ' LIMIT 100';
    }

    // Execute
    const rawResult = db.exec(executableSql);

    // Normalize output format
    let rows: any[] = [];
    if (Array.isArray(rawResult)) {
      rows = rawResult.map((item, idx) => {
        if (item === null || item === undefined) return { result: null };
        if (typeof item !== 'object') return { value: item };
        return item;
      });
    } else if (rawResult !== null && rawResult !== undefined) {
      rows = typeof rawResult === 'object' ? [rawResult] : [{ value: rawResult }];
    }

    // Extract clean column names
    const columns: string[] = rows.length > 0 && rows[0] && typeof rows[0] === 'object' 
      ? Object.keys(rows[0]) 
      : [];

    return {
      success: true,
      rows: rows.slice(0, 200), // Hard cap at 200 rows for browser rendering performance
      rowCount: rows.length,
      columns,
      executionTimeMs: Date.now() - start,
      source: 'In-Memory AlaSQL Engine (Orders Benchmark Dataset · 10,000 rows)'
    };
  } catch (err: any) {
    return {
      success: false,
      error: `SQL Syntax or Execution Error: ${err.message}`,
      executionTimeMs: Date.now() - start
    };
  }
}
