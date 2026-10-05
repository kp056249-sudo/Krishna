import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  ShieldCheck,
  Zap,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  Smartphone,
  Cpu,
  Info
} from 'lucide-react';
import { api } from '../../lib/api';

interface BotStatus {
  isConfigured: boolean;
  isInitialized: boolean;
  botName: string;
  botUsername: string;
  botUrl: string;
  ownerId: string;
  mode: string;
  modelName: string;
  imageModel: string;
  activeHistoryUsers: number;
}

export const TelegramBotPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const botUrl = 'https://t.me/kp_support_2026_bot';
  const botUsername = '@kp_support_2026_bot';

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/api/telegram/status');
      if (res && res.success) {
        setStatus(res);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(botUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High quality SVG QR Code generator representation
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(botUrl)}&color=06b6d4&bgcolor=020617&margin=10`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                KP Support Bot <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Official AI</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant 24/7 Telegram Customer Assistant with Gemini 3.8 Flash & Nano Banana AI Image Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram Pe Chat Karein</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Main Hero Card with Bot Avatar, QR Code & Direct Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Bot Intro & Features */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-sky-500/30 ring-2 ring-sky-400/30 flex-shrink-0">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">KP Support Bot</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live &amp; Active
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">{botUsername}</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hamari website ka official AI customer support assistant. Ab user Telegram par seedhe baat kar sakte hain, sawaal pooch sakte hain aur <strong>AI Images bhi generate aur edit</strong> karwa sakte hain!
              </p>
            </div>
          </div>

          {/* Key Capabilities List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Smart Multilingual Chat</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hindi, Hinglish aur English me friendly aur clear jawab. Customer ki language me instant reply.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                <ImageIcon className="w-4 h-4" />
                <span>AI Image Studio &amp; Editing</span>
              </div>
              <p className="text-[11px] text-slate-400">
                <code className="text-purple-300 font-mono">/image</code> se nayi photo banayein, aur photo bhejkar background change ya edit karwayein!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Direct Owner Escalation</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customer ka message aur reply owner (ID: 8203364513) ko notify hota hai. Owner direct reply bhi kar sakta hai.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Zap className="w-4 h-4" />
                <span>Context Memory (Last 10)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Har customer ke pichle 10 messages yaad rakhta hai taaki natural conversation ho sake.
              </p>
            </div>
          </div>

          {/* Quick Copy Link Box */}
          <div className="mt-6 flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-xs text-slate-400 truncate pl-2 font-mono flex-1">{botUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right 5 cols: Scan QR Code & Live Status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* QR Code Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm mb-1">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Mobile Se Scan Karein</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Apne phone ke camera ya Telegram app se QR code scan karke direct chat shuru karein.
            </p>

            {/* QR Frame */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 relative group">
              <img
                src={qrCodeUrl}
                alt="KP Support Bot Telegram QR Code"
                className="w-48 h-48 rounded-xl object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan-500/20 pointer-events-none" />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <span className="font-mono text-cyan-400 font-bold">{botUsername}</span>
            </div>
          </div>

          {/* Bot Server & Engine Telemetry */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Bot Telemetry</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                {status?.mode || 'POLLING'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Chat AI Engine</span>
                <span className="font-mono text-white font-bold">{status?.modelName || 'gemini-3.8-flash'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Image Generation Model</span>
                <span className="font-mono text-purple-400 font-bold">{status?.imageModel || 'imagen-3.0-generate-002'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Owner Monitor ID</span>
                <span className="font-mono text-amber-400 font-bold">{status?.ownerId || '8203364513'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Image Daily Quota</span>
                <span className="text-emerald-400 font-bold">10 Images / Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commands & Usage Guide */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Telegram Commands &amp; Feature Cheatsheet</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-800/60">
                /start
              </code>
              <span className="text-[10px] text-slate-500 font-semibold">Welcome</span>
            </div>
            <p className="text-xs text-slate-300">
              Bot ko start karein. Welcome greeting aur options buttons samne aate hain.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-1 rounded border border-purple-800/60">
                /image &lt;prompt&gt;
              </code>
              <span className="text-[10px] text-purple-400 font-semibold">Nano Banana AI</span>
            </div>
            <p className="text-xs text-slate-300">
              Description dekar nayi photo generate karein (e.g. <span className="text-slate-400 italic">/image luxury sports car at night</span>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/60">
                Photo + Caption
              </code>
              <span className="text-[10px] text-emerald-400 font-semibold">AI Edit</span>
            </div>
            <p className="text-xs text-slate-300">
              Telegram me photo bhejkar caption me edit instruction likhein. AI photo ko automatically edit karke bhejega!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
