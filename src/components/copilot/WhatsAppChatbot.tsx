import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const WhatsAppChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'bot',
      text: 'Namaste! Main DataNexus AI Assistant hoon. Main aapke store ke orders, GMV, delivery, profit/loss aur WhatsApp automated briefings ke har sawaal ka seedha jawab de sakta hoon. Aaj main aapki kya madad karoon? 😊',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [displayedStreamingText, setDisplayedStreamingText] = useState<{ [id: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking, displayedStreamingText]);

  // Safe HTML / Markdown Parser (XSS Protected, strictly renders React nodes)
  const renderFormattedText = (rawText: string) => {
    // Split into lines
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1.5 break-words font-sans text-xs leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1" />;
          }

          // Code block / mono format
          if (trimmed.startsWith('```') || trimmed.endsWith('```')) {
            const cleanCode = trimmed.replace(/```/g, '');
            return (
              <pre key={lIdx} className="p-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto my-1">
                <code>{cleanCode}</code>
              </pre>
            );
          }

          // Bullet point
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const lineText = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;

          // Bold parsing: *bold text* or **bold text**
          const parts = lineText.split(/(\*\*?[^*]+\*\*?)/g);

          return (
            <div key={lIdx} className={`${isBullet ? 'flex items-start gap-1.5 pl-1' : ''}`}>
              {isBullet && <span className="text-emerald-400 mt-0.5">•</span>}
              <div className="flex-1">
                {parts.map((part, pIdx) => {
                  if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
                    const boldClean = part.replace(/^\*+|\*+$/g, '');
                    return (
                      <strong key={pIdx} className="font-bold text-white tracking-wide">
                        {boldClean}
                      </strong>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Typewriter effect (reveals reply character-by-character every ~12ms)
  const animateTypewriter = (messageId: string, fullText: string) => {
    let index = 0;
    const interval = 12; // 12 ms per character as requested

    const timer = setInterval(() => {
      index++;
      setDisplayedStreamingText((prev) => ({
        ...prev,
        [messageId]: fullText.slice(0, index)
      }));

      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, interval);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isBotThinking) return;

    if (textToSend.length > 1000) {
      alert('Message 1000 characters se lamba nahi ho sakta.');
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: textToSend,
        timestamp: userTimestamp
      }
    ];

    setMessages(newMessages);
    setInput('');
    setIsBotThinking(true);

    // Prepare previous 6 messages for history
    const historyPayload = newMessages.slice(-6).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.text
    }));

    try {
      const res: any = await api.post('/api/chat', {
        message: textToSend,
        history: historyPayload
      });

      const replyText = res?.reply || 'Abhi thoda busy hoon, kuch der baad try karo 🙏';
      const botMsgId = `bot-${Date.now()}`;
      const botTimestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      // Add empty bot message and start typewriter effect
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: 'bot',
          text: replyText,
          timestamp: botTimestamp
        }
      ]);

      animateTypewriter(botMsgId, replyText);
    } catch (err) {
      const errorMsgId = `bot-err-${Date.now()}`;
      const errorText = 'Network ki dikkat hai, dobara try karo 🙏';
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          role: 'bot',
          text: errorText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setDisplayedStreamingText((prev) => ({
        ...prev,
        [errorMsgId]: errorText
      }));
    } finally {
      setIsBotThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const quickPrompts = [
    'Store ka profit aur delivered orders batao',
    'WhatsApp 8 AM briefing kaise kaam karti hai?',
    'RTO rate kam karne ke 3 best steps batao',
    'DataNexus me Shopify store kaise connect karein?'
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col">
      {/* Chatbot Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-950">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide">DataNexus AI Copilot Chatbot</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              3 Gemini Keys Load-Balanced • Real Store Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Round-Robin Auto Failover</span>
          </span>
        </div>
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Suggestions:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isBotThinking}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-950/80 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[460px] min-h-[320px] bg-slate-950/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          // Use typewriter text if streaming, otherwise full text
          const currentText = displayedStreamingText[m.id] !== undefined ? displayedStreamingText[m.id] : m.text;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 shadow-lg ${
                  isUser
                    ? 'bg-cyan-950/90 text-cyan-100 border border-cyan-800/70 rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className={`text-[10px] font-bold ${isUser ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {isUser ? 'Aap (User)' : 'DataNexus AI'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">{m.timestamp}</span>
                </div>

                {/* Safe Rendered Text */}
                {renderFormattedText(currentText)}
              </div>
            </div>
          );
        })}

        {/* 💥 Animated Typing Indicator */}
        {isBotThinking && (
          <div className="flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-150">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/50 rounded-tl-none shadow-lg flex items-center gap-2.5">
              {/* Pulsing 💥 Emoji */}
              <span className="text-base animate-ping" style={{ animationDuration: '1.2s' }}>
                💥
              </span>

              {/* 3 Blinking Dots with CSS Keyframes */}
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '180ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '360ms' }} />
              </div>

              <span className="text-xs font-mono text-emerald-300 ml-1">AI soch raha hai...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Apna sawaal likhein (e.g. 'Store ka profit kitna hai?', 'RTO rate kaise kam karein?')..."
            disabled={isBotThinking}
            maxLength={1000}
            className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors pr-14 disabled:opacity-50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
            {input.length}/1000
          </span>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isBotThinking}
          className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-40 transition-all active:scale-95"
        >
          {isBotThinking ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Bhejo</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
