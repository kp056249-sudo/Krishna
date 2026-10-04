import React, { useState, useEffect } from 'react';
import { Calculator, Save, CheckCircle2, RefreshCw, DollarSign, Percent, ShieldCheck } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { UnitCosts } from '../../types';
import { api } from '../../lib/api';

export const ProfitFormulaView: React.FC = () => {
  const { company, currency } = useAuthCompany();

  const [costs, setCosts] = useState<UnitCosts>({
    companyId: company?.id || '',
    defaultCogsPercent: 28,
    shippingPerOrder: 90,
    packagingPerOrder: 25,
    gatewayFeePercent: 2.0,
    gstPercent: 18,
    rtoReverseShippingCost: 120,
    skuCosts: {},
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.get('/api/costs')
      .then((data) => {
        if (data.success && data.costs) {
          setCosts(data.costs);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const data = await api.put('/api/costs', costs);
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              Unit Economics Configuration
            </span>
            <span className="text-xs text-slate-400">Zero Guesswork Profit Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Unit Cost &amp; Profit Formula Setup
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure your actual manufacturing COGS %, shipping rates, packaging costs, and gateway fees. All P&amp;L reports, order margins, and RTO loss calculations will use these exact values.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Unit cost formula saved to your company workspace! All dashboards updated.</span>
          </div>
          <button onClick={() => setSaveSuccess(false)}>✕</button>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <form onSubmit={handleSaveCosts} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Default Manufacturing / COGS Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="80"
                  step="0.5"
                  required
                  value={costs.defaultCogsPercent}
                  onChange={(e) => setCosts({ ...costs, defaultCogsPercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Percentage of order value dedicated to product manufacturing.</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Average Forward Shipping Cost per Consignment (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="400"
                  step="1"
                  required
                  value={costs.shippingPerOrder}
                  onChange={(e) => setCosts({ ...costs, shippingPerOrder: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Weighted average courier charge per 500g package.</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                RTO Reverse Logistics Freight Penalty (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="500"
                  step="1"
                  required
                  value={costs.rtoReverseShippingCost}
                  onChange={(e) => setCosts({ ...costs, rtoReverseShippingCost: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Reverse shipping cost incurred on rejected COD returns.</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Packaging &amp; Unboxing Box Cost per Order (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="150"
                  step="1"
                  required
                  value={costs.packagingPerOrder}
                  onChange={(e) => setCosts({ ...costs, packagingPerOrder: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Outer corrugated box, bubble wrap, thank-you insert cards.</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Payment Gateway Processing Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  required
                  value={costs.gatewayFeePercent}
                  onChange={(e) => setCosts({ ...costs, gatewayFeePercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Razorpay / Cashfree / Stripe average fee (e.g. 2%).</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Applicable GST / Indirect Tax (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="28"
                  step="1"
                  required
                  value={costs.gstPercent}
                  onChange={(e) => setCosts({ ...costs, gstPercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">GST rate applicable to your primary product category.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Formulas saved securely in your company database.
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profit Formula'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
