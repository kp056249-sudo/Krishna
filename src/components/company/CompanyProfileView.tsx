import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, CheckCircle2, Lock, Save, RefreshCw, AlertCircle, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthCompany } from '../../context/AuthCompanyContext';

export const CompanyProfileView: React.FC = () => {
  const { company, user, refreshData } = useAuthCompany();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/company');
      if (res.success && res.company) {
        const c = res.company;
        setCompanyName(c.name || '');
        setIndustry(c.industry || 'Direct-to-Consumer (D2C) Retail');
        setEmail(c.ownerEmail || c.email || user?.email || '');
        setPhone(c.ownerPhone || c.phone || '');
        setAddress(c.address || 'Mumbai, Maharashtra, India');
        setGstin(c.gstin || '');
        setCurrency(c.currency || 'INR');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await api.put('/api/company', {
        name: companyName.trim(),
        industry,
        email,
        phone,
        address,
        gstin,
        currency,
      });

      if (res.success) {
        setNotification('Company profile updated successfully.');
        await refreshData();
      } else {
        setError(res.error || 'Failed to update company profile');
      }
    } catch (e: any) {
      setError(e.message || 'Error saving company profile');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Verified Workspace Profile
            </span>
            <span className="text-xs text-slate-400">Tenant Scoped Isolation</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Company Profile &amp; Business Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your legal enterprise profile, tax credentials (GSTIN), and billing defaults stored persistently in Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>ID: {company?.id || 'comp_...'}</span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Company / Brand Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Industry Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Official Business Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Contact Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">GSTIN / Tax Identification</label>
            <input
              type="text"
              value={gstin}
              placeholder="Enter official GSTIN (Optional)"
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Base Accounting Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ United States Dollar)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Registered Headquarters Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Profile...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
