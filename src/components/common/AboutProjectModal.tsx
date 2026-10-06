import React from 'react';
import { ShieldCheck, Info, Database, Cpu, CheckCircle2, AlertTriangle, Layers, X, Terminal, GitBranch, Lock } from 'lucide-react';

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutProjectModal: React.FC<AboutProjectModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs font-sans cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">About DataNexus | Architecture &amp; System Truth</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Portfolio Audit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Full-Stack E-Commerce Analytics, Logistics Intelligence &amp; Unit Economics Engine
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Executive Overview */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
              Project Statement &amp; Purpose
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              DataNexus solves a critical challenge in Indian Direct-to-Consumer (D2C) e-commerce: reconciling false top-line GMV against true cash-in-bank unit economics while minimizing Return-to-Origin (RTO) courier losses. The platform combines read-only SQL query execution, supervised logistics classification, time-series forecasting, and automated executive dispatches.
            </p>
          </div>

          {/* Real vs Sandbox Matrix */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Honest Architecture Audit: What is Real vs Sandbox
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Real & Production */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> 100% Real &amp; Functional Modules
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• <strong>10,000-Order Benchmark Dataset:</strong> Modeled after Olist / Kaggle schemas with real Indian pin-code distributions, Tier 1/2/3 COD behavior, and correlated return risks.</li>
                  <li>• <strong>Unit Economics Engine:</strong> Closed-form computation of realized profit: Realized Revenue - COGS - Forward Shipping - Gateway Fee - Packaging - RTO Reverse Logistics Loss.</li>
                  <li>• <strong>SQL Studio AST Guard:</strong> Read-only query sandbox supporting CTEs (`WITH`), window functions (`ROW_NUMBER`, `RANK`), blocking any DDL/DML mutations.</li>
                  <li>• <strong>ML Pipeline:</strong> 80/20 chronological split, Leave-One-Out target encoding, confusion matrix, precision/recall/F1/AUC.</li>
                  <li>• <strong>OLS Regression Lab:</strong> Parameter estimation with residual plots checking for homoscedasticity.</li>
                  <li>• <strong>Sales Forecast:</strong> Holt-Winters day-of-week seasonality with out-of-sample MAPE &amp; RMSE validation.</li>
                  <li>• <strong>Google Gemini AI:</strong> Live grounding on store KPIs and Natural Language to SQL translation.</li>
                </ul>
              </div>

              {/* Sandbox & Verification */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2.5">
                <span className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4" /> Sandbox &amp; Simulation Modes
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• <strong>Meta WhatsApp Dispatch:</strong> Fully formatted against Meta Cloud API v21.0 specs. Business-initiated messages run in verified sandbox mode because Meta enforces 24-hour template verification rules.</li>
                  <li>• <strong>Razorpay Payments:</strong> Tested using standard Razorpay Test Mode keys (`rzp_test_...`) with full HMAC-SHA256 signature verification.</li>
                  <li>• <strong>Shiprocket Courier Connect:</strong> Implements token authentication, auto-refresh, NDR status retry, and courier scorecard calculation.</li>
                  <li>• <strong>Role-Based Access Control:</strong> Enforces token validation, rate-limiting, and sanitized error reporting.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Database Schema & ERD */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Relational Data Model (Postgres / Supabase Schema)
            </h3>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
              <pre>{`companies (id PK, name, subscription_tier, created_at)
  └── orders (id PK, company_id FK, order_number, total_amount, payment_mode, status, city, pincode, created_at)
        └── order_items (id PK, order_id FK, sku FK, quantity, unit_price, cogs)
  └── inventory (sku PK, company_id FK, product_name, in_stock, daily_velocity, days_of_cover)
  └── couriers (id PK, company_id FK, name, type, delivery_rate, ndr_recovery_rate)
  └── ml_models (id PK, company_id FK, model_type, accuracy, precision, recall, auc, trained_at)`}</pre>
            </div>
          </div>

          {/* Tech Stack Strip */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[10px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Frontend</span>
                <span className="text-white font-bold">React 18, Vite, Tailwind CSS</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Backend</span>
                <span className="text-white font-bold">Node.js, Express, TypeScript</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Storage</span>
                <span className="text-white font-bold">Postgres (Supabase) + Firestore</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">ML &amp; Statistics</span>
                <span className="text-white font-bold">Logistic Regression, OLS, Holt-Winters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono">DataNexus Portfolio Audit · Production Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
