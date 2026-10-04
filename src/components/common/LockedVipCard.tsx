import React from 'react';
import { Lock, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { NavigationTab } from '../../types';

interface LockedVipCardProps {
  moduleName: string;
  description: string;
  onUpgradeClick: () => void;
}

export const LockedVipCard: React.FC<LockedVipCardProps> = ({
  moduleName,
  description,
  onUpgradeClick,
}) => {
  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-center max-w-xl mx-auto my-12 space-y-5 animate-in fade-in duration-150 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-bold">
          <Sparkles className="w-3 h-3" /> VIP ENTERPRISE AUTO-PILOT MODULE
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">{moduleName}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={onUpgradeClick}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-900/30 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-white" />
          <span>Unlock VIP Auto-Pilot (₹14,999/mo)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500">
        Instant activation via Razorpay · 100% Tax Deductible Business Invoice
      </p>
    </div>
  );
};
