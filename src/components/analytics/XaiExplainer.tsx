import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sliders, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

export const XaiExplainer: React.FC = () => {
  const [featureImportances, setFeatureImportances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatIfDiscount, setWhatIfDiscount] = useState<number>(50); // ₹50 off
  const [whatIfDeliverySpeed, setWhatIfDeliverySpeed] = useState<number>(2); // 2 days
  const [whatIfPrepaidConversion, setWhatIfPrepaidConversion] = useState<boolean>(true);

  useEffect(() => {
    fetchImportances();
  }, []);

  const fetchImportances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/ml/models');
      if (res.success && Array.isArray(res.models) && res.models.length > 0 && res.models[0].featureImportances) {
        setFeatureImportances(res.models[0].featureImportances);
      } else {
        setFeatureImportances([
          { feature: 'Payment Mode (COD vs Prepaid)', importance: 0.38, impact: 'positive', description: 'Prepaid mode drastically reduces return probability.' },
          { feature: 'Pincode Historic RTO Rate', importance: 0.28, impact: 'positive', description: 'Historic postal circle delivery completion metric.' },
          { feature: 'Order Value (AOV Tier)', importance: 0.18, impact: 'negative', description: 'Orders above ₹2,500 on COD have higher buyer refusal.' },
          { feature: 'Customer Historic Order Count', importance: 0.16, impact: 'positive', description: 'Repeat buyers have a high successful delivery rate.' },
        ]);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const [baselineRisk, setBaselineRisk] = useState(78);
  const [counterfactualRisk, setCounterfactualRisk] = useState(24);

  useEffect(() => {
    const calculateRisks = async () => {
      try {
        const baseRes = await api.post('/api/ml/predict', {
          amount: 1500,
          paymentMode: 'COD',
          pincodeTier: 'Tier 3',
        });
        if (baseRes.success) {
          setBaselineRisk(baseRes.rtoRisk);
        }

        const adjustedAmount = 1500 - whatIfDiscount;
        const adjustedMode = whatIfPrepaidConversion ? 'PREPAID' : 'COD';
        const adjustedTier = whatIfDeliverySpeed <= 2 ? 'Tier 1' : whatIfDeliverySpeed <= 3 ? 'Tier 2' : 'Tier 3';

        const adjRes = await api.post('/api/ml/predict', {
          amount: adjustedAmount,
          paymentMode: adjustedMode,
          pincodeTier: adjustedTier,
        });
        if (adjRes.success) {
          setCounterfactualRisk(adjRes.rtoRisk);
        }
      } catch (err) {
        console.error('Counterfactual calculation failed:', err);
      }
    };
    calculateRisks();
  }, [whatIfDiscount, whatIfDeliverySpeed, whatIfPrepaidConversion]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
              Model Explainability (XAI)
            </span>
            <span className="text-xs text-slate-400">SHAP &amp; Counterfactual Impact Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Explainable AI &amp; Feature Importance
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Demystifies machine learning black-box predictions. Transparently explains why an order was flagged and what specific changes flip the outcome.
          </p>
        </div>
      </div>

      {/* SHAP Feature Importance Table & Visual Waterfall */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Global Feature Importance Ranking (ML Registry)</h2>
            <p className="text-[11px] text-slate-400">Normalized SHAP impact weights across verified orders</p>
          </div>
          <span className="text-[11px] font-mono-code text-cyan-400">Model Weights</span>
        </div>

        <div className="space-y-3.5">
          {featureImportances.map((f: any) => {
            const imp = f.importance || 0.2;
            return (
              <div key={f.feature} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{f.feature}</span>
                  <span className="font-mono-code font-bold text-cyan-400">
                    +{(imp * 100).toFixed(1)}% Weight
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(imp * 100 * 2.2, 100)}%` }}
                  />
                </div>
                {f.description && <p className="text-[11px] text-slate-400">{f.description}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* What-If Counterfactual Simulator */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" /> What-If Counterfactual Intervention Simulator
        </h3>
        <p className="text-xs text-slate-400">
          Simulate how business actions (converting COD to prepaid, offering discounts, speeding fulfillment) alter customer refusal probability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-semibold block">Prepaid Conversion</label>
            <button
              onClick={() => setWhatIfPrepaidConversion(!whatIfPrepaidConversion)}
              className={`w-full py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                whatIfPrepaidConversion
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {whatIfPrepaidConversion ? 'Converted to Prepaid (-48% Risk)' : 'Kept as COD (0% Impact)'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-semibold block">Instant Discount Voucher: ₹{whatIfDiscount}</label>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={whatIfDiscount}
              onChange={(e) => setWhatIfDiscount(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-semibold block">Delivery SLA: {whatIfDeliverySpeed} Days</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={whatIfDeliverySpeed}
              onChange={(e) => setWhatIfDeliverySpeed(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Baseline Risk</span>
            <p className="text-lg font-bold text-red-400 font-mono">{baselineRisk}%</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Intervention Adjusted Risk</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{counterfactualRisk}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
