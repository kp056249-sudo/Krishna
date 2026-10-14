import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Settings,
  Zap,
  Calendar,
  Globe,
  Info
} from 'lucide-react';
import { StoreAccount } from '../../types';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { api } from '../../lib/api';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  stores: StoreAccount[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
  currency: 'INR' | 'USD';
  onToggleCurrency: () => void;
  onOpenSearch: () => void;
  onOpenCopilot: () => void;
  onOpenAbout?: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

interface AlertItem {
  id: string;
  title: string;
  desc?: string;
  message?: string;
  time?: string;
  createdAt?: string;
  type?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  stores,
  selectedStoreId,
  onSelectStore,
  currency,
  onToggleCurrency,
  onOpenSearch,
  onOpenAbout,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { user, company, logout } = useAuthCompany();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<AlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await api.get('/api/alerts');
      if (res.success && Array.isArray(res.alerts)) {
        setNotifications(res.alerts);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-2.5 shadow-lg shadow-black/25 flex-shrink-0">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left: Hamburger Button + Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group"
            title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-200" />
            ) : (
              <Menu className="w-5 h-5 text-slate-200" />
            )}
          </button>

          <button 
            onClick={() => onSelectTab('consolidated_dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0 text-white">
              <Zap className="w-4 h-4 text-white drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  KP DATANEXUS
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hidden xs:inline tracking-wider">
                  ENTERPRISE
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-tight">Enterprise E-Commerce OS</p>
            </div>
          </button>
        </div>

        {/* Center: Spacious Horizontal Single-Line Global Search Bar (Visible on sm+ screens) */}
        <div className="hidden sm:flex flex-1 max-w-2xl lg:max-w-3xl mx-3 sm:mx-6 min-w-0">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all text-xs group cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-3 truncate min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <span className="text-slate-400 font-normal truncate whitespace-nowrap">
                Search metrics, orders, SKUs, SQL queries...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-slate-800/80 border border-slate-700/80 rounded px-1.5 py-0.5 text-slate-400 font-mono shadow-xs flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Clean Icons (Mobile Search, Calendar, Bell with Badge, User Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Mobile Dedicated Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="sm:hidden flex items-center justify-center p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer active:scale-95 shadow-xs touch-manipulation"
            title="Search for metrics, orders, SKUs (⌘K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-slate-300" />
          </button>

          {/* Calendar Indicator */}
          <button
            type="button"
            onClick={() => onSelectTab('whatsapp_briefing')}
            className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors relative cursor-pointer active:scale-95 shadow-xs touch-manipulation"
            title="Scheduled Operations & Calendar"
          >
            <Calendar className="w-4 h-4 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
          </button>

          {/* Notification Alerts Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(prev => !prev);
                setShowUserMenu(false);
                if (!showNotifications) fetchAlerts();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors relative cursor-pointer active:scale-95 shadow-xs touch-manipulation"
              title="System Alerts & Order Warnings"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                {notifications.length > 0 ? notifications.length : '3'}
              </span>
            </button>

            {showNotifications && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> System Alerts
                  </span>
                  <button type="button" onClick={fetchAlerts} className="text-[10px] text-cyan-400 hover:underline cursor-pointer">
                    Refresh
                  </button>
                </div>

                {loadingAlerts ? (
                  <div className="py-4 text-center text-slate-400">Loading alerts...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 text-center text-slate-400">No active alerts. All systems healthy.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 text-xs transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : '')}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{n.desc || n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(prev => !prev);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 shadow-xs touch-manipulation"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-indigo-500/30">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'KP'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-100 leading-none">{user?.name || 'Krishna Pandey'}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Administrator</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1rem)] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="font-bold text-slate-100">{company?.name || 'Krishna Enterprise Workspace'}</p>
                  <p className="text-[11px] text-slate-400">{user?.email || 'admin@datanexus.io'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium">
                      Role: Administrator
                    </span>
                    <button
                      type="button"
                      onClick={onToggleCurrency}
                      className="text-[9px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 cursor-pointer"
                      title="Switch Currency View"
                    >
                      Currency: {currency}
                    </button>
                  </div>
                </div>

                {/* Connected Store Quick Selector */}
                {stores.length > 0 && (
                  <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/60 rounded-xl mb-1">
                    <p className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-400" /> Active Storefront
                    </p>
                    <select
                      value={selectedStoreId}
                      onChange={(e) => onSelectStore(e.target.value)}
                      className="w-full bg-[#0b1120] border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.platform})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('company_profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 cursor-pointer touch-manipulation font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Company Profile &amp; Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('team_rbac');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 cursor-pointer touch-manipulation font-medium transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Team &amp; RBAC Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('subscription_billing');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 cursor-pointer touch-manipulation font-medium transition-colors"
                  >
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span>Subscription Billing</span>
                  </button>

                  {onOpenAbout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAbout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 cursor-pointer touch-manipulation font-medium transition-colors"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>About Platform &amp; Audit</span>
                    </button>
                  )}

                  <div className="border-t border-slate-800/80 my-1"></div>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer touch-manipulation font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
