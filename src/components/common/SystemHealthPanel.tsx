import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  MessageSquare, 
  Zap, 
  RefreshCw,
  Server,
  Activity,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { api } from '../../lib/api';

interface HealthCheck {
  status: 'OK' | 'MISSING' | 'ERROR';
  message: string;
}

interface SystemHealthData {
  success: boolean;
  auth: string;
  firestore: string;
  gemini: HealthCheck;
  whatsapp: HealthCheck;
  razorpay: HealthCheck;
  timestamp: string;
}

const StatusIcon = ({ status }: { status: string | HealthCheck }) => {
  const s = typeof status === 'string' ? status : status.status;
  if (s === 'OK') return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
  if (s === 'MISSING') return <AlertCircle className="w-4 h-4 text-amber-400" />;
  return <ShieldAlert className="w-4 h-4 text-red-400" />;
};

const StatusBadge = ({ status }: { status: string | HealthCheck }) => {
  const s = typeof status === 'string' ? status : status.status;
  const colors = {
    'OK': 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    'MISSING': 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    'ERROR': 'bg-red-950/60 text-red-400 border-red-800/50'
  };
  const color = colors[s as keyof typeof colors] || colors.ERROR;
  
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${color}`}>
      {s}
    </span>
  );
};

export const SystemHealthPanel: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/system/health');
      if (res.success) {
        setHealth(res as SystemHealthData);
      } else {
        setError(res.error || 'Failed to fetch system health');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>System Connectivity & Integrity Health</span>
        </h3>
        <button 
          onClick={fetchHealth}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/50 text-[11px] text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Auth Check */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">Firebase Auth</span>
          </div>
          <StatusBadge status={health?.auth || 'ERROR'} />
        </div>

        {/* Firestore Check */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">Firestore DB</span>
          </div>
          <StatusBadge status={health?.firestore || 'ERROR'} />
        </div>

        {/* Gemini Check */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">Gemini AI Engine</span>
            </div>
            <StatusBadge status={health?.gemini || 'ERROR'} />
          </div>
          {health?.gemini?.message && (
            <p className="text-[10px] text-slate-500 italic pl-6.5">{health.gemini.message}</p>
          )}
        </div>

        {/* WhatsApp Check */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">WhatsApp Gateway</span>
            </div>
            <StatusBadge status={health?.whatsapp || 'ERROR'} />
          </div>
          {health?.whatsapp?.message && (
            <p className="text-[10px] text-slate-500 italic pl-6.5">{health.whatsapp.message}</p>
          )}
        </div>

        {/* Razorpay Check */}
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">Razorpay Billing</span>
            </div>
            <StatusBadge status={health?.razorpay || 'ERROR'} />
          </div>
          {health?.razorpay?.message && (
            <p className="text-[10px] text-slate-500 italic pl-6.5">{health.razorpay.message}</p>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/50">
        <span>Last Scan: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}</span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Cloud Monitoring Active
        </span>
      </div>
    </div>
  );
};
