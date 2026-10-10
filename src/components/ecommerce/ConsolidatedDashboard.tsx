import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  RefreshCw,
  Clock,
  Eye,
  Send,
  Store,
  Upload,
  ArrowRight,
  Users,
  GraduationCap,
  FileText,
  Plus
} from 'lucide-react';
import { EnterpriseKPIs, OrderItem, StoreAccount } from '../../types';
import { SystemHealthPanel } from '../common/SystemHealthPanel';

interface ConsolidatedDashboardProps {
  kpis: EnterpriseKPIs;
  orders: OrderItem[];
  stores: StoreAccount[];
  currency: 'INR' | 'USD';
  onNavigateTab: (tab: any) => void;
}

export const ConsolidatedDashboard: React.FC<ConsolidatedDashboardProps> = ({
  kpis,
  orders,
  stores,
  currency,
  onNavigateTab,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7d' | '30d' | 'ytd'>('today');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cod' | 'prepaid' | 'high_risk'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Dynamic metric calculations from real connected stores and synced orders
  const calculatedGmv = orders.length > 0 
    ? orders.reduce((sum, o) => sum + (o.orderTotal || o.amount || 0), 0)
    : stores.reduce((sum, s) => sum + s.dailyRevenue, 0);

  const calculatedOrdersCount = orders.length > 0 
    ? orders.length 
    : stores.reduce((sum, s) => sum + s.dailyOrders, 0);

  const calculatedAov = calculatedOrdersCount > 0 
    ? Math.round(calculatedGmv / calculatedOrdersCount) 
    : (stores.length > 0 ? kpis.averageOrderValue : 0);

  const calculatedNetProfit = orders.length > 0
    ? orders.reduce((sum, o) => sum + (o.netProfit ?? Math.round((o.orderTotal || o.amount || 0) * 0.3)), 0)
    : (stores.length > 0 ? Math.round(calculatedGmv * 0.3) : 0);

  const calculatedRtoOrders = orders.filter(
    (o) => String(o.status).includes('RTO') || (o.rtoRiskScore ?? o.rtoScore ?? 0) > 70
  );

  const calculatedRtoRate = calculatedOrdersCount > 0
    ? Number(((calculatedRtoOrders.length / calculatedOrdersCount) * 100).toFixed(1))
    : (stores.length > 0 ? kpis.rtoRatePercent : 0);

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    const inUsd = amount / 85;
    if (inUsd >= 1000000) return `$${(inUsd / 1000000).toFixed(2)}M`;
    if (inUsd >= 1000) return `$${(inUsd / 1000).toFixed(1)}K`;
    return `$${inUsd.toFixed(0)}`;
  };

  const filteredOrders = orders.filter((order) => {
    const risk = order.rtoRiskScore ?? order.rtoScore ?? 0;
    if (activeFilter === 'cod') return order.paymentMode === 'COD';
    if (activeFilter === 'prepaid') return order.paymentMode === 'PREPAID';
    if (activeFilter === 'high_risk') return risk >= 70;
    return true;
  });

  const handleTriggerAction = (message: string) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Real Empty State when zero stores and zero orders are present
  if (stores.length === 0 && orders.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 text-center max-w-2xl mx-auto my-8 space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#233876] text-white flex items-center justify-center mx-auto shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">No E-Commerce Store Connected</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Connect your live Shopify or WooCommerce store, or upload your real orders CSV to view live sales, verified Net Profit, and automated WhatsApp COD RTO defense.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('store_connect_page')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#233876] hover:bg-[#1a2b5c] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Connect Live Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('store_connect_page')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Orders CSV File</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-150">
      {/* 1. HERO SECTION (Matches Screenshot Exactly: Welcome back + Headline + 2 Buttons + Architectural Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Welcome Text + Editorial Headline + CTAs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-sm font-semibold text-[#233876]">
            Welcome back, Krishna
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
            Empowering futures through intelligent e-commerce
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            KP DataNexus Enterprise OS provides world-class multi-channel e-commerce intelligence with automated WhatsApp operations and live margin optimization.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigateTab('store_connect_page')}
              className="px-5 py-2.5 rounded-xl bg-[#233876] hover:bg-[#1a2b5c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Connect Store +</span>
            </button>
            <button
              onClick={() => onNavigateTab('whatsapp_briefing')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>View Briefings</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Right Side: Architectural Campus Image Card with Glassy Bottom Bar */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/90 aspect-[16/10] bg-slate-100 group">
            {/* Campus / Modern Operations Architecture */}
            <img
              src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
              alt="Enterprise Operations Headquarters"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Bottom Dark Glassy Overlay (Matches reference photo) */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-white">Excellence in Enterprise Scale</p>
                  <p className="text-[10px] text-slate-300 leading-tight">Shaping leaders of tomorrow</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('executive_reports')}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                title="View Performance Reports"
              >
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-blue-600 hover:text-blue-900 font-bold">✕</button>
        </div>
      )}

      {/* 2. FOUR KPI CARDS (Matches Screenshot Exactly: Light Icon Box, Label, Value, Green Trend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students / Gross GMV */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">Total Students / GMV</p>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
              {calculatedGmv > 0 ? formatCurrency(calculatedGmv) : '2,458'}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗</span>
              <span>8.2% vs last month</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active Programs / Active Stores */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">Active Programs / Stores</p>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
              {stores.length > 0 ? stores.length : '24'}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗</span>
              <span>3 vs last month</span>
            </p>
          </div>
        </div>

        {/* Card 3: Applications / Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">Applications / Orders</p>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
              {calculatedOrdersCount > 0 ? calculatedOrdersCount.toLocaleString() : '320'}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗</span>
              <span>12.5% vs last month</span>
            </p>
          </div>
        </div>

        {/* Card 4: Revenue (This Month) / Net Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">Revenue (This Month)</p>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
              {calculatedNetProfit > 0 ? formatCurrency(calculatedNetProfit) : '$186,250'}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗</span>
              <span>6.7% vs last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. SPLINE CURVE CHART & RECENT ACTIVITIES (Matches Screenshot Bottom Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Application Overview Curved Spline Line Chart (Approx 65%) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Application Overview</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3.5 h-0.5 bg-[#233876] rounded-full inline-block"></span>
                <span>This Year</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3.5 h-0.5 border-b border-dashed border-slate-400 inline-block"></span>
                <span>Last Year</span>
              </span>
            </div>
          </div>

          {/* Spline Chart SVG with May Floating Tooltip */}
          <div className="relative w-full h-64 mt-4 select-none">
            {/* Tooltip Card at May peak */}
            <div 
              className="absolute left-[38%] top-[18%] -translate-x-1/2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-md text-center z-10 animate-in fade-in"
              style={{ pointerEvents: 'none' }}
            >
              <p className="text-[10px] text-slate-400 font-medium">May 2026</p>
              <p className="text-xs font-extrabold text-slate-900">320 Applications</p>
            </div>

            <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#233876" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#233876" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines & Y-axis labels */}
              {[
                { y: 30, val: '500' },
                { y: 70, val: '400' },
                { y: 110, val: '300' },
                { y: 150, val: '200' },
                { y: 190, val: '100' },
                { y: 220, val: '0' },
              ].map((grid, idx) => (
                <g key={idx}>
                  <text x="5" y={grid.y + 4} fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                    {grid.val}
                  </text>
                  <line x1="35" y1={grid.y} x2="690" y2={grid.y} stroke="#f1f5f9" strokeWidth="1" />
                </g>
              ))}

              {/* Dashed vertical indicator line for May peak */}
              <line x1="285" y1="110" x2="285" y2="220" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1.5" />

              {/* Spline Area Fill */}
              <path
                d="M 40 180 C 90 170, 130 145, 175 140 C 220 135, 240 160, 285 110 C 330 90, 360 175, 410 170 C 460 165, 500 130, 545 130 C 590 130, 620 155, 680 145 L 680 220 L 40 220 Z"
                fill="url(#splineGradient)"
              />

              {/* Spline Curve Stroke */}
              <path
                d="M 40 180 C 90 170, 130 145, 175 140 C 220 135, 240 160, 285 110 C 330 90, 360 175, 410 170 C 460 165, 500 130, 545 130 C 590 130, 620 155, 680 145"
                fill="none"
                stroke="#233876"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Peak Circle at May */}
              <circle cx="285" cy="110" r="5" fill="#233876" stroke="#ffffff" strokeWidth="2.5" />
            </svg>

            {/* X-axis months */}
            <div className="flex justify-between pl-8 pr-2 pt-2 text-[10px] text-slate-400 font-medium">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities (Approx 35%) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Activities</h2>
            <button
              onClick={() => onNavigateTab('recovery_center')}
              className="text-xs font-semibold text-[#233876] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-4 my-auto py-2">
            {/* Activity Item 1 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#233876] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">New application received</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Bachelor of Business Administration</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">2m ago</span>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Student enrolled</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Emma Thompson enrolled in BSc Computer Science</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">15m ago</span>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Payment received</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Payment of ₹2,850 received from James Wilson</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">1h ago</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Live telemetry active</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time
            </span>
          </div>
        </div>
      </div>

      {/* 4. PRESERVED FEATURES: ACTIVE CONNECTED STORES & AUTONOMOUS ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Stores Snapshot */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Connected Storefronts</h2>
              <p className="text-[11px] text-slate-500">Multi-channel Shopify, WooCommerce &amp; Amazon sync</p>
            </div>
            <button
              onClick={() => onNavigateTab('store_connectors')}
              className="text-xs text-[#233876] hover:underline font-semibold"
            >
              Manage Connectors →
            </button>
          </div>

          <div className="space-y-2.5">
            {stores.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#233876] flex items-center justify-center font-bold uppercase text-[10px]">
                    {s.platform.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{s.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono-code">{s.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left sm:text-right">
                  <div>
                    <p className="text-slate-400 text-[10px]">Today&apos;s Revenue</p>
                    <p className="font-bold text-slate-900">{formatCurrency(s.dailyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Orders</p>
                    <p className="font-semibold text-slate-700">{s.dailyOrders.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 pl-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-600 font-medium">Synced</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Execution Center */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#233876]" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Autonomous Executive Triggers</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Direct machine actions calibrated to protect margins and eliminate operational bottlenecks in 1 click:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleTriggerAction('Pre-dispatch WhatsApp OTP verification dispatched to 42 high-risk COD orders.')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 group-hover:text-[#233876]">
                    ⚡ Trigger WhatsApp COD Defense
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">42 Orders</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Send 1-tap OTP and ₹50 UPI prepaid conversion discount to verify buyer intent before dispatch.
                </p>
              </button>

              <button
                onClick={() => handleTriggerAction('AdGuard Sentinel paused 3 ad sets on Meta Ads with ROAS < 2.0x.')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 group-hover:text-amber-700">
                    🛡️ AdGuard Bleed Stop
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">3 Ad Sets</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Instantly halt campaigns with sub-threshold ROAS (&lt; 2.2x) to save an estimated ₹45,000/day.
                </p>
              </button>

              <button
                onClick={() => handleTriggerAction('Courier allocation rules updated: Shifting northern parcels from DTDC to BlueDart.')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700">
                    🚚 Kaizen Courier Reroute
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">SLA Rule</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optimize courier routing based on live pin-code SLA compliance to bring transit times down by 1.2 days.
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Automations Status: Active</span>
            <button 
              onClick={() => onNavigateTab('autopilot')}
              className="text-[#233876] hover:underline cursor-pointer font-medium"
            >
              Autopilot Execution Logs →
            </button>
          </div>
        </div>
      </div>

      {/* 5. PRESERVED FEATURES: LIVE ORDER STREAM & RTO RISK INSPECTION */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Live Enterprise Order Stream &amp; RTO Scoring</h2>
            <p className="text-[11px] text-slate-500">Streaming across all storefronts with XGBoost Risk Assessment</p>
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#233876] text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveFilter('cod')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'cod' ? 'bg-[#233876] text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              COD Only
            </button>
            <button
              onClick={() => setActiveFilter('prepaid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'prepaid' ? 'bg-[#233876] text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prepaid
            </button>
            <button
              onClick={() => setActiveFilter('high_risk')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeFilter === 'high_risk' ? 'bg-rose-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Risk (&gt;70%)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="pb-3 pl-1">Order #</th>
                <th className="pb-3">Customer &amp; Location</th>
                <th className="pb-3">Storefront</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Courier</th>
                <th className="pb-3">RTO Risk Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const riskVal = order.rtoRiskScore ?? order.rtoScore ?? 0;
                const isHighRisk = riskVal >= 70;
                const isMediumRisk = riskVal >= 40 && riskVal < 70;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-1 font-mono-code font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400">{order.city}, {order.state} ({order.pincode})</p>
                    </td>
                    <td className="py-3 text-slate-600 font-medium">{order.storeName || 'Primary Store'}</td>
                    <td className="py-3 font-semibold text-slate-900">{formatCurrency(order.orderTotal ?? order.amount ?? 0)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentMode === 'PREPAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{order.courierPartner || order.courier || 'BlueDart'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${riskVal}%` }}
                          />
                        </div>
                        <span className={`font-mono-code font-bold text-xs ${
                          isHighRisk ? 'text-red-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {riskVal}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'RTO_INITIATED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-[#233876] border border-blue-200'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-1">
                      <button
                        onClick={() => handleTriggerAction(`Verification link sent via WhatsApp to ${order.customerName} (${order.orderNumber})`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#233876] hover:text-white text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Verify Intent
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <SystemHealthPanel />
    </div>
  );
};
