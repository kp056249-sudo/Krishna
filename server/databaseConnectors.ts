import { Client as PgClient } from 'pg';
import mysql, { Connection as MysqlConnection } from 'mysql2/promise';
import { adminDb, recordAuditLog } from './firestoreService';

export interface DbConnectionConfig {
  type: 'postgres' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  useSsl: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export interface SchemaDiscoveryResult {
  success: boolean;
  tables?: string[];
  error?: string;
}

export interface DbQueryResult {
  success: boolean;
  rows?: any[];
  rowCount?: number;
  error?: string;
}

/**
 * Tests connection to a real PostgreSQL or MySQL database securely.
 */
export async function testDbConnection(config: DbConnectionConfig): Promise<ConnectionTestResult> {
  const timeoutMs = 8000;

  if (config.type === 'postgres') {
    const client = new PgClient({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.useSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: timeoutMs,
    });

    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      return { success: true, message: 'Successfully connected to PostgreSQL database!' };
    } catch (err: any) {
      return { success: false, message: `PostgreSQL connection failed: ${err.message}` };
    }
  } else {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.useSsl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: timeoutMs,
      });
      await connection.query('SELECT 1');
      await connection.end();
      return { success: true, message: 'Successfully connected to MySQL database!' };
    } catch (err: any) {
      return { success: false, message: `MySQL connection failed: ${err.message}` };
    }
  }
}

/**
 * Discovers the tables/schema of the connected database.
 */
export async function discoverDbTables(config: DbConnectionConfig): Promise<SchemaDiscoveryResult> {
  if (config.type === 'postgres') {
    const client = new PgClient({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.useSsl ? { rejectUnauthorized: false } : false,
    });

    try {
      await client.connect();
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      await client.end();
      const tables = res.rows.map((r: any) => r.table_name);
      return { success: true, tables };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.useSsl ? { rejectUnauthorized: false } : undefined,
      });
      const [rows] = await connection.query(`SHOW TABLES`);
      await connection.end();
      const tables = (rows as any[]).map((r: any) => Object.values(r)[0] as string);
      return { success: true, tables };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

/**
 * Executes a read-only query securely with timeouts and parameterization on the external database.
 */
export async function executeDbQuery(
  companyId: string,
  config: DbConnectionConfig,
  query: string,
  params: any[] = []
): Promise<DbQueryResult> {
  // Validate that the query is read-only SELECT
  const lowerQuery = query.trim().toLowerCase();
  const isSelect = lowerQuery.startsWith('select');
  const hasForbidden = /delete|update|insert|drop|alter|create|truncate|grant|revoke/i.test(lowerQuery);

  if (!isSelect || hasForbidden) {
    return {
      success: false,
      error: 'Forbidden: Only SELECT queries are permitted.',
    };
  }

  // Enforce audit logging
  await recordAuditLog(companyId, 'SYSTEM_DATABASE', 'DATABASE_QUERY', `Executed query on ${config.type}: ${query.substring(0, 100)}...`);

  if (config.type === 'postgres') {
    const client = new PgClient({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.useSsl ? { rejectUnauthorized: false } : false,
      statement_timeout: 10000, // Enforce 10s statement timeout
    });

    try {
      await client.connect();
      const res = await client.query(query, params);
      await client.end();
      return { success: true, rows: res.rows, rowCount: res.rowCount ?? 0 };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.useSsl ? { rejectUnauthorized: false } : undefined,
      });

      // Wrap query in a timeout promise
      const queryPromise = connection.query(query, params);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query execution timeout (10s)')), 10000)
      );

      const [rows] = (await Promise.race([queryPromise, timeoutPromise])) as any;
      await connection.end();
      return { success: true, rows: rows as any[], rowCount: (rows as any[]).length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
