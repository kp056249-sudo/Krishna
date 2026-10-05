import React, { useState, useEffect, useMemo } from 'react';
import {
  BrainCircuit, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert,
  TrendingDown, IndianRupee, Info, AlertCircle, Play, Filter, X, Zap
} from 'lucide-react';
import { api } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ModelStatus {
  trained: boolean;
  lastTrainedAt?: string;
  dataRowsUsed?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  auc?: number;
  baselineAuc?: number;
  message?: string;
}

interface FeatureExplanation {
  feature: string;
  contribution: number;
}

interface ScoredOrder {
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  orderTotal: number;
  paymentMode: string;
  rtoRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topFeatures: FeatureExplanation[];
  action?: 'held' | 'confirmed' | 'marked_safe';
  createdAt?: string;
}

interface TrainResult {
  success: boolean;
  accuracy?: number;
  precision?: number;
  recall?: number;
  auc?: number;
  baselineAuc?: number;
  dataRowsUsed?: number;
  error?: string;
  insufficientData?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(level: ScoredOrder['riskLevel']) {
  return {
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  }[level];
}

function riskBarColor(level: ScoredOrder['riskLevel']) {
  return { LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500' }[level];
}

function fmtCur(n: number) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function fmtPct(n?: number) {
  if (n == null) return '—';
  return (n * 100).toFixed(1) + '%';
}

// ─── Metric Card ───────────────────────────────────────────────────────────

const MetricCard: React.FC<{ label: string; val: string | number; sub?: string; color?: string; }> = ({ label, val, sub, color = 'cyan' }) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col gap-1">
    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{label}</p>
    <p className={`text-xl font-extrabold text-${color}-400`}>{val}</p>
    {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
  </div>
);

// ─── Order Row ───────────────────────────────────────────────────────────────

const OrderRow: React.FC<{
  order: ScoredOrder;
  onAction: (orderId: string, action: 'hold' | 'confirm' | 'mark_safe') => void;
  actioning: string | null;
}> = ({ order, onAction, actioning }) => {
  const [expanded, setExpanded] = useState(false);
  const busy = actioning === order.orderId;

  return (
    <>
      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td className="px-3 py-2.5">
          <div className="font-semibold text-white text-xs">{order.orderNumber || order.orderId.slice(0, 8)}</div>
          <div className="text-slate-400 text-[10px]">{order.customerName || '—'}</div>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-300">{fmtCur(order.orderTotal)}</td>
        <td className="px-3 py-2.5 text-xs text-slate-400">{order.paymentMode}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${riskBarColor(order.riskLevel)}`} style={{ width: `${order.rtoRiskScore}%` }} />
            </div>
            <span className="text-xs font-bold text-white">{order.rtoRiskScore}</span>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskColor(order.riskLevel)}`}>
            {order.riskLevel}
          </span>
        </td>
        <td className="px-3 py-2.5">
          {order.action ? (
            <span className="text-[10px] text-slate-400 italic capitalize">{order.action.replace('_', ' ')}</span>
          ) : (
            <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onAction(order.orderId, 'hold')}
                disabled={busy}
                className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {busy ? '...' : 'Hold'}
              </button>
              <button
                onClick={() => onAction(order.orderId, 'confirm')}
                disabled={busy}
                className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => onAction(order.orderId, 'mark_safe')}
                disabled={busy}
                className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Safe
              </button>
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-800/40">
          <td colSpan={6} className="px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Top Risk Factors</p>
            <div className="space-y-1.5">
              {order.topFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-28 text-[10px] text-slate-400 truncate">{f.feature}</div>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.contribution > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(Math.abs(f.contribution) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold w-12 text-right ${f.contribution > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {f.contribution > 0 ? '+' : ''}{(f.contribution * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const RtoIntelligencePage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [orders, setOrders] = useState<ScoredOrder[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [loadingModel, setLoadingModel] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'All' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('All');

  const loadModel = async () => {
    setLoadingModel(true);
    try {
      const res: any = await api.get('/api/rto-ml/model-status');
      setModelStatus(res.model || { trained: false });
    } catch {
      setModelStatus({ trained: false });
    } finally {
      setLoadingModel(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const [ordRes, savRes]: any[] = await Promise.all([
        api.get('/api/rto-ml/scored-orders'),
        api.get('/api/rto-ml/savings'),
      ]);
      setOrders(ordRes.orders || []);
      setSavings(savRes.saved || 0);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadModel();
    loadOrders();
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    setTrainResult(null);
    try {
      const res: any = await api.post('/api/rto-ml/train', {});
      setTrainResult(res);
      if (res.success) {
        setModelStatus({
          trained: true,
          lastTrainedAt: new Date().toISOString(),
          dataRowsUsed: res.dataRowsUsed,
          accuracy: res.accuracy,
          precision: res.precision,
          recall: res.recall,
          auc: res.auc,
          baselineAuc: res.baselineAuc,
        });
        await loadOrders();
      }
    } catch (e: any) {
      setTrainResult({ success: false, error: e.message });
    } finally {
      setTraining(false);
    }
  };

  const handleAction = async (orderId: string, action: 'hold' | 'confirm' | 'mark_safe') => {
    setActioning(orderId);
    try {
      await api.post('/api/rto-ml/action', { orderId, action });
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, action: action === 'hold' ? 'held' : action === 'mark_safe' ? 'marked_safe' : 'confirmed' } : o));
    } catch { /* swallow */ }
    finally { setActioning(null); }
  };

  const filtered = useMemo(() => {
    if (riskFilter === 'All') return orders;
    return orders.filter(o => o.riskLevel === riskFilter);
  }, [orders, riskFilter]);

  const riskCounts = useMemo(() => ({
    CRITICAL: orders.filter(o => o.riskLevel === 'CRITICAL').length,
    HIGH: orders.filter(o => o.riskLevel === 'HIGH').length,
    MEDIUM: orders.filter(o => o.riskLevel === 'MEDIUM').length,
    LOW: orders.filter(o => o.riskLevel === 'LOW').length,
  }), [orders]);

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" /> RTO ML Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Logistic regression RTO risk scoring with explainable AI per order</p>
        </div>
        <button onClick={handleTrain} disabled={training}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-60 cursor-pointer">
          {training ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {training ? 'Training Model...' : 'Train / Retrain Model'}
        </button>
      </div>

      {/* Train Result Banner */}
      {trainResult && (
        <div className={`rounded-xl p-3 border flex items-start gap-2 ${trainResult.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          {trainResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
          <div>
            {trainResult.success ? (
              <p className="text-emerald-300 text-xs font-medium">
                Model trained on <strong>{trainResult.dataRowsUsed}</strong> orders — Accuracy: <strong>{fmtPct(trainResult.accuracy)}</strong>, AUC: <strong>{trainResult.auc?.toFixed(3)}</strong> (vs baseline {trainResult.baselineAuc?.toFixed(3)})
              </p>
            ) : trainResult.insufficientData ? (
              <p className="text-amber-300 text-xs font-medium">Insufficient data — need at least 100 orders with known DELIVERED/RTO outcome to train. Add more real orders first.</p>
            ) : (
              <p className="text-red-300 text-xs font-medium">{trainResult.error || 'Training failed'}</p>
            )}
          </div>
          <button onClick={() => setTrainResult(null)} className="ml-auto text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Model Status Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" /> Model Status
          </h2>
          {!loadingModel && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${modelStatus?.trained ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-600/30 text-slate-400 border-slate-600/40'}`}>
              {modelStatus?.trained ? 'Trained & Active' : 'Not Trained'}
            </span>
          )}
        </div>
        {loadingModel ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-700/50 rounded-xl animate-pulse" />)}
          </div>
        ) : modelStatus?.trained ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard label="Data Rows" val={modelStatus.dataRowsUsed ?? '—'} color="purple" />
            <MetricCard label="Accuracy" val={fmtPct(modelStatus.accuracy)} color="cyan" />
            <MetricCard label="Precision" val={fmtPct(modelStatus.precision)} color="blue" />
            <MetricCard label="Recall" val={fmtPct(modelStatus.recall)} color="indigo" />
            <MetricCard label="AUC" val={modelStatus.auc?.toFixed(3) ?? '—'} sub="Model performance" color="emerald" />
            <MetricCard label="Baseline AUC" val={modelStatus.baselineAuc?.toFixed(3) ?? '—'} sub="Majority class" color="slate" />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <Info className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <p>No model trained yet. Click <strong className="text-white">Train / Retrain Model</strong> to build the RTO risk predictor from your order history. Minimum 100 orders with known outcomes required.</p>
          </div>
        )}
        {modelStatus?.lastTrainedAt && (
          <p className="text-[10px] text-slate-500 mt-3">Last trained: {new Date(modelStatus.lastTrainedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        )}
      </div>

      {/* Savings & Risk Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border border-emerald-500/25 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Saved This Month</p>
          <p className="text-2xl font-extrabold text-emerald-400">{fmtCur(savings)}</p>
          <p className="text-[10px] text-slate-400">High/Critical orders held that didn't RTO</p>
        </div>
        {[
          { label: 'Critical', count: riskCounts.CRITICAL, color: 'red' },
          { label: 'High Risk', count: riskCounts.HIGH, color: 'orange' },
          { label: 'Medium', count: riskCounts.MEDIUM, color: 'amber' },
          { label: 'Low Risk', count: riskCounts.LOW, color: 'emerald' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <p className={`text-[10px] text-${color}-400 uppercase tracking-widest font-bold`}>{label}</p>
            <p className={`text-2xl font-extrabold text-${color}-400`}>{count}</p>
            <p className="text-[10px] text-slate-500">orders</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-sm font-bold text-white">Scored COD Orders (Last 30d)</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer">
              <option value="All">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button onClick={loadOrders} disabled={loadingOrders} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loadingOrders ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-700/50 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No scored orders</p>
            <p className="text-slate-500 text-xs mt-1">
              {modelStatus?.trained ? 'No COD orders found in the last 30 days.' : 'Train the model first to score your orders.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-700">
                  <th className="px-3 py-3 text-left">Order</th>
                  <th className="px-3 py-3 text-left">Value</th>
                  <th className="px-3 py-3 text-left">Mode</th>
                  <th className="px-3 py-3 text-left">Risk Score</th>
                  <th className="px-3 py-3 text-left">Level</th>
                  <th className="px-3 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(order => (
                  <OrderRow key={order.orderId} order={order} onAction={handleAction} actioning={actioning} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        Click any row to expand feature-level risk explanations. Model uses logistic regression with pincode target encoding, payment mode, order value, and RTO history.
      </p>
    </div>
  );
};
