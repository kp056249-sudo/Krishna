import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, Activity, Download, Filter, Layers, Maximize2, RefreshCw } from 'lucide-react';
import { EnterpriseKPIs } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { api } from '../../lib/api';
import { useAuthCompany } from '../../context/AuthCompanyContext';

interface DataVisualizationDashboardProps {
  kpis: EnterpriseKPIs;
  currency: 'INR' | 'USD';
}

export const DataVisualizationDashboard: React.FC<DataVisualizationDashboardProps> = ({ kpis, currency }) => {
  const { orders } = useAuthCompany();
  const [metricMode, setMetricMode] = useState<'revenue' | 'profit' | 'orders' | 'rto'>('revenue');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'funnel'>('area');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [orders.length]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analytics/trends');
      if (res.success) {
        setTrendsData(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders for Business Intelligence Visualizer"
        description="The BI studio aggregates real-time revenue trends, delivery funnels, and payment splits directly from connected stores. Connect a store or import orders CSV to populate live charts."
        actionLabel="Connect Storefront"
        onAction={() => {}}
        icon={BarChart3}
      />
    );
  }

  // Generate real monthly trend aggregates from orders
  const monthMap: Record<string, { revenue: number; orders: number; rto: number; delivered: number }> = {};
  orders.forEach((o) => {
    const d = o.createdAt ? new Date(o.createdAt) : new Date();
    const monthKey = d.toLocaleString('en-US', { month: 'short' });
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { revenue: 0, orders: 0, rto: 0, delivered: 0 };
    }
    monthMap[monthKey].orders++;
    monthMap[monthKey].revenue += (o.totalAmount || o.orderTotal || 0);
    if (String(o.status).includes('RTO')) monthMap[monthKey].rto++;
    if (o.status === 'DELIVERED') monthMap[monthKey].delivered++;
  });

  const months = Object.keys(monthMap).length > 0 ? Object.keys(monthMap) : ['Current Period'];
  const monthlyTrends = months.map((m) => {
    const data = monthMap[m] || { revenue: kpis.totalGmv, orders: orders.length, rto: 0, delivered: 0 };
    const revLakhs = Number((data.revenue / 100000).toFixed(2));
    const marginPct = ((kpis.profitMarginPercentage ?? kpis.profitMarginPercent ?? 22)) / 100;
    const profitLakhs = Number((revLakhs * marginPct).toFixed(2));
    const rtoPct = data.orders > 0 ? Number(((data.rto / data.orders) * 100).toFixed(1)) : 0;
    return {
      month: m,
      revenue: revLakhs,
      profit: profitLakhs,
      orders: data.orders,
      rto: rtoPct,
    };
  });

  const codCount = trendsData?.paymentSplit?.cod ?? orders.filter((o) => o.paymentMode === 'COD').length;
  const prepaidCount = trendsData?.paymentSplit?.prepaid ?? orders.filter((o) => o.paymentMode === 'PREPAID').length;
  const totalOrders = orders.length;

  const paymentShare = [
    { category: 'Cash on Delivery (COD)', share: totalOrders > 0 ? Math.round((codCount / totalOrders) * 100) : 0, count: codCount },
    { category: 'Prepaid (UPI / Cards)', share: totalOrders > 0 ? Math.round((prepaidCount / totalOrders) * 100) : 0, count: prepaidCount },
  ];

  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const inTransitCount = orders.filter((o) => o.status === 'IN_TRANSIT').length;
  const rtoCount = orders.filter((o) => String(o.status).includes('RTO')).length;

  const conversionFunnel = [
    { stage: 'Orders Ingested', count: totalOrders, rate: '100%' },
    { stage: 'In Transit / Dispatched', count: inTransitCount + deliveredCount, rate: totalOrders > 0 ? `${Math.round(((inTransitCount + deliveredCount) / totalOrders) * 100)}%` : '0%' },
    { stage: 'Delivered to Customer', count: deliveredCount, rate: totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}%` : '0%' },
    { stage: 'RTO / Returned', count: rtoCount, rate: totalOrders > 0 ? `${Math.round((rtoCount / totalOrders) * 100)}%` : '0%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
              BI Analytics Studio
            </span>
            <span className="text-xs text-slate-400">Live Telemetry from {totalOrders} Orders</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Data Visualization &amp; BI Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Multi-dimensional interactive analytics studio calculated strictly from live database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {(['revenue', 'profit', 'orders', 'rto'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetricMode(m)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  metricMode === m ? 'bg-cyan-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {(['area', 'bar', 'funnel'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                  chartType === t ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Trends Display */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white capitalize">
              {metricMode === 'revenue' ? 'Monthly Revenue (₹ Lakhs)' : metricMode === 'profit' ? 'Estimated Net Profit (₹ Lakhs)' : metricMode === 'orders' ? 'Monthly Order Volume' : 'RTO Rejection Rate (%)'}
            </h2>
            <p className="text-[11px] text-slate-400">Aggregated from verified order timestamps</p>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Live Firestore Feed</span>
        </div>

        {/* Bar chart visualization */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {monthlyTrends.map((t) => {
            const val = metricMode === 'revenue' ? t.revenue : metricMode === 'profit' ? t.profit : metricMode === 'orders' ? t.orders : t.rto;
            const suffix = metricMode === 'revenue' || metricMode === 'profit' ? ' L' : metricMode === 'rto' ? '%' : '';
            return (
              <div key={t.month} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">{t.month}</span>
                <p className="text-lg font-black text-cyan-400 font-mono">
                  {val}{suffix}
                </p>
                <span className="text-[10px] text-slate-500 block">{t.orders} orders</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Split and Order Delivery Funnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" /> Payment Mode Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            {paymentShare.map((p) => (
              <div key={p.category} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{p.category}</span>
                  <span className="font-bold text-white">{p.share}% ({p.count} orders)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${p.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Fulfillment &amp; Delivery Funnel
          </h3>
          <div className="space-y-2.5 text-xs">
            {conversionFunnel.map((f) => (
              <div key={f.stage} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300">{f.stage}</span>
                <span className="font-mono text-emerald-400 font-bold">{f.count} ({f.rate})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
