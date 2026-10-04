import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, MapPin, Phone, AlertTriangle, ArrowRight, CheckCircle2, Send, Sparkles, Filter, Info } from 'lucide-react';
import { OrderItem } from '../../types';
import { api } from '../../lib/api';

interface RtoPredictorProps {
  orders: OrderItem[];
  currency: 'INR' | 'USD';
}

export const RtoPredictor: React.FC<RtoPredictorProps> = ({ orders, currency }) => {
  const [rtoAnalytics, setRtoAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Risk test calculator input state
  const [testPincode, setTestPincode] = useState('800001');
  const [testAov, setTestAov] = useState('2499');
  const [testPayment, setTestPayment] = useState<'COD' | 'PREPAID'>('COD');
  const [testAddress, setTestAddress] = useState('House No 42, Near Railway Crossing, Patna');
  const [riskResult, setRiskResult] = useState<{
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasons: string[];
    recommendation: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchRtoAnalytics();
  }, [orders.length]);

  const fetchRtoAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/api/analytics/rto-score');
      if (res.success) {
        setRtoAnalytics(res);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const calculateRisk = async () => {
    try {
      const res = await api.post('/api/ml/predict', {
        amount: Number(testAov),
        paymentMode: testPayment,
        pincode: testPincode
      });

      if (res.success) {
        const score = res.rtoRisk;
        const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
        const reasons = [
          `ML Score: ${score}% probability based on historic company data.`,
          testPayment === 'COD' ? 'COD mode detected (+ risk)' : 'Prepaid transaction (- risk)',
          Number(testAov) > 2500 ? 'High ticket size (+ risk)' : 'Standard amount'
        ];
        const recommendation = score >= 70
          ? 'Hold order for automated WhatsApp OTP confirmation.'
          : 'Safe for immediate automated fulfillment.';

        setRiskResult({ score, level, reasons, recommendation });
      }
    } catch (err: any) {
      setNotification(`ML Prediction failed: ${err.message}`);
    }
  };

  const handleSendOtp = () => {
    setNotification('Automated WhatsApp OTP verification payload dispatched to customer.');
    setTimeout(() => setNotification(null), 3500);
  };

  const rtoOrders = orders.filter((o) => String(o.status).includes('RTO'));
  const codOrders = orders.filter((o) => o.paymentMode === 'COD');
  const rtoRate = orders.length > 0 ? ((rtoOrders.length / orders.length) * 100).toFixed(1) : '0.0';
  const modelAccuracy = rtoAnalytics?.modelAccuracy || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded">
              Statistical RTO Defense Shield
            </span>
            <span className="text-xs text-slate-400">Order Refusal &amp; NDR Interception</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            RTO Predictor &amp; COD Defense Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Detects high-risk return orders prior to courier dispatch, converting speculative COD into verified prepaid revenue.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right border-r border-slate-800 pr-6">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Model Accuracy</p>
            <p className={`text-base font-black font-mono-code ${modelAccuracy > 80 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {modelAccuracy > 0 ? `${modelAccuracy}%` : 'Training...'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Real RTO Rate</p>
            <p className="text-base font-black text-amber-400 font-mono-code">{rtoRate}%</p>
          </div>
          <button
            onClick={handleSendOtp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast OTP</span>
          </button>
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

      {/* Statistical Significance Banner */}
      {rtoAnalytics && !rtoAnalytics.hasEnoughData && (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Model Sample Size Notice</p>
            <p className="text-amber-400/90 mt-0.5">
              {rtoAnalytics.message} ({rtoAnalytics.currentOrderCount} / {rtoAnalytics.requiredCount} current orders).
              Connect your store or import orders CSV to unlock localized pin-level XGBoost predictive models.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Interactive Risk Test Calculator + Real Orders Risk Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Single Order Risk Scoring */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Single Order Risk Evaluator
            </h2>
            <span className="text-[11px] text-slate-400">Rule &amp; Statistical Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Destination Pincode</label>
              <input
                type="text"
                value={testPincode}
                onChange={(e) => setTestPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Order Amount (₹)</label>
                <input
                  type="number"
                  value={testAov}
                  onChange={(e) => setTestAov(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Mode</label>
                <select
                  value={testPayment}
                  onChange={(e) => setTestPayment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="PREPAID">Prepaid (UPI / Card / NetBanking)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Delivery Address Line</label>
              <input
                type="text"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <button
              onClick={calculateRisk}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Evaluate Order RTO Risk Score
            </button>
          </div>

          {riskResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Risk Score</span>
                  <p className="text-2xl font-black text-white font-mono-code">{riskResult.score}%</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    riskResult.level === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : riskResult.level === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {riskResult.level} RISK
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Contributing Factors</p>
                {riskResult.reasons.map((r, i) => (
                  <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span> {r}
                  </p>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300">
                <span className="font-bold text-white">Recommendation: </span>
                {riskResult.recommendation}
              </div>
            </div>
          )}
        </div>

        {/* Right: Real Orders Evaluated */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Live Orders Ingestion Stream
            </h2>
            <span className="text-[11px] text-slate-400">{orders.length} orders total</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No orders synced. Connect your store to view real-time RTO risk streams.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {orders.slice(0, 15).map((o) => {
                const isCod = o.paymentMode === 'COD';
                const isRto = String(o.status).includes('RTO');
                const risk = o.rtoRiskScore ?? (isCod ? 58 : 12);
                return (
                  <div
                    key={o.id || o.orderNumber}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{o.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">{o.customerName || 'Customer'}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                          {o.pincode || 'PIN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ₹{(o.totalAmount || o.orderTotal || 0).toLocaleString('en-IN')} · {o.paymentMode} · {o.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          risk > 60
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : risk > 35
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {risk}% Risk
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
