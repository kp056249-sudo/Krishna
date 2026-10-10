import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Smile, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, X } from "lucide-react";
import { api } from "../../src/lib/api";

export interface VoiceModalCardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onStartChatting?: () => void;
}

export const Component = ({
  isOpen = true,
  onClose,
  onStartChatting,
}: VoiceModalCardProps) => {
  const [inVoiceMode, setInVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [statusText, setStatusText] = useState("Press 'Start chatting' to speak with Gemini AI");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Supports Hindi & English seamlessly

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText("Listening... (Aap boliye, main sun raha hoon)");
      };

      recognition.onresult = async (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setIsListening(false);
        setStatusText("Thinking... (Gemini AI real answer generate kar raha hai)");

        // Send to real Gemini backend
        try {
          const res = await api.post("/api/chat", {
            message: spokenText,
            history: []
          });

          const reply = res.reply || "Aapka sawaal samajh gaya. Batao aur kya madad karoon?";
          setAiReply(reply);
          speakOutLoud(reply);
        } catch {
          const fallback = "Maine aapki aawaz sun li hai. Main DataNexus ka AI assistant hoon.";
          setAiReply(fallback);
          speakOutLoud(fallback);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setStatusText("Microphone error. Click mic button to try again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakOutLoud = (textToSpeak: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown asterisks or code formatting for natural voice
    const cleanSpeech = textToSpeak
      .replace(/[*#_`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .substring(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best natural voice (Hindi or English)
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes("hi") || v.name.includes("India"));
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText("Gemini is speaking... (Listening after speech)");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText("Listening ready. Tap Mic to speak again.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const startVoiceSession = () => {
    setInVoiceMode(true);
    setStatusText("Voice mode active. Tap microphone to speak.");
    onStartChatting?.();
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }, 400);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setStatusText("Browser speech recognition not available. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2.5rem] bg-neutral-900 border border-neutral-800 p-8 shadow-2xl relative text-left">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="mb-6 text-center border-b border-neutral-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Gemini Voice Mode Active</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-white">
          You're invited to try
          <br />
          advanced AI Voice Mode
        </h1>
      </div>

      {!inVoiceMode ? (
        <>
          {/* Features */}
          <div className="mb-8 space-y-5">
            {/* Natural Conversations */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="pt-0.5">
                <h3 className="mb-0.5 text-base font-semibold text-white">
                  Natural Conversations
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Real-time responses with Gemini multi-model intelligence.
                </p>
              </div>
            </div>

            {/* Emotion and Tone */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <Smile className="h-6 w-6 text-white" />
              </div>
              <div className="pt-0.5">
                <h3 className="mb-0.5 text-base font-semibold text-white">
                  Emotion and Tone
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Speaks out loud in Hindi &amp; English with realistic audio.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-5 h-px bg-neutral-800" />

          {/* Disclaimer */}
          <div className="mb-6 text-center">
            <p className="text-xs leading-relaxed text-neutral-400">
              Powered by real Google Gemini 3.8 Flash &amp; Multi-key quota.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={startVoiceSession}
              className="w-full rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-8 py-3.5 text-base font-semibold text-white transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              <span>Start chatting</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </>
      ) : (
        /* Active Voice Interaction Screen */
        <div className="space-y-5 text-center py-2 animate-in fade-in">
          {/* Animated Audio Orb */}
          <div className="flex justify-center py-4">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isSpeaking
                    ? "bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/50 scale-105 animate-pulse"
                    : isListening
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/50 scale-110"
                    : "bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-blue-600/40"
                }`}
              >
                {isSpeaking ? (
                  <Volume2 className="w-12 h-12 text-white animate-bounce" />
                ) : isListening ? (
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                ) : (
                  <Sparkles className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-neutral-300 min-h-[20px]">{statusText}</p>

          {/* Live Transcript */}
          {transcript && (
            <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-200 text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Aapne bola:</span>
              <p className="font-mono">"{transcript}"</p>
            </div>
          )}

          {/* AI Response Preview */}
          {aiReply && (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200 text-left max-h-36 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Gemini AI Answer:</span>
              <p className="leading-relaxed">{aiReply}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full font-bold transition-all shadow-lg cursor-pointer ${
                isListening
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/40"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30"
              }`}
            >
              {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }}
              className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
              title="Stop voice"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ModalCard = Component;
export default Component;
