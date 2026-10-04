import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, MicOff, Plus, ArrowUp, RefreshCw, Copy, Check, Trash2, ArrowRight, ShieldCheck, Database, Key } from 'lucide-react';
import { askDataNexusCopilot } from '../../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const RealAiPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-6 Astra');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic greeting based on current time & founder name
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return 'Up late, KP?';
    if (hour < 12) return 'Good morning, KP';
    if (hour < 17) return 'Good afternoon, KP';
    return 'Good evening, KP';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: attachedFileName ? `[Attached: ${attachedFileName}]\n${query}` : query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setAttachedFileName(null);
    setLoading(true);

    try {
      // Direct call to backend server proxy or Gemini SDK
      const answer = await askDataNexusCopilot(query);
      const assistantMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Gemini API Execution Notice**\n\nCould not contact Gemini 2.5 Flash. Please check:\n1. \`GEMINI_API_KEY\` is configured in your \`.env\` file.\n2. You have an active internet connection to Google AI Studio.\n\n*Error details: ${err?.message || 'Key missing or network timeout'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please type your query.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } else {
        setIsListening(false);
        recognition.stop();
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[calc(100vh-80px)] max-w-4xl mx-auto font-sans text-slate-100 selection:bg-cyan-500 selection:text-white pb-32">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.json,.sql,.txt"
        className="hidden"
      />

      {/* Top Header / Action Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-900 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono-code font-bold text-slate-300">GPT-6 Astra Live</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">Real Server-Side AI</span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {messages.length === 0 ? (
        /* Empty State Greeting Screen (Modern Astra AI Aesthetic) */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto space-y-6 animate-in fade-in duration-300">
          {/* Centered Modern Astra Orbit AI Logo */}
          <div className="relative flex items-center justify-center">
            {/* Ambient outer halo */}
            <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/25 via-indigo-500/20 to-purple-500/25 blur-xl pointer-events-none animate-pulse" />
            
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40 p-4 shadow-2xl shadow-cyan-500/20 flex items-center justify-center group">
              {/* Outer rotating ring */}
              <div className="absolute inset-1 rounded-2xl border border-cyan-500/20 animate-[spin_12s_linear_infinite]" />
              
              {/* Inner glowing Astra Core */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/40 transform transition-transform group-hover:scale-110 duration-300">
                <Sparkles className="w-6 h-6 text-white drop-shadow" />
              </div>
            </div>
          </div>

          {/* Editorial Headline Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-slate-100 font-medium">
              {getGreeting()}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Ask real questions about your connected store, calculate ₹10 Cr unit economics, analyze RTO by pin code, or execute custom SQL queries.
            </p>
          </div>

          {/* Quick Query Suggestion Pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-lg pt-2">
            {[
              'Audit my COD orders & suggest WhatsApp OTP rules',
              'What unit economics do I need for ₹10 Crore profit?',
              'Explain how to stop Meta Ads clickbot bleed',
              'Write SQL query for top customer LTV cohorts',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left text-[11px] px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Conversation Thread */
        <div className="flex-1 space-y-6 py-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                    : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-sm shadow-lg'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-mono-code">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> GPT-6 Astra
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(msg.content);
                          utterance.lang = 'en-IN';
                          window.speechSynthesis.speak(utterance);
                        }}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Speak Response"
                      >
                        <Mic className="w-3 h-3 text-cyan-400" />
                        <span>Speak</span>
                      </button>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert prose-xs sm:prose-sm max-w-none whitespace-pre-line font-sans">
                  {msg.content}
                </div>

                <div className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-cyan-100 text-right' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="p-4 rounded-2xl rounded-bl-sm bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="font-mono-code text-[11px] text-cyan-400">GPT-6 Astra is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Bottom Input Dock (Matches Screenshot Exactly) */}
      <div className="fixed bottom-4 left-0 right-0 max-w-3xl mx-auto px-4 z-30">
        <div className="rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden p-3 space-y-2">
          {/* Top VIP Banner inside dock */}
          <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-slate-400 border-b border-slate-800/60">
            <span>Powered by GPT-6 Astra Intelligence Engine</span>
            <span className="text-cyan-400 hover:underline font-semibold cursor-pointer">
              Enterprise Autopilot
            </span>
          </div>

          {/* Attached File Pill if any */}
          {attachedFileName && (
            <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950 text-[11px] text-cyan-400 font-mono-code border border-slate-800">
              <span>📎 {attachedFileName}</span>
              <button onClick={() => setAttachedFileName(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
          )}

          {/* Textarea Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask GPT-6 Astra anything about your store, profit, RTO..."
              className="w-full bg-transparent resize-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1 leading-relaxed"
            />
          </div>

          {/* Bottom Controls Row: + Icon, Model Pill, Mic, Send */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Plus Button for File Attachment */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Store Orders CSV or Schema"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Model Pill */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{selectedModel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mic / Voice Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                title={isListening ? 'Stop Listening' : 'Voice Input'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={loading || (!inputPrompt.trim() && !attachedFileName)}
                onClick={() => handleSend()}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-slate-600" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
