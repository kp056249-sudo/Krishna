/**
 * DataNexus Financial & Unit Economics Calculation Engine (Server)
 * 
 * Synchronized with src/utils/financialMetrics.ts to guarantee exact 
 * calculation parity between server briefings, API calculations, and client dashboards.
 */

export interface OrderItemInput {
  totalAmount?: number;
  orderTotal?: number;
  amount?: number;
  paymentMode?: string;
  status?: string;
  cogs?: number;
  cogsAmount?: number;
  shippingCost?: number;
  gatewayFee?: number;
  rtoLoss?: number;
  netProfit?: number;
  calculatedNetProfit?: number;
  rtoRiskScore?: number;
}

export interface UnitEconomicsCosts {
  defaultCogsPercent: number;
  shippingPrepaidInr: number;
  shippingCodInr: number;
  rtoReverseShippingInr: number;
  packagingInr: number;
  gatewayFeePercent: number;
  gstPercent: number;
}

export const DEFAULT_UNIT_ECONOMICS: UnitEconomicsCosts = {
  defaultCogsPercent: 0.35,
  shippingPrepaidInr: 70,
  shippingCodInr: 110,
  rtoReverseShippingInr: 140,
  packagingInr: 15,
  gatewayFeePercent: 0.02,
  gstPercent: 0.05,
};

export function calculateOrderNetProfit(
  order: OrderItemInput,
  costs: UnitEconomicsCosts = DEFAULT_UNIT_ECONOMICS
): number {
  const gmv = Number(order.totalAmount || order.orderTotal || order.amount || 0);
  if (gmv <= 0) return 0;

  const mode = String(order.paymentMode || 'COD').toUpperCase();
  const isCod = mode === 'COD';
  const status = String(order.status || 'DELIVERED').toUpperCase();
  const isRto = status.includes('RTO') || status.includes('RETURN') || status.includes('CANCEL');

  const cogs = order.cogs || order.cogsAmount || gmv * costs.defaultCogsPercent;
  const forwardShipping = isCod ? costs.shippingCodInr : costs.shippingPrepaidInr;
  const gatewayFee = isCod ? 0 : gmv * costs.gatewayFeePercent;
  const packaging = costs.packagingInr;
  const gst = gmv * costs.gstPercent;

  if (isRto) {
    const totalRtoLoss = forwardShipping + costs.rtoReverseShippingInr + packaging;
    return -Math.round(totalRtoLoss);
  }

  const totalDeductions = cogs + forwardShipping + gatewayFee + packaging + gst;
  return Math.round(gmv - totalDeductions);
}

export interface CalculatedFinancialKPIs {
  totalGmv: number;
  netProfit: number;
  profitMarginPercent: number;
  totalOrders: number;
  deliveredOrders: number;
  rtoOrdersCount: number;
  rtoRatePercent: number;
  rtoLossAmount: number;
  averageOrderValue: number;
  blendedRoas: number;
  deliveredGmv: number;
  gmvLakhsFormatted: string;
  profitLakhsFormatted: string;
}

export function calculateConsolidatedKPIs(
  orders: OrderItemInput[],
  costs: UnitEconomicsCosts = DEFAULT_UNIT_ECONOMICS
): CalculatedFinancialKPIs {
  if (!orders || orders.length === 0) {
    return {
      totalGmv: 0,
      netProfit: 0,
      profitMarginPercent: 0,
      totalOrders: 0,
      deliveredOrders: 0,
      rtoOrdersCount: 0,
      rtoRatePercent: 0,
      rtoLossAmount: 0,
      averageOrderValue: 0,
      blendedRoas: 0,
      deliveredGmv: 0,
      gmvLakhsFormatted: '₹0.00 L',
      profitLakhsFormatted: '₹0.00 L',
    };
  }

  let totalGmv = 0;
  let deliveredGmv = 0;
  let totalNetProfit = 0;
  let deliveredCount = 0;
  let rtoCount = 0;
  let rtoLoss = 0;

  for (const order of orders) {
    const gmv = Number(order.totalAmount || order.orderTotal || order.amount || 0);
    totalGmv += gmv;

    const status = String(order.status || 'DELIVERED').toUpperCase();
    const isRto = status.includes('RTO') || status.includes('RETURN');

    const profit = calculateOrderNetProfit(order, costs);
    totalNetProfit += profit;

    if (isRto) {
      rtoCount++;
      const isCod = String(order.paymentMode || 'COD').toUpperCase() === 'COD';
      const forward = isCod ? costs.shippingCodInr : costs.shippingPrepaidInr;
      rtoLoss += forward + costs.rtoReverseShippingInr + costs.packagingInr;
    } else if (status === 'DELIVERED') {
      deliveredCount++;
      deliveredGmv += gmv;
    }
  }

  const profitMarginPercent = totalGmv > 0 
    ? Number(((totalNetProfit / totalGmv) * 100).toFixed(1)) 
    : 0;

  const rtoRatePercent = orders.length > 0 
    ? Number(((rtoCount / orders.length) * 100).toFixed(1)) 
    : 0;

  const averageOrderValue = orders.length > 0 
    ? Math.round(totalGmv / orders.length) 
    : 0;

  const blendedRoas = totalGmv > 0 ? Number((totalGmv / Math.max(1, totalGmv * 0.22)).toFixed(2)) : 0;

  return {
    totalGmv: Math.round(totalGmv),
    netProfit: Math.round(totalNetProfit),
    profitMarginPercent,
    totalOrders: orders.length,
    deliveredOrders: deliveredCount,
    rtoOrdersCount: rtoCount,
    rtoRatePercent,
    rtoLossAmount: Math.round(rtoLoss),
    averageOrderValue,
    blendedRoas,
    deliveredGmv: Math.round(deliveredGmv),
    gmvLakhsFormatted: formatLakhs(totalGmv),
    profitLakhsFormatted: formatLakhs(totalNetProfit),
  };
}

export function formatLakhs(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    return `${isNegative ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${isNegative ? '-' : ''}₹${(abs / 100000).toFixed(2)} L`;
  }
  return `${isNegative ? '-' : ''}₹${abs.toLocaleString('en-IN')}`;
}
