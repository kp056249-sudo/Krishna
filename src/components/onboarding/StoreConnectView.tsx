import React, { useState } from 'react';
import { Store, Upload, Key, ShieldCheck, CheckCircle2, RefreshCw, AlertTriangle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { IntegrationStatusBadge } from '../common/IntegrationStatusBadge';
import { NavigationTab } from '../../types';

import { api } from '../../lib/api';

interface StoreConnectViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const StoreConnectView: React.FC<StoreConnectViewProps> = ({ onNavigate }) => {
  const { stores, refreshData, integrationStatus, company } = useAuthCompany();

  const [activePlatform, setActivePlatform] = useState<'shopify' | 'woocommerce' | 'custom_api' | 'file_import'>('shopify');
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      let res;
      if (activePlatform === 'shopify') {
        const cleanDomain = storeUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
        res = await api.post('/api/stores/connect/shopify', {
          shopDomain: cleanDomain,
          accessToken: accessToken.trim(),
        });
      } else {
        const cleanUrl = storeUrl.trim().startsWith('http') ? storeUrl.trim() : `https://${storeUrl.trim()}`;
        res = await api.post('/api/stores/connect/woocommerce', {
          storeUrl: cleanUrl,
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        });
      }

      if (res.success && res.store) {
        setNotification({ type: 'success', message: `Store "${res.store.name}" connected and verified successfully!` });
        setStoreName('');
        setStoreUrl('');
        setAccessToken('');
        setConsumerKey('');
        setConsumerSecret('');
        await refreshData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to connect store.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Connection error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSync = async (storeId: string) => {
    try {
      const res = await api.post(`/api/stores/${storeId}/sync`);
      if (res.success) {
        setNotification({ type: 'success', message: `Synchronized ${res.syncedOrdersCount || 0} orders successfully.` });
        await refreshData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Sync failed.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Sync failed.' });
    }
  };

  const handleDisconnect = async (storeId: string) => {
    if (!confirm('Are you sure you want to disconnect this store?')) return;
    try {
      const res = await api.delete(`/api/stores/${storeId}`);
      if (res.success) {
        setNotification({ type: 'success', message: 'Store disconnected.' });
        await refreshData();
      } else {
        setNotification({ type: 'error', message: res.error || 'Disconnect failed.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Disconnect failed.' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
              Store Integration Gateway
            </span>
            <span className="text-xs text-slate-400">2,420 TPS High-Throughput Sync</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Connect Your Storefronts
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Link Shopify GraphQL, WooCommerce REST, or upload CSV transaction batches. All API keys remain encrypted on the server.
          </p>
        </div>

        {stores.length > 0 && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Integration Environment Status Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium mr-1">Backend Connectivity Status:</span>
          <IntegrationStatusBadge
            isConfigured={Boolean(integrationStatus?.shopify?.configured)}
            serviceName="Shopify API"
            envVarName="SHOPIFY_CLIENT_ID / SHOPIFY_ACCESS_TOKEN"
          />
          <IntegrationStatusBadge
            isConfigured={Boolean(integrationStatus?.gemini?.configured)}
            serviceName="Gemini 2.5 AI"
            envVarName="GEMINI_API_KEY"
          />
          <IntegrationStatusBadge
            isConfigured={Boolean(integrationStatus?.whatsappMeta?.configured || integrationStatus?.whatsappTwilio?.configured)}
            serviceName="WhatsApp"
            envVarName="WHATSAPP_ACCESS_TOKEN"
          />
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-lg ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/90 border border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Connected Stores Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Active Connected Stores</h2>
            <p className="text-[11px] text-slate-400">All connected stores automatically feed your orders, profit, and RTO dashboards</p>
          </div>
          <span className="text-xs font-bold text-cyan-400 font-mono-code">{stores.length} Connected</span>
        </div>

        {stores.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
            <Store className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs font-semibold text-white">No stores connected to your company workspace yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Use the form below to connect your Shopify store or import an order CSV file.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                      {s.platform}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-mono-code truncate">{s.storeUrl}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={() => handleManualSync(s.id)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Now</span>
                  </button>

                  <button
                    onClick={() => handleDisconnect(s.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect New Store Form */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Link New Storefront
          </h2>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['shopify', 'woocommerce', 'custom_api'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlatform(p)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors capitalize ${
                  activePlatform === p ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'shopify' ? 'Shopify' : p === 'woocommerce' ? 'WooCommerce' : 'Custom REST'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleConnectStore} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Storefront Display Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. KP Apparel Official"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                {activePlatform === 'shopify' ? 'Shopify Store Domain' : 'Store Website URL'}
              </label>
              <input
                type="text"
                required
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder={activePlatform === 'shopify' ? 'your-brand.myshopify.com' : 'https://yourbrand.com'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {activePlatform === 'shopify' && (
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Admin API Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Generated from Shopify Admin &gt; Settings &gt; Apps &gt; Develop apps. Configurable on server via <code className="text-cyan-400">SHOPIFY_ACCESS_TOKEN</code>.
              </p>
            </div>
          )}

          {activePlatform === 'woocommerce' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Consumer Key</label>
                <input
                  type="password"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Consumer Secret</label>
                <input
                  type="password"
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono-code focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{submitting ? 'Connecting & Verifying...' : 'Verify Connection & Start Sync'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Or File Ingest Quick Option */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-white text-sm">Have a CSV or Excel export?</h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            You can also upload transaction datasets in the Datasets &amp; Upload studio to run complete RTO &amp; P&amp;L analysis.
          </p>
        </div>
        <button
          onClick={() => onNavigate('datasets')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload CSV File</span>
        </button>
      </div>
    </div>
  );
};
