import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, ArrowLeft } from 'lucide-react';
import { NavigationTab } from '../../types';

interface PrivacyPolicyTermsProps {
  initialTab?: 'privacy' | 'terms';
  onNavigate: (tab: NavigationTab) => void;
}

export const PrivacyPolicyTerms: React.FC<PrivacyPolicyTermsProps> = ({ initialTab = 'privacy', onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 text-xs text-slate-300 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              activeSubTab === 'privacy' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveSubTab('terms')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              activeSubTab === 'terms' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
        </div>
      </div>

      {activeSubTab === 'privacy' ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 leading-relaxed">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              India DPDP Act 2023 &amp; GDPR Compliant
            </span>
            <h1 className="text-xl font-bold text-white">KP-TECH Privacy Policy</h1>
            <p className="text-slate-500 text-[11px]">Last Updated: March 2026</p>
          </div>

          <div className="space-y-4 text-slate-300">
            <h2 className="text-sm font-bold text-white">1. Information We Collect</h2>
            <p>
              When you connect your e-commerce store (Shopify, WooCommerce, Amazon) or import transaction datasets, KP-TECH processes order identifiers, postal codes, product SKU totals, and courier delivery telemetry necessary to compute RTO risk probabilities and calculate unit economics.
            </p>

            <h2 className="text-sm font-bold text-white">2. Cryptographic Token Protection &amp; PII Sanitization</h2>
            <p>
              Customer telephone numbers and email addresses are cryptographically hashed or masked using 256-bit AES encryption at rest. Store API credentials (such as Shopify Admin Access Tokens) are kept in isolated secure serverless vaults and are never exposed client-side.
            </p>

            <h2 className="text-sm font-bold text-white">3. Third-Party API Processing</h2>
            <p>
              Automated OTP and customer notifications are routed via certified WhatsApp Business API providers (Meta Cloud API / Twilio) under strict opt-in governance. We do not sell or monetize personal customer records.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 leading-relaxed">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Enterprise Terms of Agreement
            </span>
            <h1 className="text-xl font-bold text-white">KP-TECH Terms of Service</h1>
            <p className="text-slate-500 text-[11px]">Effective Date: March 2026</p>
          </div>

          <div className="space-y-4 text-slate-300">
            <h2 className="text-sm font-bold text-white">1. Service Description</h2>
            <p>
              KP-TECH provides autonomous e-commerce analytics, return-to-origin mitigation algorithms, and financial reconciliation tooling. Predictions and profit simulations are advisory calculations based on real historical data inputs.
            </p>

            <h2 className="text-sm font-bold text-white">2. Subscription &amp; Payment Terms</h2>
            <p>
              Paid subscription tiers (VIP Enterprise Auto-Pilot) are billed in INR via Razorpay. Subscriptions grant access to autonomous rule execution and high-TPS processing. Invoices are generated with compliant GST tax details.
            </p>

            <h2 className="text-sm font-bold text-white">3. Platform Ownership &amp; Multi-Tenancy</h2>
            <p>
              Every company operates in strict multi-tenant isolation. Users may only view and modify data associated with their verified company identifier.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
