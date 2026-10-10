import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sliders,
  Sparkles,
  Check,
  Copy,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export interface WhatsAppTemplateItem {
  id: string;
  name: string;
  language: 'en' | 'en_US';
  variableCount: number;
  category: 'UTILITY';
  event: string;
  description: string;
  sampleParameters: string[];
  lastTestedAt?: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED';
  lastWamid?: string;
  lastError?: string;
}

export interface TemplateEventOption {
  id: string;
  label: string;
  defaultTemplate: string;
}

export const WhatsAppTemplatesSettings: React.FC = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [events, setEvents] = useState<TemplateEventOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Runner state
  const [testingTemplateId, setTestingTemplateId] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('+91 98454 30129');
  const [testParams, setTestParams] = useState<Record<string, string[]>>({});
  const [copiedWamid, setCopiedWamid] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/whatsapp/templates');
      if (res.success) {
        setTemplates(res.templates || []);
        setEvents(res.events || []);

        // Initialize test params with default samples
        const initialParams: Record<string, string[]> = {};
        (res.templates || []).forEach((t: WhatsAppTemplateItem) => {
          initialParams[t.id] = [...(t.sampleParameters || [])];
        });
        setTestParams(initialParams);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed to load templates: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventChange = (templateId: string, newEvent: string) => {
    setTemplates(prev =>
      prev.map(t => (t.id === templateId ? { ...t, event: newEvent } : t))
    );
  };

  const handleParamChange = (templateId: string, paramIndex: number, val: string) => {
    setTestParams(prev => {
      const current = [...(prev[templateId] || [])];
      current[paramIndex] = val;
      return { ...prev, [templateId]: current };
    });
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.post('/api/whatsapp/templates/save', { templates });
      if (res.success) {
        setStatusMessage({ type: 'success', text: '🎉 WhatsApp Templates configuration saved in Firestore successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save configuration' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleTestDispatch = async (template: WhatsAppTemplateItem) => {
    setTestingTemplateId(template.id);
    setStatusMessage(null);
    try {
      const paramsToSend = testParams[template.id] || template.sampleParameters || [];
      const res = await api.post('/api/whatsapp/templates/test', {
        templateName: template.name,
        recipientPhone: testPhone,
        parameters: paramsToSend
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `✅ Template "${template.name}" delivered! WAMID: ${res.wamid || res.sid}`
        });

        // Update local state test result
        setTemplates(prev =>
          prev.map(t =>
            t.id === template.id
              ? {
                  ...t,
                  lastTestedAt: new Date().toISOString(),
                  lastTestStatus: 'SUCCESS',
                  lastWamid: res.wamid || res.sid,
                  lastError: undefined
                }
              : t
          )
        );
      } else {
        setStatusMessage({
          type: 'error',
          text: `❌ Meta API Dispatch Error: ${res.error || 'Failed to deliver template'}`
        });

        setTemplates(prev =>
          prev.map(t =>
            t.id === template.id
              ? {
                  ...t,
                  lastTestedAt: new Date().toISOString(),
                  lastTestStatus: 'FAILED',
                  lastError: res.error
                }
              : t
          )
        );
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setTestingTemplateId(null);
    }
  };

  const handleCopyWamid = (wamid: string) => {
    navigator.clipboard.writeText(wamid);
    setCopiedWamid(wamid);
    setTimeout(() => setCopiedWamid(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Gateway Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Meta Cloud WhatsApp Gateway Active (v21.0)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Verified Business: Datanexus</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <span>Meta Approved WhatsApp Templates Registry</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Configure event mapping, language codes, and variable counts for all official Meta approved templates. All changes persist in Firestore.
          </p>
        </div>

        {/* Global Action & Test Recipient */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-500 text-[11px]">Test Recipient:</span>
            <input
              type="text"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="+91 98XXXXXXXX"
              className="bg-transparent font-mono text-slate-800 dark:text-slate-200 focus:outline-none w-32"
            />
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveConfig}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Save Configuration in Firestore</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-lg border animate-in fade-in ${
            statusMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Templates Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Approved Templates ({templates.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Note: <code className="text-amber-600 dark:text-amber-400 font-mono">data_</code> is restricted (Marketing) and omitted.
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
            <span>Loading approved Meta templates from registry...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {templates.map(tmpl => {
              const currentParams = testParams[tmpl.id] || tmpl.sampleParameters || [];
              const isTesting = testingTemplateId === tmpl.id;

              return (
                <div key={tmpl.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Template Info & Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                        {tmpl.name.startsWith('_') ? '_' : tmpl.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{tmpl.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                            {tmpl.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                            Lang: {tmpl.language}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tmpl.variableCount} Variable{tmpl.variableCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tmpl.description}</p>
                      </div>
                    </div>

                    {/* Event Mapping Selector & Test Button */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Event:</span>
                        <select
                          value={tmpl.event}
                          onChange={e => handleEventChange(tmpl.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-2.5 py-1.5 focus:border-emerald-500 outline-none"
                        >
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id}>
                              {ev.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={isTesting}
                        onClick={() => handleTestDispatch(tmpl)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isTesting ? 'Sending...' : 'Test Send'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Variables Inputs (if template has parameters) */}
                  {tmpl.variableCount > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Template Variables ({'{{1}}'} to {'{{' + tmpl.variableCount + '}}'}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {Array.from({ length: tmpl.variableCount }).map((_, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs font-mono">
                            <span className="text-slate-400 text-[10px] w-7 flex-shrink-0">
                              {`{{${idx + 1}}}`}:
                            </span>
                            <input
                              type="text"
                              value={currentParams[idx] || ''}
                              onChange={e => handleParamChange(tmpl.id, idx, e.target.value)}
                              placeholder={`Value ${idx + 1}`}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-[11px] rounded-lg px-2 py-1 focus:border-emerald-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Test Result Display */}
                  {tmpl.lastTestedAt && (
                    <div className="flex items-center gap-3 text-[11px] font-mono pt-1 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Last Tested: {new Date(tmpl.lastTestedAt).toLocaleTimeString('en-IN')}</span>
                      </span>

                      {tmpl.lastTestStatus === 'SUCCESS' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered</span>
                          {tmpl.lastWamid && (
                            <button
                              type="button"
                              onClick={() => handleCopyWamid(tmpl.lastWamid!)}
                              className="ml-1 text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 underline cursor-pointer"
                              title="Click to copy WAMID"
                            >
                              <span>({tmpl.lastWamid.substring(0, 18)}...)</span>
                              {copiedWamid === tmpl.lastWamid ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          )}
                        </span>
                      ) : (
                        <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Failed: {tmpl.lastError}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
