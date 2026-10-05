import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package, AlertTriangle, Search, Download, Upload, ChevronDown,
  ChevronUp, X, RefreshCw, TrendingDown, TrendingUp, AlertCircle,
  CheckCircle2, Info, IndianRupee, BarChart2
} from 'lucide-react';
import { api } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkuRow {
  sku: string;
  name: string;
  stock: number;
  dailyVelocity: number;
  velocityMape?: number;
  forecastRefused?: boolean;
  forecastRefusedReason?: string;
  daysOfCover: number;
  reorderPoint: number;
  abcClass: 'A' | 'B' | 'C';
  cogsPerUnit: number;
  sellingPrice: number;
  revenueL30d: number;
  adSpend: number;
  shippingCost: number;
  gatewayFees: number;
  rtoLoss: number;
  contributionMargin: number;
  contributionMarginPct: number;
  inputsMissing: boolean;
  status: 'healthy' | 'dead_stock' | 'stockout_risk' | 'low_cover';
}

interface VariantRow {
  variant: string;
  units: number;
  revenue: number;
  returns: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAbcClass(rows: SkuRow[]): SkuRow[] {
  const total = rows.reduce((s, r) => s + r.revenueL30d, 0);
  const sorted = [...rows].sort((a, b) => b.revenueL30d - a.revenueL30d);
  let cumulative = 0;
  const abcMap: Record<string, 'A' | 'B' | 'C'> = {};
  for (const row of sorted) {
    cumulative += row.revenueL30d;
    const pct = total > 0 ? cumulative / total : 0;
    if (pct <= 0.7) abcMap[row.sku] = 'A';
    else if (pct <= 0.9) abcMap[row.sku] = 'B';
    else abcMap[row.sku] = 'C';
  }
  return rows.map(r => ({ ...r, abcClass: abcMap[r.sku] || 'C' }));
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function fmtCur(n: number) {
  return '₹' + fmt(n);
}

function statusBadge(s: SkuRow['status']) {
  const map: Record<string, string> = {
    healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dead_stock: 'bg-slate-600/30 text-slate-400 border-slate-600/40',
    stockout_risk: 'bg-red-500/15 text-red-400 border-red-500/30',
    low_cover: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };
  const label: Record<string, string> = {
    healthy: 'Healthy',
    dead_stock: 'Dead Stock',
    stockout_risk: 'Stockout Risk',
    low_cover: 'Low Cover',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${map[s]}`}>
      {label[s]}
    </span>
  );
}

function abcBadge(cls: 'A' | 'B' | 'C') {
  const map = { A: 'bg-cyan-500/20 text-cyan-300', B: 'bg-blue-500/20 text-blue-300', C: 'bg-slate-500/20 text-slate-400' };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${map[cls]}`}>{cls}</span>;
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
  sku: SkuRow | null;
  onClose: () => void;
}

const SkuDrawer: React.FC<DrawerProps> = ({ sku, onClose }) => {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    api.get(`/api/sku/${encodeURIComponent(sku.sku)}/variants`)
      .then((res: any) => setVariants(res.variants || []))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [sku?.sku]);

  if (!sku) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-md bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">SKU Detail</p>
            <h3 className="text-white font-bold text-sm">{sku.name}</h3>
            <p className="text-xs text-slate-400">{sku.sku}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Contribution Breakdown */}
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Contribution Breakdown (Last 30d)</p>
            {[
              { label: 'Revenue', val: sku.revenueL30d, cls: 'text-emerald-400' },
              { label: 'COGS', val: -sku.cogsPerUnit * sku.dailyVelocity * 30, cls: 'text-red-400' },
              { label: 'Shipping', val: -sku.shippingCost, cls: 'text-amber-400' },
              { label: 'Gateway Fees', val: -sku.gatewayFees, cls: 'text-amber-400' },
              { label: 'RTO Loss', val: -sku.rtoLoss, cls: 'text-red-400' },
              { label: 'Ad Spend', val: -sku.adSpend, cls: 'text-purple-400' },
            ].map(({ label, val, cls }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className={cls}>{fmtCur(val)}</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold">
              <span className="text-white">Contribution Margin</span>
              <span className={sku.contributionMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {fmtCur(sku.contributionMargin)} ({sku.contributionMarginPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Velocity & Forecast</p>
            {sku.forecastRefused ? (
              <p className="text-amber-400 text-xs">{sku.forecastRefusedReason || 'Insufficient data for forecast'}</p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Daily Velocity</span><span className="text-white">{sku.dailyVelocity.toFixed(2)} units/day</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Forecast MAPE</span><span className="text-white">{sku.velocityMape != null ? sku.velocityMape.toFixed(1) + '%' : '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Days of Cover</span><span className={sku.daysOfCover < 7 ? 'text-red-400 font-bold' : 'text-white'}>{sku.daysOfCover.toFixed(0)}d</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Reorder Point</span><span className="text-white">{fmt(sku.reorderPoint)} units</span></div>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Variant Breakdown</p>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400"><RefreshCw className="w-3 h-3 animate-spin" /> Loading...</div>
            ) : variants.length === 0 ? (
              <p className="text-slate-500 text-xs">No variant data available</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 border-b border-slate-700">
                  <th className="pb-1 text-left">Variant</th>
                  <th className="pb-1 text-right">Units</th>
                  <th className="pb-1 text-right">Revenue</th>
                  <th className="pb-1 text-right">Returns</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {variants.map((v, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="py-1 text-left truncate max-w-[120px]">{v.variant || '—'}</td>
                      <td className="py-1 text-right">{fmt(v.units)}</td>
                      <td className="py-1 text-right">{fmtCur(v.revenue)}</td>
                      <td className="py-1 text-right text-red-400">{fmt(v.returns)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

// ─── Bulk COGS Upload Modal ────────────────────────────────────────────────────

interface CogsRow { sku: string; cogsInr: number; }
interface BulkModalProps { onClose: () => void; onSuccess: () => void; }

const BulkCogsModal: React.FC<BulkModalProps> = ({ onClose, onSuccess }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CogsRow[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split('\n').filter(Boolean);
      const parsed: CogsRow[] = [];
      const errs: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [sku, cogsRaw] = lines[i].split(',').map(s => s.trim());
        const cogs = parseFloat(cogsRaw);
        if (!sku) { errs.push(`Row ${i + 1}: SKU missing`); continue; }
        if (isNaN(cogs) || cogs <= 0) { errs.push(`Row ${i + 1}: Invalid COGS`); continue; }
        parsed.push({ sku, cogsInr: cogs });
      }
      if (errs.length > 0) { setError(errs.join('; ')); return; }
      setError('');
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/sku/cogs-bulk-upload', { updates: rows });
      setSaved(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Bulk COGS Upload</h3>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-slate-400 mb-3">Upload a CSV with columns: <code className="bg-slate-800 px-1 rounded">SKU,COGS_INR</code></p>
        <div
          className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-xs">Click to select CSV file</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={e => e.target.files?.[0] && parseFile(e.target.files[0])} />
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        {rows.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-1">{rows.length} rows parsed — preview:</p>
            <div className="bg-slate-800 rounded-lg max-h-36 overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 border-b border-slate-700"><th className="p-2 text-left">SKU</th><th className="p-2 text-right">COGS (₹)</th></tr></thead>
                <tbody>{rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-slate-700/50 text-slate-300">
                    <td className="p-2">{r.sku}</td>
                    <td className="p-2 text-right">{fmtCur(r.cogsInr)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="mt-3 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saved ? '✓ Saved!' : saving ? 'Saving...' : `Confirm & Save ${rows.length} SKUs`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<SkuRow, 'sku' | 'stock' | 'dailyVelocity' | 'daysOfCover' | 'revenueL30d' | 'contributionMargin' | 'contributionMarginPct'>;

export const SkuIntelligencePage: React.FC = () => {
  const [rows, setRows] = useState<SkuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState<'All' | 'A' | 'B' | 'C'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'healthy' | 'dead_stock' | 'stockout_risk' | 'low_cover'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('revenueL30d');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedSku, setSelectedSku] = useState<SkuRow | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/api/sku/intelligence');
      if (res.success && Array.isArray(res.data)) {
        setRows(computeAbcClass(res.data));
      } else {
        setRows([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load SKU intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let data = rows;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.sku.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }
    if (abcFilter !== 'All') data = data.filter(r => r.abcClass === abcFilter);
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter);
    return [...data].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [rows, search, abcFilter, statusFilter, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: rows.length,
    deadStock: rows.filter(r => r.status === 'dead_stock').length,
    stockoutRisk: rows.filter(r => r.status === 'stockout_risk').length,
    avgMarginPct: rows.length > 0 ? rows.reduce((s, r) => s + r.contributionMarginPct, 0) / rows.length : 0,
    inputsMissing: rows.filter(r => r.inputsMissing).length,
  }), [rows]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-0.5 opacity-60">
      {sortKey === k ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />) : <ChevronDown className="w-3 h-3 inline opacity-30" />}
    </span>
  );

  const exportCsv = () => {
    const headers = ['SKU', 'Name', 'Stock', 'Daily Velocity', 'Days of Cover', 'Reorder Point', 'ABC Class', 'COGS/Unit', 'Selling Price', 'Revenue L30d', 'Ad Spend', 'Shipping', 'Gateway Fees', 'RTO Loss', 'Contribution Margin', 'Margin %', 'Status'];
    const csvRows = [headers.join(','), ...filtered.map(r => [
      r.sku, `"${r.name}"`, r.stock, r.dailyVelocity.toFixed(2), r.daysOfCover.toFixed(0), r.reorderPoint.toFixed(0),
      r.abcClass, r.cogsPerUnit, r.sellingPrice, r.revenueL30d, r.adSpend, r.shippingCost, r.gatewayFees, r.rtoLoss,
      r.contributionMargin, r.contributionMarginPct.toFixed(1), r.status
    ].join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sku-intelligence-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" /> SKU Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time profitability, velocity & contribution margin per SKU</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Bulk COGS Upload
          </button>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Inputs Missing Banner */}
      {stats.inputsMissing > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs font-medium">
            <strong>{stats.inputsMissing} SKU{stats.inputsMissing !== 1 ? 's' : ''}</strong> are missing COGS configuration — contribution margin may be inaccurate. Use <em>Bulk COGS Upload</em> to fix.
          </p>
        </div>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total SKUs', val: stats.total, icon: Package, color: 'cyan' },
          { label: 'Dead Stock', val: stats.deadStock, icon: TrendingDown, color: 'slate' },
          { label: 'Stockout Risk', val: stats.stockoutRisk, icon: AlertTriangle, color: 'red' },
          { label: 'Avg Margin %', val: stats.avgMarginPct.toFixed(1) + '%', icon: BarChart2, color: 'emerald' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className={`w-7 h-7 rounded-lg bg-${color}-500/15 flex items-center justify-center mb-2`}>
              <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
            </div>
            <p className="text-xl font-extrabold text-white">{val}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            className="w-full bg-slate-800/70 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            placeholder="Search SKU or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={abcFilter} onChange={e => setAbcFilter(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60 cursor-pointer">
          {['All', 'A', 'B', 'C'].map(v => <option key={v} value={v}>ABC: {v}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60 cursor-pointer">
          <option value="All">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="dead_stock">Dead Stock</option>
          <option value="stockout_risk">Stockout Risk</option>
          <option value="low_cover">Low Cover</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No SKUs found</p>
            <p className="text-slate-500 text-xs mt-1">Try adjusting filters or connect your store to import inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider">
                  {[
                    { label: 'SKU', key: 'sku' },
                    { label: 'Stock', key: 'stock' },
                    { label: 'Velocity', key: 'dailyVelocity' },
                    { label: 'Days Cover', key: 'daysOfCover' },
                    { label: 'ABC', key: null },
                    { label: 'Revenue L30d', key: 'revenueL30d' },
                    { label: 'Ad Spend', key: null },
                    { label: 'CM ₹', key: 'contributionMargin' },
                    { label: 'CM %', key: 'contributionMarginPct' },
                    { label: 'Status', key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key as SortKey)}
                      className={`px-3 py-3 text-left ${key ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                    >
                      {label}{key && <SortIcon k={key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(row => (
                  <tr
                    key={row.sku}
                    onClick={() => setSelectedSku(row)}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{row.sku}</div>
                      <div className="text-slate-400 truncate max-w-[140px]">{row.name}</div>
                      {row.inputsMissing && <span className="text-amber-400 text-[9px]">⚠ Inputs missing</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-300 font-medium">{fmt(row.stock)}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-slate-300">{row.dailyVelocity.toFixed(2)}</span>
                      {row.velocityMape != null && <span className="text-slate-500 ml-1">±{row.velocityMape.toFixed(0)}%</span>}
                    </td>
                    <td className={`px-3 py-2.5 font-semibold ${row.daysOfCover < 7 ? 'text-red-400' : row.daysOfCover < 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {row.daysOfCover.toFixed(0)}d
                    </td>
                    <td className="px-3 py-2.5">{abcBadge(row.abcClass)}</td>
                    <td className="px-3 py-2.5 text-slate-300">{fmtCur(row.revenueL30d)}</td>
                    <td className="px-3 py-2.5 text-slate-400">{fmtCur(row.adSpend)}</td>
                    <td className={`px-3 py-2.5 font-bold ${row.contributionMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmtCur(row.contributionMargin)}
                    </td>
                    <td className={`px-3 py-2.5 font-bold ${row.contributionMarginPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.contributionMarginPct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      <SkuDrawer sku={selectedSku} onClose={() => setSelectedSku(null)} />

      {/* Bulk COGS Modal */}
      {showBulkModal && <BulkCogsModal onClose={() => setShowBulkModal(false)} onSuccess={load} />}
    </div>
  );
};
