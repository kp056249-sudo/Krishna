import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle2, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  inStock: number;
  dailyVelocity: number;
  daysOfRunway: number;
  status: 'healthy' | 'low_stock' | 'critical' | 'dead_stock';
  warehouse?: string;
}

export const InventoryForecast: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/inventory');
      if (res.success && Array.isArray(res.items)) {
        setItems(res.items);
      } else {
        setItems([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncInventory = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/api/inventory/sync');
      if (res.success) {
        setAlert(res.message || 'Inventory levels synchronized successfully!');
        await fetchInventory();
        setTimeout(() => setAlert(null), 3500);
      } else {
        setError(res.error || 'Inventory sync failed');
      }
    } catch (e: any) {
      setError(e.message || 'Sync communication error');
    } finally {
      setSyncing(false);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
              Warehouse &amp; Stock Intelligence
            </span>
            <span className="text-xs text-slate-400">Runout Velocity Modeling</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AI Inventory Runway &amp; Stockout Defense
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time SKU burn-rates calculated against trailing order velocity. Prevents capital lockup in dead-stock and stockout revenue leaks.
          </p>
        </div>

        <button
          onClick={handleSyncInventory}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Warehouses...' : 'Sync Inventory Levels'}</span>
        </button>
      </div>

      {alert && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading live SKU inventory from connected warehouses...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3 max-w-xl mx-auto my-8">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Inventory SKUs Tracked</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect your Shopify or WooCommerce store to automatically import products, variants, and warehouse inventory levels.
          </p>
          <button
            onClick={handleSyncInventory}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Trigger Warehouse Ingestion
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Live SKU Coverage &amp; Runway</h2>
          <div className="divide-y divide-slate-800">
            {items.map((it) => (
              <div key={it.id || it.sku} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{it.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono-code">{it.sku} · {it.warehouse || 'Central Hub'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{it.inStock} In Stock</p>
                  <p className="text-[11px] text-cyan-400">{it.daysOfRunway} Days Runway</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
