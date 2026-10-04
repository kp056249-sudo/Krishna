import React from 'react';
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Target,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Store,
  DollarSign,
  Truck,
  Building2,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-6 animate-in fade-in duration-150">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Autonomous E-Commerce Operating System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Stop GMV Vanity. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Scale Real Bank Account Profit.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          KP-TECH is the all-in-one AI profit intelligence platform for Shopify, WooCommerce, and D2C brands. Stop COD return losses, eliminate click-fraud ad waste, and audit every rupee in real time.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('signup')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Start Free - Connect Your Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('pricing')}
            className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 transition-colors"
          >
            View Pricing (₹ INR)
          </button>
        </div>

        {/* Live Feature Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Zero Mock Data · 100% Real Backend
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Shopify GraphQL &amp; WooCommerce Synced
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            WhatsApp Automated OTP &amp; Briefings
          </span>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
            The Industry Problem
          </span>
          <h2 className="text-xl font-bold text-white">Why Indian D2C Brands Bleed Cash:</h2>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Unmitigated COD RTOs (20-35%):</strong> Reverse logistics freight eats 100% of profit margins on returned parcels.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Click-Fraud &amp; Bleeding Ad Sets:</strong> Bot clicks and sub-2.0x ROAS ad campaigns silently burn marketing capital.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Spreadsheet Blindness:</strong> Relying on manual Excel exports hides true courier weight overcharges and gateway fee leakage.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            The KP-TECH Solution
          </span>
          <h2 className="text-xl font-bold text-white">How We Protect &amp; Maximize Net Profit:</h2>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Pre-Dispatch RTO Defense:</strong> Machine learning risk scoring + automated WhatsApp OTP to verify intent before courier pickup.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>AdGuard Sentinel:</strong> Auto-pauses underperforming ad sets and protects your budget with multi-touch attribution.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Daily 8:00 AM CEO Briefings:</strong> Clean bank net profit reports sent directly to WhatsApp without logging in.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="space-y-8 text-center max-w-4xl mx-auto">
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            Frictionless Setup
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">How It Works in 3 Simple Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h3 className="font-bold text-white text-sm">Connect Store or Import CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Link your Shopify store via Admin API or upload your historical orders CSV in under 60 seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h3 className="font-bold text-white text-sm">Configure Unit Economics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your standard COGS %, shipping rates, and gateway fees in the Profit Formula editor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h3 className="font-bold text-white text-sm">Turn On Auto-Pilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enable automated WhatsApp COD verification, AdGuard protection, and daily morning CEO briefings.
            </p>
          </div>
        </div>
      </section>

      {/* Core Feature Matrix */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">The Complete Operating Suite</h2>
          <p className="text-xs text-slate-400">Everything needed to transition from chaotic scaling to high-margin predictability</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-white text-sm">RTO Predictor &amp; Defense Shield</h3>
            <p className="text-slate-400">Scores COD return risk per pincode and automates WhatsApp 1-tap OTP confirmations.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Crore Profit Formula Machine</h3>
            <p className="text-slate-400">Reverse-engineers unit economics from ₹1 Cr to ₹100 Cr net profit targets.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Target className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">AdGuard Multi-Touch Attribution</h3>
            <p className="text-slate-400">Eliminates bot ad clicks and accurately attributes sales across Meta and Google Ads.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">3PL Logistics Kaizen Matrix</h3>
            <p className="text-slate-400">Live courier benchmarking across BlueDart, Delhivery, Ekart, Shadowfax &amp; DTDC.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Autonomous Gemini AI Copilot</h3>
            <p className="text-slate-400">Conversational data scientist querying your live store orders with zero hallucinated numbers.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Daily CEO WhatsApp Briefings</h3>
            <p className="text-slate-400">8:00 AM morning executive summaries delivered straight to founder WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Card */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-800/60 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Protect &amp; Scale Your Net Profit?</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Join high-growth D2C brands using KP-TECH to eliminate RTO bleed and scale real bank margins.
        </p>
        <button
          onClick={() => onNavigate('signup')}
          className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Create Your Free Account Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Public Footer */}
      <footer className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">KP-TECH</span>
          <span>·</span>
          <span>© 2026 KP Tech Global Enterprises. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => onNavigate('privacy_policy')} className="hover:text-white">Privacy Policy</button>
          <span>·</span>
          <button onClick={() => onNavigate('terms_of_service')} className="hover:text-white">Terms of Service</button>
          <span>·</span>
          <button onClick={() => onNavigate('pricing')} className="hover:text-white">Pricing</button>
        </div>
      </footer>
    </div>
  );
};
