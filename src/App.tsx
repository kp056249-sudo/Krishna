import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTab, StoreAccount, OrderItem, EnterpriseKPIs } from './types';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { EmptyState } from './components/common/EmptyState';
import { useAuthCompany } from './context/AuthCompanyContext';

// Dedicated New Screens Requested by User
import { LoginPage } from './components/auth/LoginPage';
import { StoreConnectPage } from './components/ecommerce/StoreConnectPage';
import { RealAiPage } from './components/copilot/RealAiPage';

// E-Commerce OS Screens
import { ConsolidatedDashboard } from './components/ecommerce/ConsolidatedDashboard';
import { CroreProfitFormula } from './components/ecommerce/CroreProfitFormula';
import { ProfitLossRecon } from './components/ecommerce/ProfitLossRecon';
import { RtoPredictor } from './components/ecommerce/RtoPredictor';
import { AdGuardAttribution } from './components/ecommerce/AdGuardAttribution';
import { LogisticsKaizen } from './components/ecommerce/LogisticsKaizen';
import { InventoryForecast } from './components/ecommerce/InventoryForecast';
import { CustomerLtv } from './components/ecommerce/CustomerLtv';
import { RecoveryCommandCenter } from './components/ecommerce/RecoveryCommandCenter';
import { StoreConnectors } from './components/ecommerce/StoreConnectors';
import { ShiprocketPage } from './components/ecommerce/ShiprocketPage';
import { SkuIntelligencePage } from './components/ecommerce/SkuIntelligencePage';
import { RtoIntelligencePage } from './components/ecommerce/RtoIntelligencePage';

// Analytics & ML Studio Screens
import { DataVisualizationDashboard } from './components/analytics/DataVisualizationDashboard';
import { MlStudio } from './components/analytics/MlStudio';
import { XaiExplainer } from './components/analytics/XaiExplainer';
import { AutoEdaProfiling } from './components/analytics/AutoEdaProfiling';
import { LinearRegressionWorkspace } from './components/analytics/LinearRegressionWorkspace';
import { SalesForecastPage } from './components/analytics/SalesForecastPage';
import { NoCodePipelineBuilder } from './components/analytics/NoCodePipelineBuilder';
import { SqlHelperStudio } from './components/analytics/SqlHelperStudio';
import { SyntheticDataGenerator } from './components/analytics/SyntheticDataGenerator';
import { DatabaseConnectorsPage } from './components/analytics/DatabaseConnectorsPage';
import { GoogleSheetsPage } from './components/analytics/GoogleSheetsPage';

// Executive Intelligence & AI
import { AiCopilotChat } from './components/copilot/AiCopilotChat';
import { ExecutiveReportGenerator } from './components/copilot/ExecutiveReportGenerator';
import { WhatsAppBriefingView } from './components/copilot/WhatsAppBriefingView';
import { GeminiLiveCallsPage } from './components/copilot/GeminiLiveCallsPage';
import { TelegramBotPage } from './components/copilot/TelegramBotPage';

// Company & Security Screens
import { TeamRbacView } from './components/company/TeamRbacView';
import { SubscriptionBillingView } from './components/company/SubscriptionBillingView';
import { CompanyProfileView } from './components/company/CompanyProfileView';
import { ApiKeysConfigCenter } from './components/company/ApiKeysConfigCenter';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AboutProjectModal } from './components/common/AboutProjectModal';
import { calculateConsolidatedKPIs } from './utils/financialMetrics';

import { Sparkles, Key, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const {
    user,
    stores: rawStores,
    orders: rawOrders,
    loading,
    refreshData,
    currency: rawCurrency,
    setCurrency: rawSetCurrency,
  } = useAuthCompany();

  const formatIstTime = (isoString?: string) => {
    if (!isoString || isoString === 'Just now') return 'Just now';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return isoString;
    }
  };

  const stores: StoreAccount[] = useMemo(() => rawStores.map((s: any) => ({
    id: s.id,
    name: s.name,
    platform: s.platform,
    url: s.storeUrl || s.url || '',
    status: s.status || 'connected',
    lastSyncTime: formatIstTime(s.lastSyncAt || s.lastSyncTime),
    dailyRevenue: s.totalRevenue || s.dailyRevenue || 0,
    dailyOrders: s.totalOrdersCount || s.dailyOrders || 0,
    currency: s.currency || 'INR',
  })), [rawStores]);

  const orders: OrderItem[] = useMemo(() => rawOrders.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName || 'Customer',
    phone: o.customerPhone || o.phone || '',
    customerPhone: o.customerPhone || o.phone || '',
    customerEmail: o.customerEmail || '',
    city: o.city || '',
    state: o.state || '',
    pincode: o.pincode || '',
    amount: o.orderTotal || o.totalAmount || 0,
    orderTotal: o.orderTotal || o.totalAmount || 0,
    totalAmount: o.orderTotal || o.totalAmount || 0,
    storeName: o.storeName || '',
    paymentMode: o.paymentMode || 'COD',
    status: o.status || 'DELIVERED',
    rtoRisk: o.rtoRiskLevel || o.rtoRisk || 'LOW',
    rtoRiskLevel: o.rtoRiskLevel || 'LOW',
    rtoScore: o.rtoRiskScore || o.rtoScore || 0,
    rtoRiskScore: o.rtoRiskScore || o.rtoScore || 0,
    courier: o.courierPartner || o.courier || '',
    courierPartner: o.courierPartner || o.courier || '',
    cogs: o.cogsAmount || o.cogs || 0,
    netProfit: o.calculatedNetProfit || o.netProfit || 0,
    predictedProfit: o.calculatedNetProfit || o.netProfit || 0,
    timestamp: o.createdAt || '',
    createdAt: o.createdAt || '',
  })), [rawOrders]);

  const currency = rawCurrency === 'EUR' ? 'INR' : rawCurrency as 'INR' | 'USD';
  const setCurrency = (c: 'INR' | 'USD') => {
    rawSetCurrency(c);
  };

  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    try {
      const saved = localStorage.getItem('datanexus_active_tab');
      if (saved) return saved as NavigationTab;
    } catch {}
    return 'consolidated_dashboard';
  });

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('datanexus_active_tab', tab);
    } catch {}
  };

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAddStore = async () => {
    await refreshData();
  };

  const handleRemoveStore = async () => {
    await refreshData();
  };

  const handleImportOrders = async () => {
    await refreshData();
  };

  const handleLoginSuccess = () => {
    setActiveTab('consolidated_dashboard');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">
            Verifying DataNexus Workspace Session...
          </p>
        </div>
      </div>
    );
  }

  // Enforce LoginPage if no user is authenticated
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const calculatedKPIs = useMemo(() => calculateConsolidatedKPIs(orders), [orders]);

  const realKPIs: EnterpriseKPIs = useMemo(() => ({
    totalGmv: calculatedKPIs.totalGmv,
    netProfit: calculatedKPIs.netProfit,
    profitMarginPercent: calculatedKPIs.profitMarginPercent,
    totalOrders: calculatedKPIs.totalOrders,
    deliveredOrders: calculatedKPIs.deliveredOrders,
    rtoRatePercent: calculatedKPIs.rtoRatePercent,
    rtoLossAmount: calculatedKPIs.rtoLossAmount,
    blendedRoas: calculatedKPIs.blendedRoas,
    averageOrderValue: calculatedKPIs.averageOrderValue,
    tpsCurrent: stores.length > 0 ? 45 : 0,
    activeStoresCount: stores.length,
    activeCouriersCount: 5,
  }), [calculatedKPIs, stores.length]);

  const renderActiveScreen = () => {

    switch (activeTab) {
      // E-Commerce OS
      case 'consolidated_dashboard':
        return (
          <ConsolidatedDashboard
            kpis={realKPIs}
            orders={orders}
            stores={stores}
            currency={currency}
            onNavigateTab={setActiveTab}
          />
        );
      case 'store_connect_page':
      case 'connect_store':
        return (
          <StoreConnectPage
            stores={stores}
            onAddStore={handleAddStore}
            onRemoveStore={handleRemoveStore}
            onImportOrders={handleImportOrders}
          />
        );
      case 'crore_profit_formula':
        return <CroreProfitFormula />;
      case 'profit_loss_recon':
        return <ProfitLossRecon kpis={realKPIs} currency={currency} />;
      case 'rto_predictor':
        return <RtoPredictor orders={orders} currency={currency} />;
      case 'ad_guard_attribution':
        return <AdGuardAttribution />;
      case 'logistics_kaizen':
        return <LogisticsKaizen />;
      case 'inventory_forecast':
        return <InventoryForecast />;
      case 'customer_ltv':
        return <CustomerLtv />;
      case 'recovery_center':
        return <RecoveryCommandCenter />;
      case 'store_connectors':
        return <StoreConnectors stores={stores} onAddStore={handleAddStore} />;
      case 'shiprocket':
        return <ShiprocketPage />;
      case 'sku_intelligence':
        return <SkuIntelligencePage />;
      case 'rto_intelligence':
        return <RtoIntelligencePage />;

      // Analytics & ML Studio
      case 'real_ai_page':
        return <RealAiPage />;
      case 'gemini_calls':
        return <GeminiLiveCallsPage />;
      case 'ai_copilot':
        return (
          <AiCopilotChat
            stores={stores}
            orders={orders}
            currency={currency}
            onNavigateTab={setActiveTab}
          />
        );
      case 'data_visualization':
        return <DataVisualizationDashboard kpis={realKPIs} currency={currency} />;
      case 'ml_studio':
        return <MlStudio />;
      case 'xai_explainer':
        return <XaiExplainer />;
      case 'auto_eda':
        return <AutoEdaProfiling />;
      case 'linear_regression':
        return <LinearRegressionWorkspace />;
      case 'sales_forecast':
        return <SalesForecastPage />;
      case 'pipeline_builder':
        return <NoCodePipelineBuilder />;
      case 'sql_helper':
        return <SqlHelperStudio />;
      case 'synthetic_data':
        return <SyntheticDataGenerator />;
      case 'database_connectors':
        return <DatabaseConnectorsPage />;
      case 'google_sheets':
        return <GoogleSheetsPage />;

      // Executive Intelligence
      case 'executive_reports':
        return <ExecutiveReportGenerator kpis={realKPIs} currency={currency} />;
      case 'whatsapp':
      case 'whatsapp_briefing':
        return <WhatsAppBriefingView kpis={realKPIs} currency={currency} />;
      case 'telegram':
      case 'telegram_bot':
        return <TelegramBotPage />;

      // Company & Security
      case 'team_rbac':
      case 'team':
        return <TeamRbacView />;
      case 'subscription_billing':
      case 'subscription':
        return <SubscriptionBillingView />;
      case 'company_profile':
      case 'settings':
      case 'security':
        return <CompanyProfileView />;

      default:
        return (
          <ConsolidatedDashboard
            kpis={realKPIs}
            orders={orders}
            stores={stores}
            currency={currency}
            onNavigateTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Dynamic Themed Ambient Background Glows */}
      <div
        className="fixed top-0 left-1/4 w-[750px] h-[380px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-10 transition-all duration-700"
        style={{ background: 'var(--theme-primary)' }}
      />
      <div
        className="fixed bottom-10 right-10 w-[600px] h-[350px] rounded-full blur-[150px] pointer-events-none opacity-15 -z-10 transition-all duration-700"
        style={{ background: 'var(--theme-primary)' }}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        currency={currency}
        onToggleCurrency={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        onOpenSearch={() => {
          setSearchOpen(true);
          setMobileMenuOpen(false);
        }}
        onOpenCopilot={() => {
          setActiveTab('real_ai_page');
          setMobileMenuOpen(false);
        }}
        onOpenAbout={() => setAboutOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Background Dimmed Overlay when Menu is Open (Below Navbar) */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/60 animate-in fade-in duration-200 cursor-pointer"
          aria-label="Close Navigation Overlay"
        />
      )}

      {/* Main Workspace: Full Width Page Content */}
      <div className="flex-1 flex w-full relative min-h-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          collapsed={false}
          onToggleCollapse={() => {}}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main
          className={`flex-1 p-3 sm:p-5 lg:p-6 pb-28 sm:pb-24 w-full max-w-7xl mx-auto min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            mobileMenuOpen
              ? 'select-none pointer-events-none opacity-40 scale-[0.99]'
              : 'opacity-100 scale-100'
          }`}
        >
          <ErrorBoundary fallbackTitle="DataNexus Analytics Workspace Error">
            {renderActiveScreen()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command-K Search Palette */}
      <QuickSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchOpen(false);
        }}
      />

      {/* About Project & Architecture Audit Modal */}
      <AboutProjectModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      {/* Floating Copilot Button - Compact and non-intrusive */}
      {activeTab !== 'real_ai_page' && activeTab !== 'ai_copilot' && (
        <button
          onClick={() => setActiveTab('real_ai_page')}
          aria-label="Open AI Copilot"
          title="Open AI Copilot & Voice"
          className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-cyan-400 hover:text-white font-bold text-xs shadow-xl border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md transition-all cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-mono">AI Copilot</span>
        </button>
      )}
    </div>
  );
}
