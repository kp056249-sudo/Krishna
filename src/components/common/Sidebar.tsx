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
  Send
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
        { id: 'ml_studio', label: 'AutoML & Model Lab', icon: Cpu, badge: '6 Models' },
        { id: 'xai_explainer', label: 'Explainable AI (SHAP)', icon: BrainCircuit },
        { id: 'auto_eda', label: 'Auto EDA & Profiling', icon: PieChart },
        { id: 'linear_regression', label: 'Linear Regression Lab', icon: LineChart },
      ],
    },
    {
      title: 'DATA PIPELINES & SQL IDE',
      items: [
        { id: 'pipeline_builder', label: 'No-Code ETL Pipelines', icon: GitFork, badge: '2.4k TPS' },
        { id: 'sql_helper', label: 'SQL Studio & NL-to-SQL', icon: Terminal },
        { id: 'synthetic_data', label: 'Synthetic Data Generator', icon: Database },
        { id: 'database_connectors', label: 'Database SQL Connectors', icon: Database, badge: 'Enterprise' },
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
        fixed top-0 left-0 bottom-0
        h-full
        bg-slate-950/98 backdrop-blur-2xl
        border-r border-slate-800/90
        z-50
        transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0 shadow-2xl shadow-cyan-950/70 pointer-events-auto' : '-translate-x-full pointer-events-none'}
        w-[88vw] sm:w-80 md:w-96 max-w-md
      `}
    >
      {/* Drawer Header with Brand & Close X (Visible on ALL devices) */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">DATANEXUS</span>
              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">ENTERPRISE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">All Pages &amp; Modules</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group text-left cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/60'
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
    </aside>
  );
};
