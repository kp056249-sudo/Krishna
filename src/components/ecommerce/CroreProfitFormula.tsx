import React, { useState } from 'react';
import { Target, TrendingUp, DollarSign, Calculator, ArrowRight, CheckCircle, Sparkles, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { askDataNexusCopilot } from '../../services/geminiService';

export const CroreProfitFormula: React.FC = () => {
  const [targetProfitCrores, setTargetProfitCrores] = useState<number>(10); // ₹10 Cr default
  const [aov, setAov] = useState<number>(1850);
  const [cogsPercent, setCogsPercent] = useState<number>(26);
  const [roas, setRoas] = useState<number>(4.5);
  const [rtoPercent, setRtoPercent] = useState<number>(8.5);
  const [shippingAndPackaging, setShippingAndPackaging] = useState<number>(120);
  const [repeatBuyerPercent, setRepeatBuyerPercent] = useState<number>(25);

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);

  // Calculations
  const targetProfitInr = targetProfitCrores * 10000000;
  // Net margin estimate:
  // Revenue = 100%
  // - COGS%
  // - Ad Spend% (1 / ROAS * 100)
  // - Shipping & RTO overhead% ((Shipping + RTO% * 180) / AOV * 100)
  // - Ops / Payment Gateway overhead (approx 4%)
  const adSpendPercent = (1 / roas) * 100;
  const shippingAndRtoPercent = ((shippingAndPackaging + (rtoPercent / 100) * 160) / aov) * 100;
  const paymentAndOpsPercent = 4.5;
  const estimatedNetMarginPercent = Math.max(5, 100 - cogsPercent - adSpendPercent - shippingAndRtoPercent - paymentAndOpsPercent);

  const requiredAnnualRevenue = targetProfitInr / (estimatedNetMarginPercent / 100);
  const requiredMonthlyRevenue = requiredAnnualRevenue / 12;
  const totalOrdersRequiredAnnual = requiredAnnualRevenue / aov;
  const dailyOrdersRequired = Math.round(totalOrdersRequiredAnnual / 365);
  const maxAllowableCac = aov / roas;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
    });
  };

  const handleGenerateAiPlan = async () => {
    setAiGenerating(true);
    const prompt = `Generate a rigorous, bulletproof mathematical roadmap to achieve ₹${targetProfitCrores} Crore Net Profit for an Indian D2C brand with AOV ₹${aov}, COGS ${cogsPercent}%, ROAS ${roas}x, and RTO ${rtoPercent}%. Provide actionable daily execution levers, courier routing, and ad guardrails.`;
    const res = await askDataNexusCopilot(prompt);
    setAiPlan(res);
    setAiGenerating(false);
    triggerCelebration();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded">
              KP Nexus Profit Engine
            </span>
            <span className="text-xs text-slate-400">Unit Economics &amp; Scale Architecture</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            ₹{targetProfitCrores} Crore Net Profit Formula &amp; Machine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Reverse-engineered mathematical model to transition D2C brands from GMV vanity to pure, verified bank account net profit.
          </p>
        </div>

        {/* Target Milestone Quick Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          {[1, 5, 10, 25, 50, 100].map((crores) => (
            <button
              key={crores}
              onClick={() => {
                setTargetProfitCrores(crores);
                triggerCelebration();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                targetProfitCrores === crores
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              ₹{crores} Cr
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Required Blueprint Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Required Annual Revenue</p>
          <p className="text-2xl font-black text-white mt-1">₹{(requiredAnnualRevenue / 10000000).toFixed(2)} Crores</p>
          <p className="text-[11px] text-emerald-400 mt-1">₹{(requiredMonthlyRevenue / 100000).toFixed(1)} Lakhs / month</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Daily Orders Target</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{dailyOrdersRequired.toLocaleString()} orders/day</p>
          <p className="text-[11px] text-slate-400 mt-1">{Math.round(totalOrdersRequiredAnnual).toLocaleString()} annual orders</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Target Max CAC Ceiling</p>
          <p className="text-2xl font-black text-amber-400 mt-1">₹{Math.round(maxAllowableCac)}</p>
          <p className="text-[11px] text-slate-400 mt-1">At {roas}x ROAS on ₹{aov} AOV</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Calculated Net Margin</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{estimatedNetMarginPercent.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Pure post-RTO &amp; post-ad profit</p>
        </div>
      </div>

      {/* Main Grid: Interactive Sliders vs Waterfall Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Variables & Sliders */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Unit Economics Levers</h2>
            </div>
            <button
              onClick={() => {
                setAov(1850);
                setCogsPercent(26);
                setRoas(4.5);
                setRtoPercent(8.5);
                setShippingAndPackaging(120);
                setRepeatBuyerPercent(25);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          {/* AOV Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Average Order Value (AOV)</span>
              <span className="font-bold text-white font-mono-code">₹{aov}</span>
            </div>
            <input
              type="range"
              min="600"
              max="6000"
              step="50"
              value={aov}
              onChange={(e) => setAov(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Higher AOV cushions advertising CAC and shipping costs.</p>
          </div>

          {/* COGS % */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">COGS &amp; Manufacturing %</span>
              <span className="font-bold text-white font-mono-code">{cogsPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={cogsPercent}
              onChange={(e) => setCogsPercent(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Cost of product per unit: ₹{Math.round((aov * cogsPercent) / 100)}</p>
          </div>

          {/* Blended ROAS */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Blended ROAS (Paid Media &amp; Organic)</span>
              <span className="font-bold text-white font-mono-code">{roas}x</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="8.0"
              step="0.1"
              value={roas}
              onChange={(e) => setRoas(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Marketing Cost %: {adSpendPercent.toFixed(1)}% of Revenue</p>
          </div>

          {/* RTO Rate % */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Return to Origin (RTO %)</span>
              <span className="font-bold text-white font-mono-code">{rtoPercent}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="0.5"
              value={rtoPercent}
              onChange={(e) => setRtoPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Every 1% RTO reduction adds ~₹{(requiredAnnualRevenue * 0.008 / 100000).toFixed(1)} Lakhs directly to net profit.</p>
          </div>

          {/* Repeat Buyer Rate % */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">30-90 Day Repeat Purchase %</span>
              <span className="font-bold text-white font-mono-code">{repeatBuyerPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={repeatBuyerPercent}
              onChange={(e) => setRepeatBuyerPercent(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">Acquired at ₹0 CAC via WhatsApp and automated retention flows.</p>
          </div>
        </div>

        {/* Right: Waterfall Profit Breakdown & Levers */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Per Order Unit Economics Waterfall (₹{aov} AOV)
            </h2>

            <div className="mt-4 space-y-3">
              {/* Gross AOV */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-semibold">1. Gross Order Revenue</span>
                <span className="text-white font-bold font-mono-code">₹{aov} (100%)</span>
              </div>

              {/* COGS deduction */}
              <div className="flex items-center justify-between text-xs text-red-300 pl-3 border-l-2 border-red-500">
                <span>- Manufacturing &amp; COGS ({cogsPercent}%)</span>
                <span className="font-mono-code">-₹{Math.round((aov * cogsPercent) / 100)}</span>
              </div>

              {/* Marketing Ad Spend */}
              <div className="flex items-center justify-between text-xs text-red-300 pl-3 border-l-2 border-red-500">
                <span>- Customer Acquisition Cost (ROAS {roas}x)</span>
                <span className="font-mono-code">-₹{Math.round(maxAllowableCac)}</span>
              </div>

              {/* Forward Shipping & Packaging */}
              <div className="flex items-center justify-between text-xs text-amber-300 pl-3 border-l-2 border-amber-500">
                <span>- Shipping &amp; Warehouse Packaging</span>
                <span className="font-mono-code">-₹{shippingAndPackaging}</span>
              </div>

              {/* RTO reverse logistics drag */}
              <div className="flex items-center justify-between text-xs text-amber-300 pl-3 border-l-2 border-amber-500">
                <span>- Blended RTO Reverse Drag ({rtoPercent}%)</span>
                <span className="font-mono-code">-₹{Math.round((rtoPercent / 100) * 160)}</span>
              </div>

              {/* Gateway & Technology */}
              <div className="flex items-center justify-between text-xs text-slate-400 pl-3 border-l-2 border-slate-600">
                <span>- Payment Gateway &amp; Platform Ops ({paymentAndOpsPercent}%)</span>
                <span className="font-mono-code">-₹{Math.round((aov * paymentAndOpsPercent) / 100)}</span>
              </div>

              {/* Net Profit Realized */}
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-sm font-bold bg-emerald-950/40 p-3 rounded-xl border border-emerald-600/30">
                <span className="text-emerald-300">Clean Bank Net Profit Per Order</span>
                <span className="text-emerald-400 text-base font-mono-code">
                  +₹{Math.round((aov * estimatedNetMarginPercent) / 100)} ({estimatedNetMarginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* AI Roadmap Trigger */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleGenerateAiPlan}
              disabled={aiGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating ₹{targetProfitCrores} Cr Roadmap via Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Detailed ₹{targetProfitCrores} Cr Action Plan (Gemini AI)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Generated Plan Modal/Drawer */}
      {aiPlan && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                Gemini AI ₹{targetProfitCrores} Crore Execution Strategy &amp; Playbook
              </h3>
            </div>
            <button
              onClick={() => setAiPlan(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Dismiss
            </button>
          </div>

          <div className="prose prose-invert prose-xs max-w-none text-slate-300 whitespace-pre-line leading-relaxed font-sans text-xs">
            {aiPlan}
          </div>
        </div>
      )}
    </div>
  );
};
