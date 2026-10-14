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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex items-center justify-around flex-shrink-0"
    >
      {/* 1. Dashboard */}
      <button
        type="button"
        onClick={() => onSelectTab('consolidated_dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'consolidated_dashboard'
            ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 ${activeTab === 'consolidated_dashboard' ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span className="text-[10px] leading-tight">Dashboard</span>
      </button>

      {/* 2. Autonomous Agent Deck */}
      <button
        type="button"
        onClick={() => onSelectTab('ai_copilot')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
          activeTab === 'ai_copilot'
            ? 'text-indigo-400 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <div className="relative">
          <Bot className={`w-4 h-4 ${activeTab === 'ai_copilot' ? 'text-indigo-400' : 'text-slate-400'}`} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        </div>
        <span className="text-[10px] leading-tight">Autonomous</span>
      </button>

      {/* 3. Real AI Studio */}
      <button
        type="button"
        onClick={() => onSelectTab('real_ai_page')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'real_ai_page'
            ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${activeTab === 'real_ai_page' ? 'text-cyan-300' : 'text-slate-400'}`} />
        <span className="text-[10px] leading-tight">Real AI</span>
      </button>

      {/* 4. WhatsApp 8 AM Briefing */}
      <button
        type="button"
        onClick={() => onSelectTab('whatsapp_briefing')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'whatsapp_briefing'
            ? 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <MessageSquare className={`w-4 h-4 ${activeTab === 'whatsapp_briefing' ? 'text-emerald-400' : 'text-slate-400'}`} />
        <span className="text-[10px] leading-tight">WhatsApp</span>
      </button>

      {/* 5. Menu Drawer Toggle (Side 3-line / 3-dots navigation) */}
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
          mobileMenuOpen
            ? 'text-white bg-slate-800 font-bold'
            : 'text-slate-300 hover:text-white font-medium'
        }`}
        title="Open Full Navigation Menu"
      >
        {mobileMenuOpen ? (
          <X className="w-4 h-4 text-slate-200" />
        ) : (
          <Menu className="w-4 h-4 text-slate-200" />
        )}
        <span className="text-[10px] leading-tight font-bold">Menu</span>
      </button>
    </nav>
  );
};
