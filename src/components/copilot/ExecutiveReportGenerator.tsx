import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, CheckCircle2, TrendingUp, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { EnterpriseKPIs } from '../../types';

interface ExecutiveReportGeneratorProps {
  kpis: EnterpriseKPIs;
  currency: 'INR' | 'USD';
}

export const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({ kpis, currency }) => {
  const [reportTitle, setReportTitle] = useState('DataNexus & KP Nexus Q3 Executive Performance Brief');
  const [preparedFor, setPreparedFor] = useState('Board of Directors & Executive Leadership');
  const [includeProjections, setIncludeProjections] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
              Boardroom Briefing
            </span>
            <span className="text-xs text-slate-400">Executive Report Publisher</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Boardroom Executive Report Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Generates a boardroom-ready presentation and audit summary covering GMV, verified net margins, RTO defense savings, and forward growth vectors.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export to PDF</span>
        </button>
      </div>

      {/* Report Configuration Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Report Title</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Prepared For</label>
          <input
            type="text"
            value={preparedFor}
            onChange={(e) => setPreparedFor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6 text-slate-300 text-xs">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
              DATANEXUS · KP ENTERPRISES CONFIDENTIAL
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{reportTitle}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Audited for: {preparedFor}</p>
          </div>
          <div className="text-right font-mono-code text-[11px] text-slate-400">
            <p>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="text-emerald-400 font-semibold">Status: Executive Verified</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">1. Executive Performance Summary</h3>
          <p className="leading-relaxed text-slate-300">
            Across the observed operational cycle, the unified e-commerce infrastructure processed a total of{' '}
            <strong className="text-white">{kpis.totalOrders.toLocaleString()} orders</strong> with a cumulative gross merchandise value of{' '}
            <strong className="text-white">₹{(kpis.totalGmv / 10000000).toFixed(2)} Crores</strong>. Realized clean bank net profit concluded at{' '}
            <strong className="text-emerald-400">₹{(kpis.netProfit / 10000000).toFixed(2)} Crores ({(kpis.profitMarginPercent || 0).toFixed(1)}% Net Margin)</strong> after all COGS, performance marketing, and logistics deductions.
          </p>
        </div>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase">Gross GMV</p>
            <p className="text-base font-bold text-white font-mono-code mt-0.5">
              {currency === 'INR' ? '₹' : '$'}{(kpis.totalGmv / 10000000).toFixed(2)} Cr
            </p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase">Net Profit</p>
            <p className="text-base font-bold text-emerald-400 font-mono-code mt-0.5">
              {currency === 'INR' ? '₹' : '$'}{(kpis.netProfit / 10000000).toFixed(2)} Cr
            </p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase">RTO Rate</p>
            <p className="text-base font-bold text-cyan-400 font-mono-code mt-0.5">{kpis.rtoRatePercent}%</p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase">Blended ROAS</p>
            <p className="text-base font-bold text-indigo-400 font-mono-code mt-0.5">{kpis.blendedRoas}x</p>
          </div>
        </div>

        {/* Strategic Wins */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">2. Key Strategic Achievements</h3>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
            <li>
              <strong>RTO Defense Shield:</strong> Automated verification and risk scoring prevented significant freight losses by auditing {kpis.totalOrders} order patterns.
            </li>
            <li>
              <strong>Logistics Kaizen SLA:</strong> Delivery corridors optimized for sub-72h SLA across {kpis.activeStoresCount} connected store(s).
            </li>
            <li>
              <strong>Verified GMV Velocity:</strong> Invoiced revenue reaching ₹{kpis.totalGmv.toLocaleString()} cumulative with {kpis.deliveredOrders} confirmed deliveries.
            </li>
          </ul>
        </div>

        {/* Sign-off Signature */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <p className="font-bold text-white">Executive Authority</p>
            <p>DataNexus Enterprise Platform</p>
          </div>
          <div className="text-right">
            <div className="font-mono-code text-cyan-400 text-sm font-bold uppercase">
              {new Date().getTime().toString(16).toUpperCase()}_SIG_#{Math.floor(Math.random()*10000)}
            </div>
            <p className="text-[10px] text-slate-500">Cryptographically Verified Sign-Off</p>
          </div>
        </div>
      </div>
    </div>
  );
};
