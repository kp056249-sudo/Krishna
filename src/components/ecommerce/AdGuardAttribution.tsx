import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Zap, AlertTriangle, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface CampaignData {
  id: string;
  name: string;
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  status: string;
}

export const AdGuardAttribution: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/ads/campaigns');
      if (res.success) {
        setConnected(Boolean(res.connected));
        setCampaigns(res.campaigns || []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch ad campaigns');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              AdGuard ROAS &amp; Attribution
            </span>
            <span className="text-xs text-slate-400">Server-Side Pixel Auditing</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AdGuard Multi-Touch Attribution &amp; Budget Sentinel
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Eliminates ad spend bleeding by validating Meta and Google Ads claims against actual delivered bank revenue.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Auditing Meta &amp; Google Ads attribution pipelines...</p>
        </div>
      ) : !connected || campaigns.length === 0 ? (
        <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto my-8">
          <Target className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Connect Your Ad Accounts</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect your Meta Marketing API or Google Ads account in API Keys &amp; Integrations to enable real-time ROAS bleed tracking, automated ad set pauses, and click fraud interception.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              META_ACCESS_TOKEN
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              GOOGLE_ADS_DEV_TOKEN
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Live Ad Campaigns</h2>
          <div className="divide-y divide-slate-800">
            {campaigns.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono-code">{c.platform} · {c.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{c.roas}x ROAS</p>
                  <p className="text-[11px] text-slate-400">Spend: ₹{c.spend.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
