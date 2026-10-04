import React from 'react';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { NavigationTab } from '../../types';

interface PricingPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectPlan?: (planId: string) => void;
  isLoggedIn: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onSelectPlan, isLoggedIn }) => {
  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-150">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded">
          Transparent Indian D2C Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Invest in Net Profit. Not Software Bloat.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Start free with basic RTO scoring, or unlock the complete autonomous operating suite to scale from ₹1 Cr to ₹10 Cr+ in verified net profit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Starter Plan */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Tier</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-white font-mono-code">₹0</span>
                <span className="text-xs text-slate-400">/ Forever Free</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Perfect for new stores beginning to audit their return rates.</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>1 Connected Store (Shopify / WooCommerce / CSV)</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Basic Pincode &amp; Order RTO Risk Scoring</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Live Orders Table &amp; CSV Export</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Standard Community Forum Access</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isLoggedIn ? onNavigate('dashboard') : onNavigate('signup'))}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isLoggedIn ? 'Current Base Plan' : 'Get Started Free'}
          </button>
        </div>

        {/* VIP Enterprise Auto-Pilot Plan */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/60 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950">
              HIGH ROI · AUTO-PILOT
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">VIP Enterprise Auto-Pilot</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-white font-mono-code">₹14,999</span>
                <span className="text-xs text-slate-400">/ month + GST</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Complete operating system to hit ₹1 Crore - ₹10 Crore net profit.</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited Connected Stores</strong> with 2,400+ TPS</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Automated WhatsApp COD 1-Tap OTP</strong> &amp; UPI prepaid vouchers</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>AdGuard Sentinel</strong> with click-fraud bot protection</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>₹10 Cr Profit Formula Machine</strong> &amp; P&amp;L Financial Recon</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Daily 8:00 AM CEO WhatsApp Briefings</strong></span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Full Gemini AI Copilot</strong> &amp; Serverless ML Retraining</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isLoggedIn ? onNavigate('subscription') : onNavigate('signup'))}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLoggedIn ? 'Manage VIP Subscription' : 'Upgrade to VIP Auto-Pilot'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
