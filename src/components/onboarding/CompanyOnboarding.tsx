import React, { useState } from 'react';
import { Building2, Phone, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { NavigationTab } from '../../types';

interface CompanyOnboardingProps {
  onComplete: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CompanyOnboarding: React.FC<CompanyOnboardingProps> = ({ onComplete, onNavigate }) => {
  const { user, onboardCompany } = useAuthCompany();

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Fashion, Apparel & Luxury D2C');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [ownerPhone, setOwnerPhone] = useState('+91 98454 30129');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98454 30129');
  const [briefingTime, setBriefingTime] = useState('08:00');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Please enter your business or store name.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const ok = await onboardCompany({
        name: companyName,
        industry,
        currency,
        ownerPhone,
        whatsappNumber,
        briefingTime,
        ownerEmail: user?.email || '',
      });

      if (ok) {
        onComplete();
      } else {
        setErrorMsg('Failed to save company profile. Please retry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded">
          Step 1 of 2 · Company Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to KP-TECH, {user?.name || 'Partner'}!
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Let&apos;s configure your business profile and WhatsApp briefing recipient before connecting your stores.
        </p>
      </div>

      {/* Onboarding Form */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Business / Brand Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. KP Luxury D2C Apparels"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Primary Industry Vertical</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-xs cursor-pointer"
              >
                <option value="Fashion, Apparel & Luxury D2C">Fashion, Apparel &amp; Luxury D2C</option>
                <option value="Electronics, Gadgets & Audio">Electronics, Gadgets &amp; Audio</option>
                <option value="Ayurveda, Beauty & Skincare">Ayurveda, Beauty &amp; Skincare</option>
                <option value="Footwear & Activewear">Footwear &amp; Activewear</option>
                <option value="Home, Kitchen & Living">Home, Kitchen &amp; Living</option>
                <option value="Multi-Brand Marketplace">Multi-Brand Marketplace</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Base Financial Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-xs cursor-pointer font-bold"
              >
                <option value="INR">₹ INR (Indian Rupee - Default)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Owner Mobile Phone</label>
              <input
                type="text"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+91 98454 00000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">WhatsApp Number for Daily Briefings</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 98454 00000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Daily CEO WhatsApp Briefing Schedule:</span>
            </div>
            <span className="font-bold text-white font-mono-code">08:00 AM IST (Daily)</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>{submitting ? 'Saving Profile...' : 'Save & Proceed to Connect Store'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
