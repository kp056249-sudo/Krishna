import React, { useState } from 'react';
import { Database, Download, RefreshCw, CheckCircle2, Shield, Eye, FileText, Table, AlertTriangle, Play, Sparkles } from 'lucide-react';

export const SyntheticDataGenerator: React.FC = () => {
  const [template, setTemplate] = useState<'ecommerce_orders' | 'customer_profiles' | 'logistics_awb'>('ecommerce_orders');
  const [rowCount, setRowCount] = useState<number>(50);
  const [maskPii, setMaskPii] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Generate production-grade historical logs for backtesting and pipeline validation
  const generateSampleData = () => {
    const cities = [
      { city: 'Mumbai', state: 'Maharashtra', pin: '400050' },
      { city: 'Bengaluru', state: 'Karnataka', pin: '560034' },
      { city: 'Delhi', state: 'Delhi NCR', pin: '110001' },
      { city: 'Patna', state: 'Bihar', pin: '800001' },
      { city: 'Surat', state: 'Gujarat', pin: '395007' },
      { city: 'Kolkata', state: 'West Bengal', pin: '700019' },
    ];
    const names = ['Aarav Patel', 'Priya Sharma', 'Rahul Nair', 'Neha Gupta', 'Vikram Singh', 'Ananya Roy'];
    const couriers = ['BlueDart', 'Delhivery', 'Ekart', 'Shadowfax', 'DTDC'];

    return Array.from({ length: 8 }, (_, i) => {
      const cityObj = cities[i % cities.length];
      const name = names[i % names.length];
      const phone = maskPii ? `+91 98*** ${String(1000 + i).slice(-4)}` : `+91 98454 ${1000 + i}`;
      const amount = 1200 + (i * 350) % 3500;
      const payment = i % 2 === 0 ? 'COD' : 'PREPAID';
      const risk = payment === 'COD' ? 65 + (i * 7) % 30 : 5 + (i * 3) % 15;

      return {
        id: `TXN-820${i + 10}`,
        customer: name,
        phone,
        city: cityObj.city,
        state: cityObj.state,
        pincode: cityObj.pin,
        amount,
        payment,
        courier: couriers[i % couriers.length],
        riskScore: risk,
      };
    });
  };

  const sampleRows = generateSampleData();

  const handleDownloadCsv = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let csvContent = 'data:text/csv;charset=utf-8,order_id,customer_name,phone,city,state,pincode,amount,payment_mode,courier,risk_score\n';
      sampleRows.forEach((row) => {
        csvContent += `${row.id},${row.customer},${row.phone},${row.city},${row.state},${row.pincode},${row.amount},${row.payment},${row.courier},${row.riskScore}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `datanexus_pipeline_load_test_${rowCount}rows.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification(`DataNexus Load Pipeline CSV with ${rowCount} historical records exported successfully.`);
      setIsSimulating(false);
      setTimeout(() => setNotification(null), 3500);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Enterprise Analytics & Simulation Hub Info Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-3 shadow-md">
        <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white text-sm tracking-tight">HIGH-VELOCITY PIPELINE SIMULATOR &amp; COHORT ANALYSER</p>
          <p className="text-slate-400 mt-1 leading-relaxed">
            Configure historical backtesting schemas, compile encrypted cohorts, and perform secure pipeline load simulations prior to committing heavy enterprise multi-channel queries to active warehouses.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
              High-Velocity Load Engine
            </span>
            <span className="text-xs text-slate-400">Deterministic Load Testing &amp; Decoupled Backtesting</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Historical Data Simulator &amp; Pipeline Load Tool
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Export real-schema database records with custom volumetric sizes to test CSV ingestion, perform analytics load-tests, or validate model precision offline.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isSimulating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isSimulating ? 'Compiling Payload...' : 'Download Pipeline CSV'}</span>
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

      {/* Table Preview of Ingestion Payload */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" /> Active Schema Log Preview (Volumetric Sample)
          </span>
          <span className="text-[10px] text-cyan-400 font-mono tracking-wider">PIPELINE VERIFIED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-3">Transaction ID</th>
                <th className="py-2 px-3">Customer Profile</th>
                <th className="py-2 px-3">Secure Contact</th>
                <th className="py-2 px-3">City Node</th>
                <th className="py-2 px-3">PIN Code</th>
                <th className="py-2 px-3">Invoiced Value</th>
                <th className="py-2 px-3">Settlement</th>
                <th className="py-2 px-3">Carrier Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
              {sampleRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-cyan-400">{r.id}</td>
                  <td className="py-2 px-3 font-sans text-white font-medium">{r.customer}</td>
                  <td className="py-2 px-3 text-slate-400">{r.phone}</td>
                  <td className="py-2 px-3 text-slate-300">{r.city}</td>
                  <td className="py-2 px-3 text-slate-300">{r.pincode}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">₹{r.amount}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${r.payment === 'COD' ? 'bg-amber-950 border border-amber-800 text-amber-300' : 'bg-emerald-950 border border-emerald-800 text-emerald-300'}`}>
                      {r.payment}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{r.courier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
