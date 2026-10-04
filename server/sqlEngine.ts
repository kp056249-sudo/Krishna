import alasql from 'alasql';
import { adminDb } from './firestoreService.js';

/**
 * DataNexus In-Memory SQL Execution Engine
 * Bridges Cloud Firestore with SQL query capabilities.
 */

export interface QueryResult {
  success: boolean;
  rows?: any[];
  columns?: string[];
  error?: string;
  executionTimeMs?: number;
}

/**
 * Executes a read-only SELECT query against Firestore collections.
 */
export async function executeReadOnlyQuery(companyId: string, sql: string): Promise<QueryResult> {
  const start = Date.now();
  
  // Security: Block non-SELECT queries
  const cleanSql = sql.trim().toUpperCase();
  if (!cleanSql.startsWith('SELECT')) {
    return { success: false, error: 'Only SELECT queries are permitted in the SQL Studio.' };
  }

  try {
    const compRef = adminDb.collection('companies').doc(companyId);
    
    // Fetch data for tables
    const [ordersSnap, inventorySnap, storesSnap] = await Promise.all([
      compRef.collection('orders').get(),
      compRef.collection('inventory').get(),
      compRef.collection('stores').get()
    ]);

    const orders = ordersSnap.docs.map(d => {
      const data = d.data();
      const amount = Number(data.totalAmount || data.orderTotal || data.amount || 0);
      const orderNum = String(data.orderNumber || data.id || '');
      const mode = String(data.paymentMode || data.mode || 'PREPAID');
      const stat = String(data.status || 'DELIVERED');
      const cust = String(data.customerName || data.name || '');
      const pin = String(data.pincode || data.zip || '');
      const ct = String(data.city || '');
      const sk = String(data.sku || 'GENERAL');

      return {
        ...data,
        id: d.id,
        // CamelCase
        orderNumber: orderNum,
        totalAmount: amount,
        paymentMode: mode,
        customerName: cust,
        pincode: pin,
        city: ct,
        status: stat,
        sku: sk,
        // Snake_case aliases
        order_number: orderNum,
        amount: amount,
        total_amount: amount,
        mode: mode,
        payment_mode: mode,
        customer_name: cust,
        pin_code: pin,
        created_at: data.createdAt || data.date || ''
      };
    });

    const inventory = inventorySnap.docs.map(d => {
      const data = d.data();
      const stock = Number(data.inStock || data.stock || 0);
      const vel = Number(data.dailyVelocity || data.velocity || 1);
      const sk = String(data.sku || d.id);
      const nm = String(data.name || data.title || sk);
      const runway = Number(data.daysOfRunway || (vel > 0 ? Math.floor(stock / vel) : 30));

      return {
        ...data,
        id: d.id,
        sku: sk,
        name: nm,
        inStock: stock,
        dailyVelocity: vel,
        daysOfRunway: runway,
        // Snake_case aliases
        in_stock: stock,
        daily_velocity: vel,
        days_of_runway: runway
      };
    });

    const stores = storesSnap.docs.map(d => ({ ...d.data(), id: d.id }));

    // Create a local session to avoid polluting global alasql state
    const db = new (alasql as any).Database();
    
    // Seed tables
    db.exec('CREATE TABLE orders');
    db.tables.orders.data = orders;
    
    db.exec('CREATE TABLE inventory');
    db.tables.inventory.data = inventory;
    
    db.exec('CREATE TABLE stores');
    db.tables.stores.data = stores;

    // Execute user query
    const result = db.exec(sql);
    
    const rows = Array.isArray(result) ? result : [result];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      success: true,
      rows,
      columns,
      executionTimeMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      success: false,
      error: `SQL Execution Error: ${err.message}`,
      executionTimeMs: Date.now() - start
    };
  }
}
