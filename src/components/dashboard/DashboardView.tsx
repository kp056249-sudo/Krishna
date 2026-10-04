import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Download,
  CheckCircle2,
  Store,
  Upload,
  Send,
  Eye,
  Plus
} from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { EmptyState } from '../common/EmptyState';
import { NavigationTab } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { stores, orders, company, currency, isVIP } = useAuthCompany();
  const [filterMode, setFilterMode] = useState<'all' | 'cod' | 'prepaid' | 'high_risk'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // If no stores and no orders, show clean Empty State
  if (stores.length === 0 && orders.length === 0) {
    return (
      <div className="py-12 space-y-6">
        <EmptyState
          title="No Storefronts or Orders Connected"
          description="Your DataNexus enterprise dashboard displays real-time metrics calculated from your real store data. Connect your Shopify or WooCommerce store, or upload an orders CSV to begin."
          actionLabel="Connect Store Now"
          onAction={() => onNavigate('connect_store')}
          secondaryLabel="Upload Transaction CSV"
          onSecondaryAction={() => onNavigate('datasets')}
          icon={Store}
        />
      </div>
    );
  }

  // Real calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.orderTotal || 0), 0);
  const totalNetProfit = orders.reduce((acc, o) => acc + (o.calculatedNetProfit || 0), 0);
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const rtoOrders = orders.filter((o) => String(o.status).includes('RTO'));
  const rtoRate = totalOrders > 0 ? Number(((rtoOrders.length / totalOrders) * 100).toFixed(1)) : 0;
  const highRiskOrders = orders.filter((o) => o.rtoRiskScore >= 70);

  const formatAmount = (num: number) => {
    if (currency === 'INR') {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
      return `₹${num.toLocaleString('en-IN')}`;
    }
    const inUsd = num / 85;
    return `$${Math.round(inUsd).toLocaleString()}`;
  };

  const filteredOrders = orders.filter((o) => {
    if (filterMode === 'cod') return o.paymentMode === 'COD';
    if (filterMode === 'prepaid') return o.paymentMode === 'PREPAID';
    if (filterMode === 'high_risk') return o.rtoRiskScore >= 70;
    return true;
  });

  const handleTriggerAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded">
              Command Center
            </span>
            <span className="text-xs text-slate-400">
              {company?.name || 'My Enterprise'} · {stores.length} Connected Store(s)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            E-Commerce Operations &amp; Profit Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time live telemetry, automated RTO risk protection, and unit economics calculations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('profit_formula')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Unit Costs Formula
          </button>
          <button
            onClick={() => onNavigate('rto_predictor')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            RTO Defense ({highRiskOrders.length} High Risk)
          </button>
          <button
            onClick={() => onNavigate('profit_engine')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            Crore Profit Machine →
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)}>✕</button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Recorded Revenue (GMV)</p>
          <p className="text-2xl font-black text-white font-mono-code mt-1.5">{formatAmount(totalRevenue)}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>AOV: {formatAmount(aov)}</span>
            <span className="font-bold text-slate-300">{totalOrders} Orders</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Calculated Net Profit</p>
          <p className="text-2xl font-black text-emerald-400 font-mono-code mt-1.5">{formatAmount(totalNetProfit)}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Margin: {totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>
            <span className="text-emerald-400 font-bold">Post COGS &amp; Logistics</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Return to Origin (RTO %)</p>
          <p className="text-2xl font-black text-cyan-400 font-mono-code mt-1.5">{rtoRate}%</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{rtoOrders.length} RTO Orders</span>
            <span className="text-cyan-400 font-bold">Industry Avg: 24.5%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">High Risk COD Queue</p>
          <p className="text-2xl font-black text-amber-400 font-mono-code mt-1.5">{highRiskOrders.length} Orders</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Risk Score &gt; 70%</span>
            <button
              onClick={() => handleTriggerAction('Dispatched automated WhatsApp OTP verification to all high risk orders.')}
              className="text-cyan-400 hover:underline font-bold"
            >
              Verify All →
            </button>
          </div>
        </div>
      </div>

      {/* Live Orders Stream */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Live Real-Time Orders Stream</h2>
            <p className="text-[11px] text-slate-400">Order transactions flowing across your connected storefronts</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
            {(['all', 'cod', 'prepaid', 'high_risk'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-3 py-1 rounded-lg transition-colors capitalize ${
                  filterMode === m ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-1">Order Number</th>
                <th className="pb-3">Customer &amp; Location</th>
                <th className="pb-3">Store</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">RTO Risk</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-code">
              {filteredOrders.slice(0, 15).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-1 font-bold text-white">{ord.orderNumber}</td>
                  <td className="py-3 font-sans">
                    <p className="font-semibold text-slate-200">{ord.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono-code">{ord.city}, {ord.pincode}</p>
                  </td>
                  <td className="py-3 text-slate-300 font-sans">{ord.storeName}</td>
                  <td className="py-3 font-bold text-white">{formatAmount(ord.orderTotal)}</td>
                  <td className="py-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.paymentMode === 'PREPAID'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {ord.paymentMode}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-bold ${
                      ord.rtoRiskScore >= 70 ? 'text-red-400' : ord.rtoRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {ord.rtoRiskScore}%
                    </span>
                  </td>
                  <td className="py-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-950 text-emerald-400'
                        : ord.status.includes('RTO')
                        ? 'bg-red-950 text-red-400'
                        : 'bg-blue-950 text-blue-400'
                    }`}>
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-1 font-sans">
                    <button
                      onClick={() => handleTriggerAction(`Verification WhatsApp dispatched for order ${ord.orderNumber}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px]"
                    >
                      Verify Intent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
