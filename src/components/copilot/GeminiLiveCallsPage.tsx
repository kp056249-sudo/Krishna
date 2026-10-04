import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ShieldCheck,
  Package,
  Truck,
  DollarSign,
  Clock,
  RefreshCw,
  Send,
  CheckCircle2,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface GeminiCallLog {
  id?: string;
  transcript: string;
  spokenResponse: string;
  actions: string[];
  timestamp: string;
  keyIndex?: number;
}

export const GeminiLiveCallsPage: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [typedCommand, setTypedCommand] = useState('');
  const [lastAiResponse, setLastAiResponse] = useState<string | null>(null);
  const [lastActionsExecuted, setLastActionsExecuted] = useState<any[]>([]);

  const [callLogs, setCallLogs] = useState<GeminiCallLog[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchTelemetry();
    fetchLogs();

    return () => {
      stopSpeechRecognition();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await api.get('/api/gemini-calls/telemetry');
      if (res.success && res.telemetry) {
        setTelemetry(res.telemetry);
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/gemini-calls/logs');
      if (res.success && Array.isArray(res.logs)) {
        setCallLogs(res.logs);
      }
    } catch {
      // Non-blocking
    }
  };

  // Speech Recognition Setup (Web Speech API)
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Default to Hinglish / Indian English / Hindi

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) setCurrentTranscript(interim);

      if (final && final.trim().length > 2) {
        setCurrentTranscript(final);
        handleSendVoiceCommand(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isCallActive && !isMuted) {
        try {
          recognition.start();
        } catch {
          // Restart if still in call
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  };

  const startSpeechRecognition = () => {
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn('Failed to start speech recognition');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  // Speak AI response through speech synthesis
  const speakText = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Call
  const handleStartCall = () => {
    setIsCallActive(true);
    setStatusMessage('🔴 Live Gemini Call connected! You are now live with your Autonomous Chief of Staff.');
    startSpeechRecognition();

    // Welcome greeting
    const greeting = 'Namaste Founder! DataNexus Gemini Live Calls active hai. Main pure store ka autonomous control le raha hoon. Aap jo bhi bolein, main website par live execute kar doonga.';
    setLastAiResponse(greeting);
    speakText(greeting);
  };

  // End Call
  const handleEndCall = () => {
    setIsCallActive(false);
    stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentTranscript('');
    setStatusMessage('Gemini Live Call disconnected.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Send voice / typed command to Gemini Calls Engine
  const handleSendVoiceCommand = async (commandText: string) => {
    if (!commandText || !commandText.trim()) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/gemini-calls/voice-command', {
        transcript: commandText,
        autoExecute: true
      });

      if (res.success) {
        setLastAiResponse(res.spokenResponse);
        setLastActionsExecuted(res.actionsExecuted || []);
        setCurrentTranscript('');
        setTypedCommand('');

        if (audioEnabled) {
          speakText(res.spokenResponse);
        }

        await fetchLogs();
        await fetchTelemetry();
      } else {
        setStatusMessage(`Error: ${res.error || 'Failed to process live call command'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Call processing error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick 1-Tap Website Function Execution
  const handleTriggerQuickAction = async (actionName: string) => {
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/gemini-calls/live-action', {
        actionName
      });

      if (res.success && res.result) {
        setLastActionsExecuted([res.result]);
        setLastAiResponse(res.result.summary);

        if (audioEnabled && isCallActive) {
          speakText(res.result.summary);
        }

        setStatusMessage(`✅ ${res.result.title} executed successfully!`);
        await fetchLogs();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-150">
      {/* Top Banner & Multiplied Quota Indicator */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-900/80 border border-indigo-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`} />
              {isCallActive ? 'LIVE GEMINI CALL ACTIVE' : 'GEMINI CALLS AGENT READY'}
            </span>
            <span className="text-xs text-slate-400">Autonomous Website Voice Operations</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-indigo-400" />
            <span>Gemini Live Calls Autonomous Deck</span>
          </h1>

          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            This dedicated AI page executes <strong className="text-white">real-time autonomous voice calls and function operations</strong> across your entire website: P&amp;L auditing, RTO OTP verification, inventory stockout defense, courier SLAs, and WhatsApp dispatches.
          </p>
        </div>

        {/* Dual Keys Multiplier Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-700/60 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">
                Dual Keys Multiplier (2x Limit)
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono-code">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                2 Keys Rotated &amp; Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-lg border animate-in fade-in ${
          statusMessage.startsWith('Error')
            ? 'bg-red-950/90 border-red-800 text-red-200'
            : 'bg-indigo-950/90 border-indigo-600/60 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HERO LIVE CALL CONSOLE (Interactive Audio Station)                        */}
      {/* ========================================================================= */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
          isCallActive ? 'bg-indigo-600/20 opacity-100' : 'bg-slate-800/10 opacity-40'
        }`} />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Animated Waveform Visualizer */}
          <div className="relative flex items-center justify-center">
            <div className={`w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              isCallActive
                ? 'border-emerald-500/80 bg-emerald-950/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse'
                : 'border-indigo-800/50 bg-slate-950 shadow-inner'
            }`}>
              <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                isCallActive ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' : 'bg-slate-900'
              }`}>
                {isCallActive ? (
                  <PhoneCall className="w-12 h-12 text-white animate-bounce" />
                ) : (
                  <PhoneOff className="w-10 h-10 text-slate-500" />
                )}
              </div>
            </div>

            {/* Pulsing frequency rings when active */}
            {isCallActive && (
              <>
                <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
                <div className="absolute -inset-4 rounded-full border border-teal-500/20 animate-pulse pointer-events-none" />
              </>
            )}
          </div>

          {/* Call Status Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono-code">
                {isCallActive
                  ? isSpeaking
                    ? 'AI IS SPEAKING OVER CALL...'
                    : isListening
                    ? 'LISTENING TO YOUR VOICE...'
                    : 'CALL CONNECTED · STANDBY'
                  : 'CALL DISCONNECTED · READY TO DIAL'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">
              {isCallActive ? 'Gemini Live Operational Call Active' : 'Start Live Gemini Voice Operations Call'}
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Speak naturally in Hindi or English (e.g. &quot;Pura store sync karke RTO check karo&quot;, &quot;WhatsApp par briefing bhej do&quot;). Gemini Call agent will speak back and trigger actions automatically.
            </p>
          </div>

          {/* Audio Wave Bars Simulation when speaking or listening */}
          {isCallActive && (
            <div className="flex items-center gap-1.5 h-8">
              {[40, 70, 95, 60, 85, 100, 75, 50, 90, 65, 80, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-emerald-400/90 transition-all duration-150 animate-pulse"
                  style={{
                    height: `${isSpeaking || isListening ? h : 20}%`,
                    animationDelay: `${i * 70}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Call Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isCallActive ? (
              <button
                onClick={handleStartCall}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Start Live Gemini Call (लाइव कॉल शुरू करें)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Live Call (कॉल काटें)</span>
                </button>

                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (next) stopSpeechRecognition();
                    else startSpeechRecognition();
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    isMuted
                      ? 'bg-amber-950 border-amber-800 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? 'Muted' : 'Mic Active'}</span>
                </button>

                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    audioEnabled
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                  <span>{audioEnabled ? 'Voice Output ON' : 'Voice Output Muted'}</span>
                </button>
              </>
            )}
          </div>

          {/* Spoken / Recognized Audio Transcript Box */}
          <div className="w-full text-left space-y-3 pt-2">
            {currentTranscript && (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-800/60 text-xs font-mono-code text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Heard: &quot;{currentTranscript}&quot;</span>
              </div>
            )}

            {lastAiResponse && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/60 border border-indigo-800/60 text-xs text-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Gemini Spoken Response:
                  </span>
                  <span className="text-[10px] text-slate-400">Gemini 2.5 Flash</span>
                </div>
                <p className="leading-relaxed font-sans text-white text-xs">{lastAiResponse}</p>
              </div>
            )}

            {/* Fallback Command Input for Silent Environments */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (typedCommand.trim()) {
                  handleSendVoiceCommand(typedCommand.trim());
                }
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                placeholder="Or type a voice command (e.g. 'Audit RTO orders and send WhatsApp briefing')..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isProcessing || !typedCommand.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Run</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6 AUTONOMOUS WEBSITE TOOLS (Live 1-Tap Trigger Suite)                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Autonomous Website Operations Suite</span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger any of these tools on-demand or speak to Gemini Call agent to execute them automatically.
            </p>
          </div>
          <span className="text-[10px] font-mono-code bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
            Full Store Access
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: P&L Audit */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  P&amp;L Engine
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Audit Net Profit &amp; GMV</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculates total invoiced revenue, 28% net profit margin, and payment gateway deductions.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('AUDIT_STORE_PL')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Run Financial Audit</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>

          {/* Action 2: RTO COD Interceptor */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                  RTO Defense
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Intercept High-Risk COD</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Screens pending COD consignments, runs logistic regression scoring, and triggers 1-tap OTPs.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('INTERCEPT_HIGH_RISK_RTO')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Scan &amp; Intercept COD</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          {/* Action 3: WhatsApp 8 AM Briefing */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  Meta v21.0
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Dispatch WhatsApp Briefing</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dispatches executive 8:00 AM summary to all registered recipient devices on WhatsApp.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('DISPATCH_WHATSAPP_BRIEFING')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Dispatch Briefing Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Action 4: Inventory Stockouts */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                  <Package className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                  Inventory Shield
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Audit Stockouts &amp; Runway</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scans all warehouse SKUs for &lt;15 days cover and drafts automated replenishment POs.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('AUDIT_INVENTORY_STOCKOUTS')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Scan Inventory Runway</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Action 5: Courier SLAs */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Truck className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded">
                  3PL Telemetry
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Audit 3PL Couriers &amp; NDR</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Audits Delhivery, BlueDart, and Shadowfax delivery speeds, transit days, and NDR recoveries.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('CHECK_COURIER_PERFORMANCE')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Audit Courier SLAs</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>

          {/* Action 6: Autopilot Rules */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Activity className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                  Autopilot OS
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">Execute Autopilot Rules</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evaluates active margin guardrails, ROAS sentinels, and autonomous store directives.
              </p>
            </div>
            <button
              onClick={() => handleTriggerQuickAction('EXECUTE_AUTOPILOT_RULES')}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Run Autopilot Directives</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME LIVE CALL TELEMETRY & EXECUTION LOGS                            */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Live Call Execution Feed &amp; Audit Log</h3>
            <p className="text-[11px] text-slate-400">Real-time function calls executed across the website by Gemini</p>
          </div>
          <span className="text-[10px] font-mono-code text-indigo-400 bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded">
            Live Stream
          </span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {callLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No live call operations recorded yet. Start a Live Gemini Call or trigger a quick operation above.
            </div>
          ) : (
            callLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white font-mono-code text-[11px]">
                      &quot;{log.transcript}&quot;
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-code">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed pl-4 border-l-2 border-indigo-600/50">
                  {log.spokenResponse}
                </p>

                {log.actions && log.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.actions.map((act, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
