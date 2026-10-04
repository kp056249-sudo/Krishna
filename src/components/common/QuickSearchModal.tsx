import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Zap, Target, ShieldAlert, ShieldCheck, Cpu, Terminal, Cloud, Sparkles, Building2, Package } from 'lucide-react';
import { NavigationTab } from '../../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allItems: { id: NavigationTab; title: string; category: string; icon: any; keywords: string }[] = [
    { id: 'api_keys_config', title: 'API Keys & Integration Vault (.env Configurations)', category: 'Security', icon: ShieldCheck, keywords: 'api keys env gemini twilio meta whatsapp shopify razorpay cashfree delhivery bluedart token' },
    { id: 'login_page', title: 'Executive Login & Authentication Portal', category: 'Security', icon: ShieldCheck, keywords: 'login sign in register auth account password founder' },
    { id: 'store_connect_page', title: 'Dedicated Store Connect Page (Shopify, Woo, Amazon)', category: 'E-commerce', icon: Zap, keywords: 'store connect shopify admin api token access token credentials' },
    { id: 'real_ai_page', title: 'Real AI Studio (Gemini 2.5 Live Call)', category: 'AI Intelligence', icon: Sparkles, keywords: 'real ai gemini call autonomous data scientist prompt' },
    { id: 'consolidated_dashboard', title: 'Consolidated Executive Dashboard', category: 'E-commerce', icon: Zap, keywords: 'gmv profit revenue live tps orders' },
    { id: 'crore_profit_formula', title: 'Crore Profit Formula Machine (₹1 Cr - ₹100 Cr)', category: 'E-commerce', icon: Target, keywords: 'profit target roas cac aov cogs roadmap' },
    { id: 'profit_loss_recon', title: 'P&L & Financial Gateway Reconciliation', category: 'E-commerce', icon: Zap, keywords: 'razorpay cashfree cod remittance fees discrepancy' },
    { id: 'rto_predictor', title: 'RTO & COD Defense Shield', category: 'E-commerce', icon: ShieldAlert, keywords: 'rto returns pincode risk score whatsapp otp cod verification' },
    { id: 'ad_guard_attribution', title: 'AdGuard & Multi-Touch Attribution Engine', category: 'E-commerce', icon: Target, keywords: 'meta ads google pmax roas bot protection attribution' },
    { id: 'logistics_kaizen', title: 'Logistics Kaizen 3PL Matrix', category: 'E-commerce', icon: Package, keywords: 'bluedart delhivery ekart shadowfax dtdc courier sla ndr' },
    { id: 'inventory_forecast', title: 'Inventory Demand Planner & Stockout Runway', category: 'E-commerce', icon: Package, keywords: 'sku stock warehouse reorder days of inventory deadstock' },
    { id: 'customer_ltv', title: 'Customer Lifetime Value (LTV) & Cohorts', category: 'E-commerce', icon: Zap, keywords: 'rfm cohorts retention repeat customer churn' },
    { id: 'recovery_center', title: 'Recovery Command Center (Abandoned Carts)', category: 'E-commerce', icon: Zap, keywords: 'cart abandonment recovery whatsapp sms checkout' },
    { id: 'store_connectors', title: 'Store Connectors Hub (Shopify, WooCommerce, Amazon)', category: 'E-commerce', icon: Zap, keywords: 'shopify woocommerce amazon api webhook sync' },
    { id: 'shiprocket', title: 'Shiprocket Logistics OS (NDR, AWB & Couriers)', category: 'E-commerce', icon: Zap, keywords: 'shiprocket bluedart delhivery shadowfax dtdc awb tracking ndr freight courier' },
    { id: 'data_visualization', title: 'BI Data Visualization Studio', category: 'Analytics', icon: Zap, keywords: 'charts bi graphs scatter funnel radar heatmap' },
    { id: 'ml_studio', title: 'AutoML & Model Comparison Lab', category: 'ML & AI', icon: Cpu, keywords: 'xgboost random forest linear regression f1 score auc roc' },
    { id: 'xai_explainer', title: 'Explainable AI & SHAP Feature Importance', category: 'ML & AI', icon: Cpu, keywords: 'shap xai feature importance what if counterfactual' },
    { id: 'auto_eda', title: 'Auto Exploratory Data Analysis (EDA)', category: 'Analytics', icon: Zap, keywords: 'data profiling missing values skewness correlation matrix' },
    { id: 'linear_regression', title: 'Linear Regression Interactive Workspace', category: 'ML & AI', icon: Cpu, keywords: 'slope intercept r squared scatter regression fit' },
    { id: 'pipeline_builder', title: 'No-Code ETL Data Pipeline Builder', category: 'Pipelines', icon: Zap, keywords: 'dag etl pipelines snowflake bigquery ingestion clean' },
    { id: 'sql_helper', title: 'SQL Studio & Natural Language to SQL', category: 'Data Engineering', icon: Terminal, keywords: 'sql ide query editor nl to sql postgres schema' },
    { id: 'synthetic_data', title: 'Synthetic Data Generator (Test Tool)', category: 'Data Engineering', icon: Zap, keywords: 'test data generator pii anonymizer csv json' },
    { id: 'ai_copilot', title: 'Gemini Data Scientist & Copilot', category: 'AI Intelligence', icon: Sparkles, keywords: 'ai chat gemini copilot mentor business insights' },
    { id: 'executive_reports', title: 'Boardroom Executive Report Builder', category: 'Executive', icon: Zap, keywords: 'pdf export investor report executive summary' },
    { id: 'whatsapp_briefing', title: 'CEO Daily WhatsApp Briefing Dispatcher', category: 'Executive', icon: Zap, keywords: 'whatsapp daily morning snapshot alerts notification' },
    { id: 'team_rbac', title: 'Team Access & RBAC Security Suite', category: 'Security', icon: Zap, keywords: 'roles permissions super admin audit log security' },
    { id: 'subscription_billing', title: 'Subscription Plans & Credit Meter', category: 'Billing', icon: Zap, keywords: 'pricing plans hyperscale credits payment razorpay' },
    { id: 'company_profile', title: 'KP Tech & DataNexus Platform Architecture', category: 'Company', icon: Building2, keywords: 'kp founder architecture story compliance security' },
  ];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a screen, metric, or feature (e.g., RTO, Crore Profit, SQL, Courier)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching modules or features found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-cyan-950/80 group-hover:text-cyan-400 text-slate-300 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-cyan-400 text-xs transition-colors">
                    <span className="text-[11px] hidden sm:inline">Jump</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with arrows or click · 27 Enterprise Systems</span>
          <span>DataNexus &amp; KP Nexus OS</span>
        </div>
      </div>
    </div>
  );
};
