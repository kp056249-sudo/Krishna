import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Sparkles,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation Dock"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around flex-shrink-0"
    >
      {/* 1. Dashboard */}
      <button
        type="button"
        onClick={() => onSelectTab('consolidated_dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'consolidated_dashboard'
            ? 'text-[#233876] font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 ${activeTab === 'consolidated_dashboard' ? 'text-[#233876]' : 'text-slate-500'}`} />
        <span className="text-[10px] leading-tight">Dashboard</span>
      </button>

      {/* 2. Autonomous Agent Deck */}
      <button
        type="button"
        onClick={() => onSelectTab('ai_copilot')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
          activeTab === 'ai_copilot'
            ? 'text-cyan-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <div className="relative">
          <Bot className={`w-4 h-4 ${activeTab === 'ai_copilot' ? 'text-cyan-600' : 'text-slate-500'}`} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>
        <span className="text-[10px] leading-tight">Autonomous</span>
      </button>

      {/* 3. Real AI Studio */}
      <button
        type="button"
        onClick={() => onSelectTab('real_ai_page')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'real_ai_page'
            ? 'text-indigo-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${activeTab === 'real_ai_page' ? 'text-indigo-600' : 'text-slate-500'}`} />
        <span className="text-[10px] leading-tight">Real AI</span>
      </button>

      {/* 4. WhatsApp 8 AM Briefing */}
      <button
        type="button"
        onClick={() => onSelectTab('whatsapp_briefing')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'whatsapp_briefing'
            ? 'text-emerald-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <MessageSquare className={`w-4 h-4 ${activeTab === 'whatsapp_briefing' ? 'text-emerald-600' : 'text-slate-500'}`} />
        <span className="text-[10px] leading-tight">WhatsApp</span>
      </button>

      {/* 5. Menu Drawer Toggle (Side 3-line / 3-dots navigation) */}
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          mobileMenuOpen
            ? 'text-blue-700 bg-blue-50 font-bold'
            : 'text-slate-600 hover:text-slate-900 font-medium'
        }`}
        title="Open Full Navigation Menu"
      >
        {mobileMenuOpen ? (
          <X className="w-4 h-4 text-slate-800" />
        ) : (
          <Menu className="w-4 h-4 text-slate-800" />
        )}
        <span className="text-[10px] leading-tight font-bold">Menu</span>
      </button>
    </nav>
  );
};
