import React, { useState, useEffect } from 'react';
import { LineChart, Sliders, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { api } from '../../lib/api';

export const LinearRegressionWorkspace: React.FC = () => {
  const { orders } = useAuthCompany();

  // Slope (m) and Intercept (b) for y = mx + b (predicting Profit based on Order Value in ₹)
  const [slope, setSlope] = useState<number>(0.32);
  const [intercept, setIntercept] = useState<number>(50);
  const [trainingServer, setTrainingServer] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const dataPoints = orders.length >= 5
    ? orders.slice(0, 15).map((o) => {
        const x = Math.round((o.totalAmount || o.orderTotal || 1500) / 100);
        const amount = o.totalAmount || o.orderTotal || 1500;
        const isCod = (o.paymentMode || '').toUpperCase() === 'COD';
        const isRto = ['RTO_DELIVERED', 'RTO_INITIATED', 'RTO'].includes(o.status || '');
        
        const cogs = amount * 0.35;
        const shipping = isCod ? 110 : 70;
        const packaging = 15;
        const gateway = isCod ? 0 : amount * 0.02;
        const gst = amount * 0.05;
        const rtoPenalty = isRto ? 140 : 0;
        const grossDeductions = cogs + shipping + packaging + gateway + gst + rtoPenalty;
        
        const realProfit = Math.max(-500, Math.round(amount - grossDeductions));
        const y = Math.round(realProfit / 100);
        return { x, y };
      })
    : [
        { x: 10, y: 3 },
        { x: 20, y: 7 },
        { x: 30, y: 10 },
        { x: 40, y: 14 },
        { x: 50, y: 17 },
        { x: 60, y: 21 },
        { x: 70, y: 24 },
        { x: 80, y: 28 },
      ];

  // Calculate MSE and R^2 dynamically based on user slope & intercept
  const yMean = dataPoints.reduce((acc, p) => acc + p.y, 0) / dataPoints.length;
  let ssTotal = 0;
  let ssResidual = 0;

  dataPoints.forEach((p) => {
    const yPred = (slope * p.x) + (intercept / 100);
    ssTotal += Math.pow(p.y - yMean, 2);
    ssResidual += Math.pow(p.y - yPred, 2);
  });

  const mse = Number((ssResidual / dataPoints.length).toFixed(2));
  const rmse = Number(Math.sqrt(mse).toFixed(2));
  const r2Score = Math.max(0, Math.min(0.999, 1 - (ssTotal > 0 ? ssResidual / ssTotal : 0)));

  const handleAutoFitOLS = async () => {
    setTrainingServer(true);
    // Exact OLS formula: m = Cov(X,Y)/Var(X), b = yMean - m*xMean
    const xMean = dataPoints.reduce((acc, p) => acc + p.x, 0) / dataPoints.length;
    let num = 0;
    let den = 0;
    dataPoints.forEach((p) => {
      num += (p.x - xMean) * (p.y - yMean);
      den += Math.pow(p.x - xMean, 2);
    });
    const optimalSlope = den > 0 ? num / den : 0.32;
    const optimalIntercept = yMean - optimalSlope * xMean;

    setSlope(Number(optimalSlope.toFixed(3)));
    setIntercept(Math.round(optimalIntercept * 100));

    try {
      await api.post('/api/ml/train', {
        targetColumn: 'profit_margin',
        modelType: 'LinearRegression_OLS',
      });
      setNotification(`Optimal OLS regression fitted and logged to ML Registry.`);
    } catch {
      setNotification(`Optimal OLS parameters calculated locally.`);
    } finally {
      setTrainingServer(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
              Statistical Modeling
            </span>
            <span className="text-xs text-slate-400">Ordinary Least Squares (OLS) Workspace</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Linear Regression &amp; Coefficient Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Interactive parameter testing for linear regressions on live order data points: adjust slope &amp; intercept or trigger automated OLS minimization.
          </p>
        </div>

        <button
          onClick={handleAutoFitOLS}
          disabled={trainingServer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
        >
          {trainingServer ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Auto-Fit Optimal OLS Line</span>
        </button>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono-code">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-slate-400 font-sans">Coefficient of Determination (R²)</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{(r2Score * 100).toFixed(1)}%</p>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Goodness of fit on order data</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-slate-400 font-sans">Mean Squared Error (MSE)</p>
          <p className="text-2xl font-black text-white mt-1">{mse}</p>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Average squared residual distance</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-slate-400 font-sans">RMSE Error</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{rmse}</p>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Residual standard deviation</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-slate-400 font-sans">Equation: y = mx + b</p>
          <p className="text-sm font-bold text-amber-400 mt-2">y = {slope}x + {(intercept / 100).toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Evaluated on {dataPoints.length} order points</p>
        </div>
      </div>

      {/* Sliders & Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" /> Interactive Hyper-Parameter Tuning
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Slope (m): {slope}</label>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.01"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Intercept (b): {(intercept / 100).toFixed(2)}</label>
            <input
              type="range"
              min="-500"
              max="1000"
              step="10"
              value={intercept}
              onChange={(e) => setIntercept(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
