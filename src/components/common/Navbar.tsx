import React, { useState, useEffect } from 'react';
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
  Send
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

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div 
        className="w-full overflow-x-auto no-scrollbar scroll-smooth px-2 sm:px-4 lg:px-6 py-2"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          overscrollBehaviorX: 'contain'
        }}
      >
        <div className="flex items-center justify-between gap-3 w-max min-w-full">
        {/* Left: Hamburger 3-lines Icon + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0 sticky left-0 z-20 bg-slate-950/95 pr-1">
          {/* Main 3-Lines / Hamburger Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Sidebar"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 group ${
              mobileMenuOpen
                ? 'bg-cyan-950/90 border-cyan-500/70 text-cyan-300 ring-2 ring-cyan-500/40'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/60 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
            title={mobileMenuOpen ? 'Close Menu' : 'Open All Features & Navigation Menu'}
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-5 h-5 text-cyan-400 animate-in spin-in-90 duration-150" />
                <span className="text-xs font-bold text-cyan-300">Close</span>
              </>
            ) : (
              <>
                <Menu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                  Menu
                </span>
              </>
            )}
          </button>

          <button 
            onClick={() => onSelectTab('consolidated_dashboard')}
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">DATANEXUS</span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">ENTERPRISE</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium tracking-tight">Enterprise E-Commerce &amp; Analytics OS</p>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-xs font-normal">Search features, orders, RTO models, SQL studio, stores...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Telegram Support Bot Launch */}
          <button
            onClick={() => onSelectTab('telegram')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600/20 to-blue-600/20 hover:from-sky-600/30 hover:to-blue-600/30 border border-sky-500/40 text-sky-300 text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            title="Open KP Support Telegram Bot Page"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Bot</span>
          </button>

          {/* AI Copilot Quick Launch */}
          <button
            onClick={onOpenCopilot}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Copilot</span>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={onToggleCurrency}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle INR / USD Currency View"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>

          {/* Store Switcher (Shown on desktop, hidden on narrow mobile so navbar doesn't break) */}
          {stores.length > 0 && (
            <div className="relative hidden lg:block">
              <select
                value={selectedStoreId}
                onChange={(e) => onSelectStore(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
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
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-500" />
            )}
          </button>

          {/* Branded Theme Colors Palette Picker (10 Unique Enterprise Colors) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemePicker(!showThemePicker);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Branded Theme Colors (10 Enterprise Presets)"
              aria-label="Choose Theme Color"
            >
              <Palette className="w-4 h-4 text-slate-300" />
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: activeColor.hex }}
              />
            </button>

            {showThemePicker && (
              <div className="fixed top-14 right-2 sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-72 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-4 h-4" style={{ color: activeColor.hex }} />
                    Enterprise Theme Colors
                  </span>
                  <span className="text-[10px] text-slate-400">10 Presets</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {allColors.map((color) => {
                    const isSelected = color.id === activeColor.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => {
                          setColor(color.id);
                          setShowThemePicker(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white font-bold ring-1 ring-white/25'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ring-1 ring-white/20"
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

          {/* Notification Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowThemePicker(false);
                setShowUserMenu(false);
                if (!showNotifications) fetchAlerts();
              }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors relative cursor-pointer active:scale-95"
              title="System Alerts & Order Warnings"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed top-14 right-2 sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> System Alerts
                  </span>
                  <button onClick={fetchAlerts} className="text-[10px] text-cyan-400 hover:underline">
                    Refresh
                  </button>
                </div>

                {loadingAlerts ? (
                  <div className="py-4 text-center text-slate-500">Loading alerts...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 text-center text-slate-500">No active alerts. All systems healthy.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : '')}</span>
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
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowThemePicker(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer active:scale-95"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'DN'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-none">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-cyan-400 font-medium leading-none mt-1 capitalize">User</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
            </button>

            {showUserMenu && (
              <div className="fixed top-14 right-2 sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-64 max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="font-semibold text-white">{company?.name || 'Workspace'}</p>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                    Role: User
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab('company_profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab('team_rbac');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Team &amp; RBAC Access</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab('subscription_billing');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Subscription Billing</span>
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Backdrop overlay for active popups on all screens */}
      {(showThemePicker || showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
          onClick={() => {
            setShowThemePicker(false);
            setShowNotifications(false);
            setShowUserMenu(false);
          }} 
        />
      )}
    </header>
  );
};
