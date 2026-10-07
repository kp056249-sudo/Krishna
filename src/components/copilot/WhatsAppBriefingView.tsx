import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Smartphone,
  Bell,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Flame,
  Package,
  DollarSign,
  Truck,
  TrendingUp,
  Sliders,
  Phone,
  Plus,
  Trash2,
  Users,
  Check,
  X,
  Bot,
  Sparkles,
  Terminal,
  Key
} from 'lucide-react';
import { EnterpriseKPIs, WhatsAppRecipient } from '../../types';
import { formatLakhs } from '../../utils/financialMetrics';
import { WhatsAppChatbot } from './WhatsAppChatbot';

interface WhatsAppBriefingViewProps {
  kpis: EnterpriseKPIs;
  currency: 'INR' | 'USD';
}

export const WhatsAppBriefingView: React.FC<WhatsAppBriefingViewProps> = ({ kpis, currency }) => {
  const [schedulerActive, setSchedulerActive] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);

  // Recipient Management State
  const [recipients, setRecipients] = useState<WhatsAppRecipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Founder / Executive');
  const [subBriefing, setSubBriefing] = useState(true);
  const [subStock, setSubStock] = useState(true);
  const [subRto, setSubRto] = useState(true);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [testingRecipientId, setTestingRecipientId] = useState<string | null>(null);
  const [deletingRecipientId, setDeletingRecipientId] = useState<string | null>(null);

  // Meta Gateway Configuration State
  const [gatewayConfig, setGatewayConfig] = useState<any>(null);
  const [newTokenInput, setNewTokenInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenTestStatus, setTokenTestStatus] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchRecipients();
    fetchGatewayConfig();
  }, []);

  const fetchGatewayConfig = async () => {
    try {
      const res = await api.get('/api/whatsapp/config');
      if (res.success) {
        setGatewayConfig(res);
      }
    } catch {}
  };

  const handleUpdateConfig = async () => {
    if (!newTokenInput.trim()) return;
    setIsUpdatingConfig(true);
    try {
      const res = await api.post('/api/whatsapp/config', {
        token: newTokenInput.trim(),
        founderPhone: gatewayConfig?.founderPhone || '+91 9250509070'
      });
      if (res.success) {
        setStatusMessage(`🎉 Meta WhatsApp token updated successfully!`);
        setNewTokenInput('');
        setShowConfigModal(false);
        await fetchGatewayConfig();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to update token'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdatingConfig(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleTestToken = async () => {
    setIsTestingToken(true);
    setTokenTestStatus(null);
    try {
      const res = await api.post('/api/whatsapp/config/test', {
        token: newTokenInput.trim() || undefined
      });
      setTokenTestStatus(res);
      if (res.valid) {
        setStatusMessage(`✅ Meta Token is LIVE! Connected to ${res.phone || 'WhatsApp Phone'}`);
      } else {
        setStatusMessage(`❌ Meta Token Error: ${res.error}`);
      }
    } catch (e: any) {
      setTokenTestStatus({ valid: false, error: e.message });
      setStatusMessage(`Error testing token: ${e.message}`);
    } finally {
      setIsTestingToken(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/whatsapp/logs');
      if (res.success && Array.isArray(res.logs)) {
        setDispatchLogs(res.logs.map(log => ({
          id: log.sid || log.id,
          time: log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Just now',
          status: log.status || 'QUEUED',
          type: log.templateName ? `Template: ${log.templateName}` : (log.metadata?.type || 'WhatsApp Dispatch'),
          recipient: log.to,
          deliveredItems: log.body?.substring(0, 55) + '...'
        })));
      }
    } catch (e) {
      console.error('Failed to fetch WhatsApp logs');
    }
  };

  const fetchRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      const res = await api.get('/api/whatsapp/recipients');
      if (res.success && Array.isArray(res.recipients)) {
        setRecipients(res.recipients);
      }
    } catch (e) {
      console.error('Failed to fetch WhatsApp recipients');
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const handleAddRecipient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = newPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setStatusMessage('Error: Please enter a valid 10-digit mobile number with country code (e.g., +91 9876543210).');
      return;
    }

    setIsAddingRecipient(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/whatsapp/recipients', {
        phone: newPhone.trim(),
        name: newName.trim() || 'Operations Lead',
        role: newRole,
        alerts: {
          dailyBriefing: subBriefing,
          stockAlerts: subStock,
          rtoAlerts: subRto
        }
      });

      if (res.success) {
        setStatusMessage(`🎉 Success! +${res.recipient.cleanPhone} added. Automated welcome WhatsApp message dispatched via Meta Cloud API!`);
        setNewPhone('+91 ');
        setNewName('');
        setShowAddForm(false);
        await fetchRecipients();
        await fetchLogs();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to add recipient'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Network exception while connecting Meta API'}`);
    } finally {
      setIsAddingRecipient(false);
      setTimeout(() => setStatusMessage(null), 9000);
    }
  };

  const handleRemoveRecipient = async (id: string, phone: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} (${phone}) from automated WhatsApp alerts?`)) {
      return;
    }

    setDeletingRecipientId(id);
    setStatusMessage(null);

    try {
      const res = await api.delete(`/api/whatsapp/recipients/${id}`);
      if (res.success) {
        setStatusMessage(`🗑️ Recipient ${name} (${phone}) removed from automated alerts.`);
        await fetchRecipients();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to remove recipient'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Network exception'}`);
    } finally {
      setDeletingRecipientId(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleTestPingRecipient = async (id: string, phone: string, name: string) => {
    setTestingRecipientId(id);
    setStatusMessage(null);

    try {
      const res = await api.post(`/api/whatsapp/recipients/${id}/test`);
      if (res.success) {
        setStatusMessage(`🧪 Live test ping successfully sent to ${name} (${phone}) via Meta Cloud API!`);
        await fetchLogs();
        await fetchRecipients();
      } else {
        setStatusMessage(`Error: ${res.error || res.result?.error || 'Failed to deliver ping'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Network exception'}`);
    } finally {
      setTestingRecipientId(null);
      setTimeout(() => setStatusMessage(null), 7000);
    }
  };

  // Real 8:00 AM Executive Briefing Message Preview based strictly on real store data
  const morningBriefingPreview = `🌅 *DataNexus Daily Executive Morning Briefing (08:00 AM IST)*
👤 *Recipients*: ${recipients.length > 0 ? `${recipients.map(r => r.name).slice(0, 2).join(', ')}${recipients.length > 2 ? ` +${recipients.length - 2} more` : ''}` : 'Krishna Pandey (Founder)'}
📅 *Date*: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *FINANCIALS & REVENUE (YESTERDAY)*
• Gross Invoiced GMV: ${formatLakhs(kpis.totalGmv)}
• Bank Realized Net Profit: ${formatLakhs(kpis.netProfit)} (Margin: ${kpis.profitMarginPercent}%)
• Active Storefronts: ${kpis.activeStoresCount || 0} Connected

📦 *STOCK & INVENTORY CRITICAL ALERTS*
• ${(kpis.lowStockCount || 0) > 0 ? `⚠️ ${kpis.lowStockCount} SKU(s) critically below reorder threshold` : '✅ Warehouse SKU stock coverage optimal'}
• Reorder alerts evaluated against safety stock rules.

🛡️ *RTO & LOGISTICS DEFENSE*
• Current RTO Rate: ${kpis.rtoRatePercent}% (Benchmark: < 12%)
• Audited Order Records: ${kpis.totalOrders}
• Verified Shipments: ${kpis.deliveredOrders || kpis.totalOrders} delivered

💡 *OPERATIONAL FOCUS OF THE DAY*
Maintain sub-12% RTO defense by screening unconfirmed COD consignments.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Automated 08:00 AM IST scheduled briefing for registered stakeholder devices via Meta WhatsApp Cloud API Gateway._`;

  const handleDispatchMorningNow = async () => {
    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/whatsapp/dispatch-morning-now', {});

      if (res.success) {
        setStatusMessage(`Morning 8:00 AM Briefing successfully dispatched to all active recipient devices!`);
        await fetchLogs();
        await fetchRecipients();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to dispatch morning report via Meta WhatsApp Cloud API.'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error Exception: ${err.message || 'Network exception encountered.'}`);
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMessage(null), 8000);
    }
  };

  const handleToggleScheduler = async () => {
    const nextState = !schedulerActive;
    setSchedulerActive(nextState);
    try {
      const res = await api.post('/api/whatsapp/toggle-scheduler', {
        enabled: nextState
      });
      if (res.success) {
        setStatusMessage(nextState ? 'Automated 8:00 AM daily briefing ACTIVE.' : 'Automated 8:00 AM briefing paused.');
        await fetchLogs();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to update scheduler.'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error Exception: ${err.message}`);
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Meta WhatsApp Business Gateway (v21.0)
            </span>
            <span className="text-xs text-slate-400">Executive Alert &amp; Daily Morning Reports</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <span>Automated 8:00 AM WhatsApp Dispatcher</span>
          </h1>

          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Every morning at <strong className="text-white">08:00 AM IST sharp</strong>, DataNexus compiles complete financial reports, critical stockout warnings, RTO defense stats, and courier SLAs, and dispatches directly to all registered WhatsApp numbers.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleDispatchMorningNow}
            disabled={isSending}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isSending ? 'Sending to WhatsApp...' : "Send Today's 8:00 AM Report Now"}</span>
          </button>

          <button
            onClick={handleToggleScheduler}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              schedulerActive
                ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{schedulerActive ? 'Scheduler: 08:00 AM ACTIVE' : 'Scheduler: PAUSED'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowConfigModal(!showConfigModal)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showConfigModal
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>{showConfigModal ? 'Close Gateway Config' : 'Meta Gateway Config'}</span>
          </button>
        </div>
      </div>

      {/* INLINE EXPANDABLE META GATEWAY CONFIGURATION PANEL */}
      {showConfigModal && (
        <div className="p-5 rounded-2xl bg-slate-950/95 border border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Meta WhatsApp Cloud Gateway Configuration</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">PHONE NUMBER ID</span>
              <span className="text-white font-bold">{gatewayConfig?.phoneId || '1398161436704734'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">WABA ID</span>
              <span className="text-white font-bold">{gatewayConfig?.wabaId || '2142971689587665'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOKEN STATUS</span>
              <span className={gatewayConfig?.hasToken ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {gatewayConfig?.maskedToken || 'Configured in .env'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">APPROVED TEMPLATE</span>
              <span className="text-cyan-400 font-bold">hello_world (en_US)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Paste New Meta Access Token (From developers.facebook.com &gt; WhatsApp &gt; API Setup):</span>
              <span className="text-[10px] text-amber-400 font-mono">Also automatically read from META_WHATSAPP_TOKEN in .env</span>
            </label>
            <textarea
              rows={2}
              value={newTokenInput}
              onChange={(e) => setNewTokenInput(e.target.value)}
              placeholder="Paste fresh EAAG... or EAAN... access token here"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono rounded-xl p-3 focus:border-emerald-500 outline-none"
            />
          </div>

          {tokenTestStatus && (
            <div className={`p-3 rounded-lg text-xs font-mono border ${
              tokenTestStatus.valid
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-red-950/60 border-red-800 text-red-300'
            }`}>
              {tokenTestStatus.valid ? (
                <p>✅ Meta Token is LIVE! Verified Phone: {tokenTestStatus.phone || 'Connected'} (Rating: {tokenTestStatus.qualityRating || 'GREEN'})</p>
              ) : (
                <p>❌ Meta Validation Failed: {tokenTestStatus.error} {tokenTestStatus.code ? `(Error Code: ${tokenTestStatus.code})` : ''}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              disabled={isTestingToken}
              onClick={handleTestToken}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isTestingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Test Token With Meta API</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingConfig || !newTokenInput.trim()}
                onClick={handleUpdateConfig}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingConfig ? 'Saving & Activating...' : 'Save & Activate Token'}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-lg border animate-in fade-in ${
          statusMessage.startsWith('Error') || statusMessage.startsWith('FAILED')
            ? 'bg-red-950/90 border-red-800 text-red-200'
            : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.startsWith('Error') || statusMessage.startsWith('FAILED') ? (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🤖 DATANEXUS AI CHATBOT (Multi-Key 3 Gemini Load-Balanced Chatbot)         */}
      {/* ========================================================================= */}
      <WhatsAppChatbot />

      {/* ========================================================================= */}
      {/* RECIPIENT MANAGEMENT & AUTO-MESSAGE SECTION (Add / Remove Numbers)        */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Automated WhatsApp Alert Recipients (सक्रिय अलर्ट नंबर)
              </h2>
              <span className="text-[10px] font-mono-code bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {recipients.length} Active {recipients.length === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add mobile numbers to receive automated WhatsApp executive briefings, low-stock alerts, and RTO notifications. Adding a number sends an instant activation WhatsApp message.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>+ Add WhatsApp Number (नंबर जोड़ें)</span>
              </>
            )}
          </button>
        </div>

        {/* Add Number Form (Slide down when open) */}
        {showAddForm && (
          <form
            onSubmit={handleAddRecipient}
            className="p-5 rounded-xl bg-slate-950/80 border border-emerald-800/40 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <SparklesIcon className="w-4 h-4 text-emerald-400" />
              <span>Register New WhatsApp Alert Device &amp; Send Instant Welcome Message</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Mobile Number (देश कोड के साथ नंबर) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono-code font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Format: +91 9876543210 (10 digits)</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Contact / Person Name (नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Krishna Pandey / Warehouse Manager"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Display name for notifications</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Department / Role (भूमिका)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Founder / Executive">Founder / Executive (संस्थापक)</option>
                  <option value="Head of Operations">Head of Operations (ऑपरेशंस)</option>
                  <option value="Warehouse & Inventory">Warehouse &amp; Inventory Lead</option>
                  <option value="Logistics & 3PL Manager">Logistics &amp; 3PL Manager</option>
                  <option value="Customer Experience">Customer Support / CX</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Team classification</span>
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                Automated Message Subscriptions (ऑटोमैटिक मैसेज सेटिंग्स):
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={subBriefing}
                    onChange={(e) => setSubBriefing(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span>🌅 Daily 08:00 AM Executive Briefing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={subStock}
                    onChange={(e) => setSubStock(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span>⚠️ Low Stock &amp; Stockout Warnings</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={subRto}
                    onChange={(e) => setSubRto(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span>🛡️ High-Risk COD &amp; RTO Fraud Alerts</span>
                </label>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Automatic welcome message will dispatch via Meta WhatsApp Cloud API immediately
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingRecipient}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isAddingRecipient ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Activation WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Add &amp; Send Activation Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Recipients Cards Grid */}
        <div className="space-y-3">
          {isLoadingRecipients ? (
            <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading registered WhatsApp devices...</span>
            </div>
          ) : recipients.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400">No alert numbers added yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                + Add First WhatsApp Number
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recipients.map((rec) => {
                const isTesting = testingRecipientId === rec.id;
                const isDeleting = deletingRecipientId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-3 relative group"
                  >
                    <div>
                      {/* Card Top: Name & Role */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white leading-tight">{rec.name}</h3>
                            <span className="text-[10px] text-slate-400">{rec.role || 'Executive'}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          rec.lastMessageStatus === 'SENT' || rec.lastMessageStatus === 'DELIVERED' || rec.lastMessageStatus === 'ACTIVE'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/70'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800/70'
                        }`}>
                          {rec.lastMessageStatus || 'ACTIVE'}
                        </span>
                      </div>

                      {/* Phone number */}
                      <div className="my-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs font-mono-code font-bold text-emerald-400">
                          {rec.phone}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>

                      {/* Subscriptions Pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.alerts?.dailyBriefing !== false && (
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            🌅 8 AM Briefing
                          </span>
                        )}
                        {rec.alerts?.stockAlerts !== false && (
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-amber-300 px-2 py-0.5 rounded">
                            📦 Stockout Alerts
                          </span>
                        )}
                        {rec.alerts?.rtoAlerts !== false && (
                          <span className="text-[9px] bg-slate-900 border border-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                            🛡️ RTO Fraud
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTestPingRecipient(rec.id, rec.phone, rec.name)}
                        disabled={isTesting}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        title="Send instant test message to this phone"
                      >
                        {isTesting ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                        ) : (
                          <Send className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>{isTesting ? 'Sending...' : 'Test Ping'}</span>
                      </button>

                      <button
                        onClick={() => handleRemoveRecipient(rec.id, rec.phone, rec.name)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 hover:border-red-800 text-[11px] font-bold text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove this number from automated WhatsApp alerts"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-red-400" />
                        )}
                        <span>{isDeleting ? 'Removing...' : 'Remove (हटाएं)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Dual Grid: WhatsApp Phone Mockup & Module Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: WhatsApp Message Mockup Preview (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Live WhatsApp Chat Delivery Simulation</h2>
            </div>
            <span className="text-[10px] font-mono-code text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              08:00:00 AM IST
            </span>
          </div>

          {/* WhatsApp Phone Screen Container */}
          <div className="rounded-2xl bg-[#0b141a] border border-[#202c33] p-4 text-xs font-sans shadow-2xl relative overflow-hidden">
            {/* WhatsApp Chat Header */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#202c33]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                DN
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#e9edef] text-xs">DataNexus Dispatcher</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                </div>
                <span className="text-[10px] text-[#8696a0]">Meta Cloud API Gateway (Sandbox / Live)</span>
              </div>
              <span className="text-[10px] text-[#8696a0]">08:00 AM</span>
            </div>

            {/* WhatsApp Message Bubble */}
            <div className="bg-[#005c4b] text-[#e9edef] p-3.5 rounded-xl rounded-tl-sm shadow-md whitespace-pre-wrap leading-relaxed font-mono text-[11px] select-text">
              {morningBriefingPreview}
              <div className="flex justify-end items-center gap-1 mt-2 text-[10px] text-[#8696a0]">
                <span>08:00 AM</span>
                <span className="text-emerald-300 font-bold">Template Payload</span>
              </div>
            </div>

            {/* Quick 1-Tap Trigger under preview */}
            <div className="mt-4 pt-3 border-t border-[#202c33] flex items-center justify-between">
              <span className="text-[11px] text-[#8696a0]">
                Dispatches to all {recipients.length || 1} active registered devices
              </span>
              <button
                onClick={handleDispatchMorningNow}
                disabled={isSending}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Send 8:00 AM Report Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Automated Reporting Engines & Live Logs (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Sub-engine Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Financials &amp; P&amp;L
                </span>
                <span className="text-[10px] text-emerald-400 font-mono-code">Audited</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculates daily GMV, {kpis.profitMarginPercent}% realized net margin, and unit economics deductions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-400" />
                  Stock &amp; Inventory Alerts
                </span>
                <span className="text-[10px] text-amber-400 font-mono-code">{kpis.lowStockCount || 0} Low Stock</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Flags any SKU dropping under 15 units cover so stockouts are avoided before campaigns scale.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  RTO Defense Interceptor
                </span>
                <span className="text-[10px] text-cyan-400 font-mono-code">{kpis.totalOrders > 0 ? `${kpis.totalOrders} Verified` : 'No Orders'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reports high-risk COD orders verified with 1-tap OTP and ₹50 UPI prepaid conversion coupons.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-400" />
                  3PL Courier SLAs
                </span>
                <span className="text-[10px] text-purple-400 font-mono-code">{kpis.totalOrders > 0 ? 'Live SLA Audit' : 'Connect 3PL'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tracks BlueDart, Delhivery, and Ekart delivery speeds and flags NDR re-attempt opportunities.
              </p>
            </div>
          </div>

          {/* Dispatch Logs Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Daily 8:00 AM WhatsApp Dispatch History</h3>
                <p className="text-[11px] text-slate-400">Automated delivery confirmations and webhook responses</p>
              </div>
              <span className="text-[10px] font-mono-code text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Live Audit Log
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {dispatchLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No dispatches recorded yet. Click "Send Today's 8:00 AM Report Now" or add a number to trigger automated messages.
                </div>
              ) : (
                dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.type}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-mono-code">+{log.recipient}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate max-w-sm">{log.deliveredItems}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono-code">{log.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.status === 'SENT' || log.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Sparkles icon component
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}
