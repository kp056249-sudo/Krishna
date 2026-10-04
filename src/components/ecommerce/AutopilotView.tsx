import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, AlertTriangle, ShieldCheck, Clock, RefreshCw, Power, Plus } from 'lucide-react';
import { useAuthCompany } from '../../context/AuthCompanyContext';
import { api } from '../../lib/api';

interface AutopilotRuleItem {
  id: string;
  title: string;
  trigger: string;
  action: string;
  active: boolean;
  dryRun?: boolean;
  stats?: string;
  actionCount?: number;
}

interface AutopilotLogItem {
  id: string;
  ruleName?: string;
  actionSummary?: string;
  targetEntity?: string;
  impactValue?: string;
  time?: string;
  timestamp?: string;
  status?: string;
}

export const AutopilotView: React.FC = () => {
  const { isVIP } = useAuthCompany();
  const [rules, setRules] = useState<AutopilotRuleItem[]>([]);
  const [logs, setLogs] = useState<AutopilotLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchAutopilotData();
  }, []);

  const fetchAutopilotData = async () => {
    setLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        api.get('/api/autopilot/rules'),
        api.get('/api/autopilot/logs'),
      ]);

      if (rulesRes.success && Array.isArray(rulesRes.rules)) {
        setRules(rulesRes.rules);
      }
      if (logsRes.success && Array.isArray(logsRes.logs)) {
        setLogs(logsRes.logs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/api/autopilot/rules/${id}`, {
        active: !currentStatus,
      });

      if (res.success) {
        setRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, active: !currentStatus } : r))
        );
        setNotification(`Rule status updated to ${!currentStatus ? 'ACTIVE' : 'PAUSED'}.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e: any) {
      setNotification(`Failed to toggle rule: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded">
              Autonomous Operations
            </span>
            <span className="text-xs text-slate-400">Zero-Human Loop Execution</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AutoPilot Intelligence Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Persistent automated triggers executed on server runtime. Automatically pauses losing ads, verifies COD orders over WhatsApp, and prevents stockouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAutopilotData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Rules Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" /> Configured Server Rules ({rules.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Loading Firestore autopilot configuration...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No autopilot rules found. Initialize company workspace to seed default defense protocols.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {rule.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rule.active
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {rule.active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{rule.title}</h3>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Trigger:</span> {rule.trigger}
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Action:</span> {rule.action}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">{rule.stats || '0 executions'}</span>

                  <button
                    onClick={() => toggleRule(rule.id, rule.active)}
                    disabled={togglingId === rule.id}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      rule.active
                        ? 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60'
                        : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{rule.active ? 'Pause Rule' : 'Activate Rule'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution Logs Stream */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Immutable Server Execution Logs
          </h2>
          <span className="text-[11px] text-slate-400">{logs.length} logged events</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No autopilot events executed yet. As real orders flow through webhooks, defense actions will be recorded here.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{l.ruleName || l.targetEntity || 'AutoPilot Rule'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{l.actionSummary || l.impactValue}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {l.time || (l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Verified')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
