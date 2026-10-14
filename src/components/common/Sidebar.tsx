import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Scale,
  ShieldAlert,
  Target,
  Truck,
  Package,
  Users,
  RotateCcw,
  Store,
  BarChart3,
  GitFork,
  Cpu,
  BrainCircuit,
  PieChart,
  Terminal,
  Database,
  LineChart,
  Cloud,
  Network,
  Code2,
  Sparkles,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Building2,
  Award,
  ChevronRight,
  X,
  Zap,
  PhoneCall,
  Send,
  ArrowRight
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isOpen = false,
  onClose,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'DATANEXUS E-COMMERCE OS',
      items: [
        { id: 'consolidated_dashboard', label: 'Consolidated Dashboard', icon: LayoutDashboard },
        { id: 'store_connect_page', label: 'Store Connect Portal', icon: Store, badge: 'Real Connect' },
        { id: 'crore_profit_formula', label: 'Crore Profit Formula', icon: TrendingUp, badge: 'Target' },
        { id: 'profit_loss_recon', label: 'P&L & Financial Recon', icon: Scale },
        { id: 'rto_predictor', label: 'RTO & COD Defense', icon: ShieldAlert, badge: 'AI Guard' },
        { id: 'ad_guard_attribution', label: 'AdGuard & Attribution', icon: Target },
        { id: 'logistics_kaizen', label: 'Logistics Kaizen 3PL', icon: Truck },
        { id: 'inventory_forecast', label: 'Inventory Demand Planner', icon: Package },
        { id: 'customer_ltv', label: 'Customer LTV & Cohorts', icon: Users },
        { id: 'recovery_center', label: 'Recovery Command Center', icon: RotateCcw, badge: 'Live' },
        { id: 'store_connectors', label: 'Store Connectors Hub', icon: Store },
        { id: 'shiprocket', label: 'Shiprocket Logistics', icon: Truck, badge: 'Live API' },
        { id: 'sku_intelligence', label: 'SKU Intelligence', icon: Package, badge: 'Profitability' },
        { id: 'rto_intelligence', label: 'RTO ML Intelligence', icon: BrainCircuit, badge: 'ML Model' },
      ],
    },
    {
      title: 'DATANEXUS AI & ML STUDIO',
      items: [
        { id: 'real_ai_page', label: 'Real AI Studio & Gemini', icon: Sparkles, badge: 'Gemini 2.5' },
        { id: 'data_visualization', label: 'BI Visualization Studio', icon: BarChart3 },
        { id: 'ml_studio', label: 'AutoML & Model Lab', icon: Cpu, badge: 'ML Pipeline' },
        { id: 'xai_explainer', label: 'Explainable AI (SHAP)', icon: BrainCircuit },
        { id: 'auto_eda', label: 'Auto EDA & Profiling', icon: PieChart },
        { id: 'linear_regression', label: 'Linear Regression Lab', icon: LineChart },
        { id: 'sales_forecast', label: 'Sales & Demand Forecast', icon: TrendingUp, badge: 'MAPE' },
      ],
    },
    {
      title: 'DATA PIPELINES & SQL IDE',
      items: [
        { id: 'pipeline_builder', label: 'No-Code ETL Pipelines', icon: GitFork, badge: 'ETL' },
        { id: 'sql_helper', label: 'SQL Studio & NL-to-SQL', icon: Terminal },
        { id: 'synthetic_data', label: 'Synthetic Data Generator', icon: Database },
        { id: 'database_connectors', label: 'Database SQL Connectors', icon: Database, badge: 'Postgres' },
        { id: 'google_sheets', label: 'Google Sheets OAuth', icon: FileSpreadsheet, badge: 'OAuth 2.0' },
      ],
    },
    {
      title: 'EXECUTIVE INTELLIGENCE & AGENTS',
      items: [
        { id: 'ai_copilot', label: 'Autonomous Agent Deck', icon: Sparkles, badge: 'Multi-Agent' },
        { id: 'gemini_calls', label: 'Gemini Live Calls', icon: PhoneCall, badge: 'Live AI Calls' },
        { id: 'telegram', label: 'KP Telegram Support Bot', icon: Send, badge: 'AI & Images' },
        { id: 'whatsapp_briefing', label: 'WhatsApp 8 AM Dispatcher', icon: MessageSquare, badge: '8:00 AM Auto' },
        { id: 'executive_reports', label: 'Boardroom Report Builder', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SECURITY & COMPANY',
      items: [
        { id: 'login_page', label: 'Executive Login Portal', icon: ShieldCheck, badge: 'Auth' },
        { id: 'team_rbac', label: 'Team RBAC & Security', icon: ShieldCheck },
        { id: 'subscription_billing', label: 'Subscription & Credits', icon: CreditCard },
        { id: 'company_profile', label: 'Company Profile & Settings', icon: Building2 },
      ],
    },
  ];

  const handleItemClick = (id: NavigationTab) => {
    onSelectTab(id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 bottom-0
        h-full
        bg-[#0a0f1d]/95 backdrop-blur-xl
        border-r border-slate-800/80
        z-50 lg:z-10
        transition-transform duration-300 ease-in-out
        flex flex-col
        overflow-hidden
        ${isOpen ? 'translate-x-0 shadow-2xl shadow-black/60 pointer-events-auto' : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'}
        w-[88vw] sm:w-80 lg:w-64 flex-shrink-0
      `}
    >
      {/* Drawer Header with Brand & Close X - Fixed header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-[#0a0f1d] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                KP DATANEXUS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise E-Commerce OS</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Navigation - Independent scroll with overscroll-contain */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Promo / AI Autopilot Card - Fixed at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1d] flex-shrink-0">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950/80 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold leading-tight bg-gradient-to-r from-cyan-300 to-indigo-200 bg-clip-text text-transparent flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 inline" />
              <span>Autonomous AI Engine</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live"></span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
            Gemini 2.5 Flash, COD RTO defense &amp; WhatsApp 8 AM briefing active.
          </p>
          <button
            type="button"
            onClick={() => handleItemClick('real_ai_page')}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-between cursor-pointer"
          >
            <span>Open AI Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};
