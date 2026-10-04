/**
 * DATANEXUS SQL SCHEMA MODELS & DDL DEFINITIONS
 * Tables: orders, customers, metrics, alerts, audit_logs, autopilot_rules, store_credentials
 * Supports: PostgreSQL, MySQL, Cloud SQL
 */

export const DATANEXUS_SQL_DDL = `
-- =============================================================================
-- DATANEXUS ENTERPRISE AUTONOMOUS ENGINE SQL SCHEMA
-- =============================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(16) NOT NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    rto_count INT DEFAULT 0,
    rto_rate DECIMAL(5, 2) DEFAULT 0.00,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    store_id VARCHAR(128) NOT NULL,
    order_number VARCHAR(64) NOT NULL,
    customer_id VARCHAR(128) REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(16) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(16) CHECK (payment_mode IN ('COD', 'PREPAID')),
    status VARCHAR(32) CHECK (status IN ('PENDING', 'CONFIRMED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RTO', 'CANCELLED')),
    rto_risk_level VARCHAR(16) CHECK (rto_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    rto_risk_score INT CHECK (rto_risk_score BETWEEN 0 AND 100),
    rto_reasons TEXT[],
    cogs DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    net_profit DECIMAL(10, 2) DEFAULT 0.00,
    courier_partner VARCHAR(64),
    awb_number VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. METRICS TABLE
CREATE TABLE IF NOT EXISTS metrics (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    metric_date DATE NOT NULL,
    total_gmv DECIMAL(14, 2) DEFAULT 0.00,
    delivered_revenue DECIMAL(14, 2) DEFAULT 0.00,
    rto_loss DECIMAL(12, 2) DEFAULT 0.00,
    ad_spend DECIMAL(12, 2) DEFAULT 0.00,
    blended_roas DECIMAL(6, 2) DEFAULT 0.00,
    net_profit DECIMAL(14, 2) DEFAULT 0.00,
    cod_share_percentage DECIMAL(5, 2) DEFAULT 0.00,
    overall_rto_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, metric_date)
);

-- 4. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    alert_type VARCHAR(32) CHECK (alert_type IN ('RTO_RISK', 'ROAS_BLEED', 'STOCKOUT', 'COURIER_SLA', 'SYSTEM')),
    severity VARCHAR(16) CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    details TEXT NOT NULL,
    suggested_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AUTOPILOT RULES TABLE
CREATE TABLE IF NOT EXISTS autopilot_rules (
    id VARCHAR(128) PRIMARY KEY,
    company_id VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    trigger_condition TEXT NOT NULL,
    action_payload TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_company_status ON orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_rto_risk ON orders(company_id, rto_risk_level);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(company_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(company_id, is_resolved);
`;

export interface SqlOrderModel {
  id: string;
  company_id: string;
  store_id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  state: string;
  pincode: string;
  amount: number;
  payment_mode: 'COD' | 'PREPAID';
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'RTO' | 'CANCELLED';
  rto_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rto_risk_score: number;
  rto_reasons?: string[];
  cogs: number;
  shipping_cost: number;
  net_profit: number;
  courier_partner?: string;
  awb_number?: string;
  created_at: string;
}

export interface SqlCustomerModel {
  id: string;
  company_id: string;
  full_name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  pincode: string;
  total_orders: number;
  total_spent: number;
  rto_count: number;
  rto_rate: number;
  is_blacklisted: boolean;
  created_at: string;
}

export interface SqlMetricModel {
  id: string;
  company_id: string;
  metric_date: string;
  total_gmv: number;
  delivered_revenue: number;
  rto_loss: number;
  ad_spend: number;
  blended_roas: number;
  net_profit: number;
  cod_share_percentage: number;
  overall_rto_rate: number;
  created_at: string;
}

export interface SqlAlertModel {
  id: string;
  company_id: string;
  title: string;
  alert_type: 'RTO_RISK' | 'ROAS_BLEED' | 'STOCKOUT' | 'COURIER_SLA' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  suggested_action?: string;
  is_resolved: boolean;
  whatsapp_sent: boolean;
  created_at: string;
}

export interface SqlAuditLogModel {
  id: string;
  company_id: string;
  user_id: string;
  action: string;
  details: string;
  metadata?: any;
  created_at: string;
}
