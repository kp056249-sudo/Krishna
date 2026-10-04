import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, ExternalLink, Download, Lock, Zap } from 'lucide-react';
import { api } from '../../lib/api';

interface KeyConfigItem {
  id: string;
  category: 'AI & Intelligence' | 'WhatsApp Messaging' | 'Storefronts' | 'Payments & Reconciliation' | 'Logistics & 3PL' | 'Cloud & DB';
  envVar: string;
  name: string;
  description: string;
  placeholder: string;
  docUrl?: string;
  isSecret: boolean;
  statusKey?: string;
}

const keyConfigs: KeyConfigItem[] = [
  // 1. AI
  {
    id: 'gemini_key',
    category: 'AI & Intelligence',
    envVar: 'GEMINI_API_KEY',
    name: 'Google Gemini 2.5 API Key',
    description: 'Powers real server-side AI Copilot, NL-to-SQL query generation, and strategic profit roadmaps.',
    placeholder: 'AIzaSy...',
    docUrl: 'https://aistudio.google.com/app/apikey',
    isSecret: true,
    statusKey: 'gemini',
  },
  // 2. WhatsApp
  {
    id: 'twilio_sid',
    category: 'WhatsApp Messaging',
    envVar: 'TWILIO_ACCOUNT_SID',
    name: 'Twilio Account SID (Option A)',
    description: 'Account identifier for Twilio WhatsApp Business API messaging.',
    placeholder: 'AC_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://console.twilio.com',
    isSecret: true,
    statusKey: 'whatsapp',
  },
  {
    id: 'twilio_auth',
    category: 'WhatsApp Messaging',
    envVar: 'TWILIO_AUTH_TOKEN',
    name: 'Twilio Auth Token',
    description: 'Secret token used to authenticate Twilio WhatsApp API requests.',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://console.twilio.com',
    isSecret: true,
    statusKey: 'whatsapp',
  },
  {
    id: 'meta_token',
    category: 'WhatsApp Messaging',
    envVar: 'META_WHATSAPP_TOKEN',
    name: 'Meta Cloud WhatsApp Access Token (Option B)',
    description: 'Permanent System User token from Meta for Developers / WhatsApp Cloud API.',
    placeholder: 'EAAG_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://developers.facebook.com',
    isSecret: true,
    statusKey: 'whatsapp',
  },
  // 3. Storefronts
  {
    id: 'shopify_domain',
    category: 'Storefronts',
    envVar: 'SHOPIFY_STORE_DOMAIN',
    name: 'Primary Shopify Store Domain',
    description: 'Myshopify store handle for automated API queries.',
    placeholder: 'your-brand.myshopify.com',
    docUrl: 'https://shopify.dev',
    isSecret: false,
    statusKey: 'shopify',
  },
  {
    id: 'shopify_token',
    category: 'Storefronts',
    envVar: 'SHOPIFY_ACCESS_TOKEN',
    name: 'Shopify Admin API Access Token',
    description: 'Admin API token (shpat_...) generated from Shopify Custom Apps.',
    placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://shopify.dev',
    isSecret: true,
    statusKey: 'shopify',
  },
  {
    id: 'woo_url',
    category: 'Storefronts',
    envVar: 'WOOCOMMERCE_STORE_URL',
    name: 'WooCommerce Store URL',
    description: 'Base HTTPS URL of your WordPress / WooCommerce store.',
    placeholder: 'https://your-store.com',
    docUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    isSecret: false,
    statusKey: 'woocommerce',
  },
  // 4. Payments
  {
    id: 'rzp_key',
    category: 'Payments & Reconciliation',
    envVar: 'RAZORPAY_KEY_ID',
    name: 'Razorpay Key ID',
    description: 'Live or Test Key ID from Razorpay Dashboard API Keys section.',
    placeholder: 'rzp_live_xxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://dashboard.razorpay.com/app/keys',
    isSecret: false,
    statusKey: 'razorpay',
  },
  {
    id: 'rzp_secret',
    category: 'Payments & Reconciliation',
    envVar: 'RAZORPAY_KEY_SECRET',
    name: 'Razorpay Key Secret',
    description: 'Secret key for cryptographic HMAC payment signature verification and refunds.',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://dashboard.razorpay.com/app/keys',
    isSecret: true,
    statusKey: 'razorpay',
  },
  // 5. Logistics
  {
    id: 'delhivery_key',
    category: 'Logistics & 3PL',
    envVar: 'DELHIVERY_API_KEY',
    name: 'Delhivery Express API Token',
    description: 'Authentication token for Delhivery Direct Unified Logistics APIs.',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docUrl: 'https://delhivery.com',
    isSecret: true,
    statusKey: 'delhivery',
  },
  {
    id: 'shiprocket_token',
    category: 'Logistics & 3PL',
    envVar: 'SHIPROCKET_API_TOKEN',
    name: 'Shiprocket REST API Token',
    description: 'JWT Bearer token for Shiprocket NDR and courier allocation APIs.',
    placeholder: 'eyJhbGciOi...',
    docUrl: 'https://apidocs.shiprocket.in',
    isSecret: true,
    statusKey: 'shiprocket',
  },
];

export const ApiKeysConfigCenter: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnvStatus();
  }, []);

  const fetchEnvStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/env-status');
      if (res.success && res.integrations) {
        setEnvStatus(res.integrations);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'AI & Intelligence', 'WhatsApp Messaging', 'Storefronts', 'Payments & Reconciliation', 'Logistics & 3PL'];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filtered = activeCategory === 'All' 
    ? keyConfigs 
    : keyConfigs.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-700/50 px-2 py-0.5 rounded">
              Environment &amp; Key Vault
            </span>
            <span className="text-xs text-slate-400">Server Configuration Inspection</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            API Keys, WhatsApp &amp; Integration Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure external service credentials in your server environment (.env). The status below reports verified live connectivity.
          </p>
        </div>

        <button
          onClick={fetchEnvStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeCategory === c
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Keys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isConfigured = item.statusKey ? Boolean(envStatus[item.statusKey]) : false;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                    {item.envVar}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isConfigured
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    {isConfigured ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Configured
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-400" /> Not configured
                      </>
                    )}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {isConfigured ? 'Active in server runtime' : `Set ${item.envVar} in .env`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.envVar, item.id)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Environment Variable Name"
                  >
                    {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {item.docUrl && (
                    <a
                      href={item.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="API Documentation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
