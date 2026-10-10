"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { ArrowUp, MessageCircleDashed, Plus, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

import { useTypewriter } from "@/components/ui/ai-chat-card-utils/use-typewriter";

export interface AIChatCardProps {
  title?: string;
  subtitle?: string;
  greeting?: string;
  prompt?: string;
  /** Prompts the composer types out on a loop. */
  prompts?: string[];
  /** Turn the prompt-typing animation off. */
  autoType?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  onSend?: (message: string) => void;
  onReset?: () => void;
  onAttach?: () => void;
  className?: string;
}

const DEFAULT_PROMPTS = [
  "I'm building a chat for our app and the scroll behavior is driving me nuts. Every…",
  "Add a pricing table with a monthly/annual toggle",
  "Make my hero section feel more premium",
  "Generate a changelog page from our GitHub releases",
];

export function AIChatCard({
  title = "New Chat",
  subtitle = "How can I help you today?",
  greeting = "Morning, Arihant!",
  prompt = "What are we working on today? Press send to start a new conversation",
  prompts = DEFAULT_PROMPTS,
  autoType = true,
  placeholder = "Ask anything…",
  icon,
  onSend,
  onReset,
  onAttach,
  className,
}: AIChatCardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const inView = useInView(rootRef, { margin: "-10% 0px" });

  const [userActive, setUserActive] = React.useState(false);
  const [userMessage, setUserMessage] = React.useState("");
  const [spins, setSpins] = React.useState(0);

  const { text: typedMessage, phase } = useTypewriter(prompts, {
    typeMs: 48,
    deleteMs: 14,
    holdMs: 3400,
    gapMs: 900,
    enabled: autoType && inView && !userActive,
  });

  const message = userActive || !autoType ? userMessage : typedMessage;

  const takeOver = () => {
    if (userActive || !autoType) return;
    setUserMessage(typedMessage);
    setUserActive(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full flex-col rounded-[24px] bg-slate-900 border border-slate-800 text-slate-100",
        "shadow-2xl shadow-cyan-950/20",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 pb-4 pt-5">
        <div>
          <h3 className="text-[16px] font-bold leading-6 text-white">
            {title}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-slate-400">
            {subtitle}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            setSpins((count) => count + 1);
            setUserActive(false);
            setUserMessage("");
            onReset?.();
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Reset conversation"
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[18px] border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:text-white hover:bg-slate-700 cursor-pointer"
        >
          <motion.span
            animate={{ rotate: spins * 360 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
            className="flex"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.span>
        </motion.button>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 shadow-md"
        >
          {icon ?? <MessageCircleDashed className="h-5 w-5 text-cyan-400" />}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mt-4 text-[18px] font-bold leading-7 tracking-tight text-white"
        >
          {greeting}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="mt-1.5 max-w-[280px] text-sm leading-[22px] text-slate-300"
        >
          {prompt}
        </motion.p>
      </div>

      {/* Composer */}
      <div className="px-5 pb-5">
        <div className="rounded-[18px] bg-slate-950/90 border border-slate-800 p-3.5 transition-colors focus-within:border-cyan-500/60 shadow-inner">
          {userActive || !autoType ? (
            <textarea
              ref={textareaRef}
              value={userMessage}
              onChange={(event) => setUserMessage(event.target.value)}
              placeholder={placeholder}
              rows={2}
              className="w-full resize-none bg-transparent text-sm leading-5 text-white outline-none placeholder:text-slate-500 font-sans"
            />
          ) : (
            <div
              onClick={takeOver}
              className="min-h-10 w-full cursor-text text-left text-sm leading-5 text-slate-100 font-sans"
            >
              <span className="text-white font-medium">{message}</span>
              <motion.span
                aria-hidden
                className="ml-px inline-block h-3.5 w-0.5 bg-cyan-400 align-middle"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  times: [0, 0.5, 0.5, 1],
                }}
              />
              {!message ? (
                <span className="text-slate-500">{placeholder}</span>
              ) : null}
            </div>
          )}
          <div className="mt-2.5 flex items-center justify-between">
            <motion.button
              type="button"
              onClick={onAttach}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              aria-label="Add files"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[18px] border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onSend?.(message)}
              whileHover={{
                scale: 1.08,
                transition: { type: "spring", bounce: 0.5, duration: 0.4 },
              }}
              whileTap={{
                scale: 0.88,
                transition: { type: "spring", bounce: 0.5, duration: 0.4 },
              }}
              animate={
                phase === "holding" && !userActive
                  ? { scale: [1, 1.14, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.5,
                ease: "easeInOut",
                times: [0, 0.35, 1],
              }}
              aria-label="Send message"
              className="group flex h-[32px] w-[32px] items-center justify-center rounded-[18px] bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-400 hover:to-blue-500 cursor-pointer"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatCard;
