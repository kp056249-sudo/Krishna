import React, { useState } from 'react';
import { Store, Plus, CheckCircle2, RefreshCw, Upload, Globe, Key, ShieldCheck, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';
import { StoreAccount } from '../../types';
import { api } from '../../lib/api';
import { useAuthCompany } from '../../context/AuthCompanyContext';

interface StoreConnectorsProps {
  stores: StoreAccount[];
  onAddStore: (store: StoreAccount) => void;
}

export const StoreConnectors: React.FC<StoreConnectorsProps> = ({ stores, onAddStore }) => {
  const { refreshData } = useAuthCompany();
  const [showAddModal, setShowAddModal] = useState(false);
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce'>('shopify');
  const [storeDomain, setStoreDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [wooUrl, setWooUrl] = useState('');
  const [wooKey, setWooKey] = useState('');
  const [wooSecret, setWooSecret] = useState('');

  const [connecting, setConnecting] = useState(false);
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setError(null);

    try {
      if (platform === 'shopify') {
        const cleanDomain = storeDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const res = await api.post('/api/stores/connect/shopify', {
          shopDomain: cleanDomain,
          accessToken: accessToken.trim(),
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to authenticate with Shopify Admin API.');
        }

        const newStore: StoreAccount = {
          id: res.store?.id || `store_shop_${Date.now()}`,
          name: res.store?.name || cleanDomain,
          platform: 'shopify',
          url: `https://${cleanDomain}`,
          status: 'connected',
          lastSyncTime: 'Just now',
          dailyRevenue: 0,
          dailyOrders: 0,
          currency: res.store?.currency || 'INR',
        };

        onAddStore(newStore);
        setNotification(`Successfully connected ${newStore.name}!`);
        setShowAddModal(false);
        setStoreDomain('');
        setAccessToken('');
        await refreshData();
      } else {
        const cleanUrl = wooUrl.trim().startsWith('http') ? wooUrl.trim() : `https://${wooUrl.trim()}`;
        const res = await api.post('/api/stores/connect/woocommerce', {
          storeUrl: cleanUrl,
          consumerKey: wooKey.trim(),
          consumerSecret: wooSecret.trim(),
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to authenticate with WooCommerce API.');
        }

        const newStore: StoreAccount = {
          id: res.store?.id || `store_woo_${Date.now()}`,
          name: res.store?.name || new URL(cleanUrl).hostname,
          platform: 'woocommerce',
          url: cleanUrl,
          status: 'connected',
          lastSyncTime: 'Just now',
          dailyRevenue: 0,
          dailyOrders: 0,
          currency: 'INR',
        };

        onAddStore(newStore);
        setNotification(`Successfully connected ${newStore.name}!`);
        setShowAddModal(false);
        setWooUrl('');
        setWooKey('');
        setWooSecret('');
        await refreshData();
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  const handleManualSync = async (id: string, name: string) => {
    setSyncingStoreId(id);
    try {
      const res = await api.post(`/api/stores/${id}/sync`);
      if (res.success) {
        setNotification(`Synchronized ${res.syncedOrdersCount || 0} orders from ${name}.`);
        await refreshData();
      } else {
        setError(res.error || 'Sync failed');
      }
    } catch (e: any) {
      setError(e.message || 'Sync communication error');
    } finally {
      setSyncingStoreId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/50 px-2 py-0.5 rounded">
              Multi-Channel Ingestion
            </span>
            <span className="text-xs text-slate-400">REST &amp; Webhook HMAC Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Store Connectors &amp; Marketplace Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integrations with Shopify Admin API, WooCommerce REST API, and webhook listeners.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New Storefront</span>
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

      {error && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Connected Stores Grid */}
      {stores.length === 0 ? (
        <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Store className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Connected Storefronts</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Connect your Shopify or WooCommerce store to start synchronizing orders and customer records.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Connect Store Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-bold uppercase">
                    {s.platform}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {s.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{s.name}</h3>
                <p className="text-slate-400 text-xs font-mono mt-0.5">{s.url}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last Synced:</span>
                  <span className="text-slate-300 font-mono">{s.lastSyncTime || 'Just now'}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleManualSync(s.id, s.name)}
                    disabled={syncingStoreId === s.id}
                    className="w-full py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingStoreId === s.id ? 'animate-spin' : ''}`} />
                    <span>{syncingStoreId === s.id ? 'Synchronizing...' : 'Sync Orders'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" /> Connect E-Commerce Storefront
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectStore} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('shopify')}
                  className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                    platform === 'shopify'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Shopify
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('woocommerce')}
                  className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${
                    platform === 'woocommerce'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  WooCommerce
                </button>
              </div>

              {platform === 'shopify' ? (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Shopify Domain (*.myshopify.com)</label>
                    <input
                      type="text"
                      placeholder="your-store.myshopify.com"
                      value={storeDomain}
                      onChange={(e) => setStoreDomain(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Admin API Access Token (shpat_...)</label>
                    <input
                      type="password"
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">WooCommerce Store URL (HTTPS)</label>
                    <input
                      type="url"
                      placeholder="https://yourstore.com"
                      value={wooUrl}
                      onChange={(e) => setWooUrl(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Consumer Key (ck_...)</label>
                    <input
                      type="text"
                      placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                      value={wooKey}
                      onChange={(e) => setWooKey(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Consumer Secret (cs_...)</label>
                    <input
                      type="password"
                      placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                      value={wooSecret}
                      onChange={(e) => setWooSecret(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={connecting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{connecting ? 'Authenticating API...' : 'Verify & Connect Store'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
