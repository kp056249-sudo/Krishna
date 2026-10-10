import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Bell,
  Sparkles,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Palette,
  Check,
  MoreVertical,
  Send,
  Info,
  Calendar
} from 'lucide-react';
import { StoreAccount } from '../../types';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { useTheme } from '../../context/ThemeContext';
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
  onOpenCopilot,
  onOpenAbout,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { user, company, logout } = useAuthCompany();
  const { mode, toggleMode, activeColor, setColor, allColors } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
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
      setShowThemePicker(false);
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Left: Hamburger 3-lines Icon + Brand */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
          {/* Main 3-Lines / Hamburger Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 group"
            title={mobileMenuOpen ? 'Close Menu' : 'Open All Features & Navigation Menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>

          <button 
            onClick={() => onSelectTab('consolidated_dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#233876] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 text-white">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-slate-900">DATANEXUS</span>
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#233876] hidden xs:inline">ENTERPRISE</span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 font-medium tracking-tight">Enterprise E-Commerce &amp; Analytics OS</p>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar (Matches Screenshot Search Bar Perfectly) */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/60 text-slate-400 hover:text-slate-600 transition-all text-xs group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#233876] transition-colors" />
              <span className="text-slate-400 font-normal">Search for metrics, orders, SKUs, reports...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Telegram Support Bot Launch */}
          <button
            onClick={() => onSelectTab('telegram')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Open KP Support Telegram Bot Page"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">Telegram Bot</span>
          </button>

          {/* AI Copilot Quick Launch */}
          <button
            onClick={onOpenCopilot}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#233876]" />
            <span className="hidden lg:inline">AI Copilot</span>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={onToggleCurrency}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs"
            title="Toggle INR / USD Currency View"
          >
            {currency === 'INR' ? '₹' : '$'}
          </button>

          {/* About Project & Architecture Audit Button */}
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="View Architecture, Real vs Simulation Disclosure, and Tech Stack"
            >
              <Info className="w-3.5 h-3.5 text-[#233876]" />
              <span className="hidden sm:inline">About</span>
            </button>
          )}

          {/* Store Switcher (Shown on desktop) */}
          {stores.length > 0 && (
            <div className="relative hidden lg:block">
              <select
                value={selectedStoreId}
                onChange={(e) => onSelectStore(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-xs"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.platform})
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Branded Theme Colors Palette Picker (10 Unique Enterprise Colors) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowThemePicker(prev => !prev);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 touch-manipulation"
              title="Branded Theme Colors (10 Enterprise Presets)"
              aria-label="Choose Theme Color"
            >
              <Palette className="w-4 h-4 text-slate-600" />
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                style={{ backgroundColor: activeColor.hex }}
              />
            </button>

            {showThemePicker && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Palette className="w-4 h-4" style={{ color: activeColor.hex }} />
                    Enterprise Theme Colors
                  </span>
                  <span className="text-[10px] text-slate-500">10 Presets</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {allColors.map((color) => {
                    const isSelected = color.id === activeColor.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setColor(color.id);
                          setShowThemePicker(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer touch-manipulation ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold ring-1 ring-slate-300'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center shadow-xs ring-1 ring-black/10"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="text-[11px] truncate">{color.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Indicator (Matches Screenshot Calendar Icon with Dot) */}
          <button
            type="button"
            onClick={() => onSelectTab('whatsapp_briefing')}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors relative cursor-pointer active:scale-95 shadow-xs"
            title="Scheduled Operations & Calendar"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          </button>

          {/* Notification Alerts Bell (Matches Screenshot Bell with badge 3) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(prev => !prev);
                setShowThemePicker(false);
                setShowUserMenu(false);
                if (!showNotifications) fetchAlerts();
              }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors relative cursor-pointer active:scale-95 shadow-xs touch-manipulation"
              title="System Alerts & Order Warnings"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#233876] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {notifications.length > 0 ? notifications.length : '3'}
              </span>
            </button>

            {showNotifications && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> System Alerts
                  </span>
                  <button type="button" onClick={fetchAlerts} className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                    Refresh
                  </button>
                </div>

                {loadingAlerts ? (
                  <div className="py-4 text-center text-slate-400">Loading alerts...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 text-center text-slate-500">No active alerts. All systems healthy.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-xs transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : '')}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.desc || n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu (Matches Screenshot User Profile Avatar + Administrator Role) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(prev => !prev);
                setShowThemePicker(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 shadow-xs touch-manipulation"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-white">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'KP'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Krishna Pandey'}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Administrator</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showUserMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">{company?.name || 'Workspace'}</p>
                  <p className="text-[11px] text-slate-500">{user?.email || 'admin@datanexus.io'}</p>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#233876] font-medium">
                    Role: Administrator
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('company_profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer touch-manipulation font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Company Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('team_rbac');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer touch-manipulation font-medium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Team &amp; RBAC Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('subscription_billing');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer touch-manipulation font-medium"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Subscription Billing</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer touch-manipulation font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
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
