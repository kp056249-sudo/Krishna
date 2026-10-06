/**
 * KP-TECH / DataNexus Enterprise Operating Suite
 * Complete Multi-Tenant Type System
 */

export type NavigationTab =
  // Primary Quick Entry Screens
  | 'login_page'
  | 'store_connect_page'
  | 'real_ai_page'
  | 'api_keys_config'
  // Public & Auth
  | 'landing'
  | 'pricing'
  | 'login'
  | 'signup'
  | 'privacy_policy'
  | 'terms_of_service'
  // Onboarding
  | 'onboarding'
  | 'connect_store'
  // Core E-Commerce Modules
  | 'consolidated_dashboard'
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'inventory_forecast'
  | 'profit_loss'
  | 'profit_loss_recon'
  | 'profit_formula'
  | 'crore_profit_formula'
  | 'profit_engine'
  | 'rto_predictor'
  | 'recovery'
  | 'recovery_center'
  | 'customer_ltv'
  | 'logistics'
  | 'logistics_kaizen'
  | 'reconciliation'
  | 'ad_guard'
  | 'ad_guard_attribution'
  | 'benchmark'
  | 'autopilot'
  | 'alerts'
  | 'whatsapp'
  | 'whatsapp_briefing'
  | 'store_connectors'
  | 'shiprocket'
  | 'sku_intelligence'
  | 'rto_intelligence'
  // Executive & AI
  | 'ai_copilot'
  | 'gemini_calls'
  | 'telegram'
  | 'telegram_bot'
  | 'ceo_briefing'
  | 'executive_reports'
  // Data & Analytics Studio
  | 'data_visualization'
  | 'datasets'
  | 'sql_query'
  | 'sql_helper'
  | 'auto_eda'
  | 'ml_studio'
  | 'xai_explainer'
  | 'linear_regression'
  | 'sales_forecast'
  | 'pipeline_builder'
  | 'synthetic_data'
  | 'database_connectors'
  | 'google_sheets'
  // Account, Team & Security
  | 'subscription'
  | 'subscription_billing'
  | 'team'
  | 'team_rbac'
  | 'settings'
  | 'company_profile'
  | 'security'
  | 'admin_panel';

export type UserRole = 'Owner' | 'Admin' | 'Analyst' | 'Viewer';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  companyId?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
}

export type SubscriptionPlan = 'Free' | 'VIP_AutoPilot' | 'vip_enterprise' | 'starter';

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  currency: 'INR' | 'USD' | 'EUR';
  ownerEmail: string;
  ownerPhone: string;
  whatsappNumber: string;
  whatsappOptIn: boolean;
  briefingTime: string; // e.g. "08:00"
  timezone: string; // e.g. "Asia/Kolkata"
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  subscriptionOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export type StorePlatform = 'shopify' | 'woocommerce' | 'custom_api' | 'file_import';

export interface ConnectedStore {
  id: string;
  companyId: string;
  name: string;
  platform: StorePlatform;
  storeUrl: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncAt?: string;
  totalOrdersCount: number;
  totalRevenue: number;
  currency: string;
  errorMessage?: string;
  createdAt: string;
}

export interface UnitCosts {
  companyId: string;
  defaultCogsPercent: number; // e.g. 28%
  shippingPerOrder: number; // e.g. 90
  packagingPerOrder: number; // e.g. 25
  gatewayFeePercent: number; // e.g. 2.0%
  gstPercent: number; // e.g. 18%
  rtoReverseShippingCost: number; // e.g. 120
  skuCosts: Record<string, number>; // sku -> specific cogs in INR
}

export interface OrderRecord {
  id: string;
  companyId: string;
  storeId: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  state: string;
  pincode: string;
  orderTotal: number;
  totalAmount?: number;
  paymentMode: 'COD' | 'PREPAID';
  status: 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'RTO_INITIATED' | 'RTO_DELIVERED' | 'CANCELLED' | 'PENDING_CONFIRMATION';
  rtoRiskScore: number; // 0 - 100
  rtoRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rtoReasons: string[];
  courierPartner: string;
  awbNumber?: string;
  cogsAmount: number;
  shippingCost: number;
  calculatedNetProfit: number;
  createdAt: string;
  recoveredFromCart?: boolean;
}

export interface InventoryItem {
  sku: string;
  title: string;
  companyId: string;
  stockLevel: number;
  dailyVelocity: number;
  daysOfCover: number;
  reorderPoint: number;
  cogs: number;
  status: 'healthy' | 'low_stock' | 'critical' | 'dead_stock';
  warehouseLocation?: string;
}

export interface AbandonedCheckout {
  id: string;
  companyId: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  cartTotal: number;
  itemCount: number;
  itemsSummary: string;
  abandonedAt: string;
  recoveryStatus: 'pending' | 'message_sent' | 'recovered' | 'expired';
  recoveryDiscountCode?: string;
}

export interface CourierMetric {
  courier: string;
  totalShipments: number;
  onTimePercent: number;
  rtoPercent: number;
  avgDeliveryDays: number;
  avgCostInr: number;
  ndrPendingCount: number;
  ndrResolvedCount: number;
}

export interface AutopilotRule {
  id: string;
  companyId: string;
  name: string;
  category: 'RTO_DEFENSE' | 'AD_GUARD' | 'INVENTORY' | 'BRIEFING' | 'RECOVERY';
  description: string;
  enabled: boolean;
  lastTriggeredAt?: string;
  actionCount: number;
}

export interface AutopilotLog {
  id: string;
  companyId: string;
  ruleName: string;
  actionSummary: string;
  targetEntity: string;
  impactValue?: string;
  timestamp: string;
  status: 'executed' | 'alert_only' | 'failed';
}

export interface SystemAlert {
  id: string;
  companyId: string;
  type: 'RTO_SPIKE' | 'LOW_STOCK' | 'BLEEDING_AD' | 'PAYMENT_MISMATCH' | 'SYNC_ERROR' | 'SECURITY';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}

export interface IntegrationStatus {
  gemini: { configured: boolean; envVar: string };
  whatsappTwilio: { configured: boolean; envVar: string };
  whatsappMeta: { configured: boolean; envVar: string };
  shopify: { configured: boolean; envVar: string };
  woocommerce: { configured: boolean; envVar: string };
  razorpay: { configured: boolean; envVar: string };
  delhivery: { configured: boolean; envVar: string };
  aws: { configured: boolean; envVar: string };
  firebase: { configured: boolean; envVar: string };
}

// -----------------------------------------------------------------------------
// COMPATIBILITY & UI DOMAIN MODELS
// -----------------------------------------------------------------------------
export interface StoreAccount {
  id: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'amazon' | 'custom_api' | 'file_import';
  url: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncTime: string;
  dailyRevenue: number;
  dailyOrders: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  phone?: string;
  customerPhone?: string;
  customerEmail?: string;
  city: string;
  state: string;
  pincode: string;
  amount?: number;
  orderTotal?: number;
  totalAmount?: number;
  storeName?: string;
  paymentMode: 'COD' | 'PREPAID';
  status: 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'RTO_INITIATED' | 'RTO_DELIVERED' | 'CANCELLED' | 'PENDING_CONFIRMATION';
  rtoRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  rtoRiskLevel?: string;
  rtoScore?: number;
  rtoRiskScore?: number;
  courier?: string;
  courierPartner?: string;
  cogs?: number;
  netProfit?: number;
  predictedProfit?: number;
  timestamp?: string;
  createdAt?: string;
  recovered?: boolean;
  recoveredFromCart?: boolean;
  items?: string;
}

export interface EnterpriseKPIs {
  totalGmv: number;
  netProfit: number;
  netProfitMargin?: number;
  profitMarginPercent?: number;
  profitMarginPercentage?: number;
  totalOrders: number;
  deliveredOrders?: number;
  averageOrderValue: number;
  rtoRatePercent: number;
  rtoLossAmount?: number;
  rtoSavingsInr?: number;
  blendedRoas: number;
  adSpend?: number;
  ndrPending?: number;
  codPercent?: number;
  prepaidPercent?: number;
  tpsCurrent?: number;
  activeStoresCount?: number;
  activeCouriersCount?: number;
  lowStockCount?: number;
}

export interface CourierPerformance {
  courier: string;
  deliverySuccess?: number;
  totalShipments?: number;
  onTimeDeliveryRate?: number;
  onTimePercent?: number;
  avgTransitDays?: number;
  avgDeliveryDays?: number;
  rtoPercent: number;
  costPerShipment?: number;
  avgShippingCost?: number;
  ndrResolutionRate?: number;
  ndrPendingCount?: number;
  ndrResolvedCount?: number;
  status: 'Optimal' | 'Caution' | 'Underperforming' | 'optimal' | 'warning' | 'degraded';
}

export interface MLModelMetric {
  id?: string;
  name: string;
  algorithm?: string;
  category?: string;
  type?: string;
  accuracy: number;
  f1Score: number;
  aucRoc: number;
  r2Score?: number;
  rmse?: number;
  latencyMs?: number;
  trainingLatencyMs?: number;
  trainedOnRows?: string | number;
  status: 'Production Active' | 'Challenger' | 'Training' | 'Archived' | 'active' | 'evaluating' | 'candidate';
  lastTrained?: string;
  lastUpdated?: string;
  parameters?: string;
}

export interface FeatureImportance {
  feature: string;
  shapValue?: number;
  importance?: number;
  impact?: string;
  correlation?: string;
  description: string;
  category?: string;
}

export interface PipelineNode {
  id: string;
  name?: string;
  title?: string;
  type: 'ingestion' | 'transformation' | 'model' | 'destination' | 'sentinel' | 'source' | 'cleanser' | 'ml_filter' | 'transform' | 'sink';
  status: 'healthy' | 'running' | 'warning' | 'idle' | 'success';
  tps?: number;
  latencyMs: number;
  lastRun?: string;
  details?: string;
  recordsProcessed?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  status?: string;
  lastActive?: string;
  twoFactorEnabled?: boolean;
  permissions?: string[];
}

export interface ShiprocketOrder {
  id: string;
  orderId: number | string;
  channelOrderId: string;
  customerName: string;
  customerPhone?: string;
  city?: string;
  pincode?: string;
  awbCode: string;
  courierName: string;
  status: string;
  statusCode?: number;
  paymentMethod: 'COD' | 'PREPAID';
  orderValue: number;
  freightCharge: number;
  codCharges?: number;
  ndrStatus?: string;
  ndrReason?: string;
  ndrAttempts?: number;
  createdAt: string;
  rtoInitiated?: boolean;
}

export interface ShiprocketStatus {
  connected: boolean;
  email?: string;
  tokenExpiry?: string;
  lastSyncAt?: string;
  syncedOrdersCount?: number;
  activeShipmentsCount?: number;
  pendingNdrCount?: number;
}

export interface CourierScorecardItem {
  courierName: string;
  totalShipments: number;
  deliveredCount: number;
  rtoCount: number;
  ndrCount: number;
  ndrRecoveredCount: number;
  deliveryRatePercent: number;
  rtoPercent: number;
  ndrRecoveryPercent: number;
  avgTransitDays: number;
  avgCostPerOrder: number;
}

export interface NDROrderItem {
  id: string;
  orderId: string | number;
  awbCode: string;
  customerName: string;
  customerPhone: string;
  courierName: string;
  reason: string;
  attempts: number;
  lastAttemptAt: string;
  status: 'PENDING' | 'ACTION_TAKEN' | 'RE_ATTEMPT_SCHEDULED' | 'RTO_REQUESTED';
}

export interface WhatsAppRecipient {
  id: string;
  phone: string;
  cleanPhone: string;
  name: string;
  role: string;
  active: boolean;
  addedAt: string;
  lastMessageAt?: string;
  lastMessageStatus?: string;
  lastMessageSid?: string;
  alerts: {
    dailyBriefing: boolean;
    stockAlerts: boolean;
    rtoAlerts: boolean;
  };
}
