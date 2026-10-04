import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, AlertOctagon, CheckCircle2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { EmptyState } from '../common/EmptyState';
import { NavigationTab } from '../../types';
import { api } from '../../lib/api';

interface Opportunity {
  id?: string;
  title: string;
  category?: string;
  formula: string;
  estimatedSavings?: number;
  estimatedGainInr?: number;
  actionText?: string;
  actionTab?: NavigationTab;
  status?: string;
}

interface CroreProfitEngineViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const CroreProfitEngineView: React.FC<CroreProfitEngineViewProps> = ({ onNavigate }) => {
  const { orders } = useAuthCompany();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analytics/opportunities');
      if (res.success && Array.isArray(res.opportunities)) {
        setOpportunities(
          res.opportunities.map((o: any, index: number) => ({
            id: `OPP-0${index + 1}`,
            title: o.title,
            category: o.category || 'Profit Optimization',
            formula: o.formula,
            estimatedGainInr: o.estimatedSavings || o.estimatedGainInr || 0,
            actionText: o.actionText || 'Execute Lever',
            actionTab: o.actionTab || ('rto_predictor' as NavigationTab),
            status: o.status || 'Actionable',
          }))
        );
      } else {
        setOpportunities([]);
      }
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Evaluating unit profit leaks across real order history...</p>
      </div>
    );
  }

  if (orders.length === 0 || opportunities.length === 0) {
    return (
      <EmptyState
        title="No Orders Available for Crore Profit Audit"
        description="The Crore Profit Engine computes mathematical profit leaks (high COD return rates, unoptimized logistics zones) from real transactions. Connect a store or import orders to evaluate opportunities."
        actionLabel="Connect Store Now"
        onAction={() => onNavigate('connect_store')}
        secondaryLabel="Upload CSV Dataset"
        onSecondaryAction={() => onNavigate('store_connect_page')}
        icon={TrendingUp}
      />
    );
  }

  const totalEstimatedAnnualGain = opportunities.reduce((acc, o) => acc + (o.estimatedGainInr || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded">
              Crore Profit Opportunity Engine
            </span>
            <span className="text-xs text-slate-400">Audited from {orders.length} Real Transactions</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Real Profit-Leak &amp; Scale Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Identifies actionable financial upside from your live store transactions with explicit mathematical formulas marked with verified confidence levels.
          </p>
        </div>

        <div className="text-right p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Identified Annual Upside (Estimate)</p>
          <p className="text-2xl font-black text-emerald-400 font-mono-code mt-0.5">
            +₹{(totalEstimatedAnnualGain / 100000).toFixed(2)} Lakhs
          </p>
          <span className="text-[9px] text-amber-400/80 font-medium">★ Mathematical Projection (Estimate)</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div
            key={opp.id || opp.title}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {opp.category}
                </span>
                <span className="font-mono-code font-bold text-slate-400 text-[11px]">{opp.id}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                  Estimate
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{opp.title}</h3>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono-code text-[11px] text-slate-300">
                <span className="text-slate-500 font-sans">Formula: </span>
                {opp.formula}
              </div>
            </div>

            <div className="flex items-center gap-4 text-left md:text-right flex-shrink-0">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Net Gain</p>
                <p className="text-xl font-black text-emerald-400 font-mono-code">
                  +₹{(opp.estimatedGainInr || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] text-slate-500">annualized estimate</p>
              </div>

              <button
                onClick={() => {
                  if (opp.actionTab) onNavigate(opp.actionTab);
                  else {
                    setNotification(`Configured operational rule for "${opp.title}"`);
                    setTimeout(() => setNotification(null), 3500);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{opp.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
