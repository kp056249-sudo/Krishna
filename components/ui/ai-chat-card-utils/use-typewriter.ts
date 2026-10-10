import * as React from "react";

export interface UseTypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  gapMs?: number;
  enabled?: boolean;
}

export type TypewriterPhase = "typing" | "holding" | "deleting" | "idle";

export function useTypewriter(
  prompts: string[] = [],
  options: UseTypewriterOptions = {}
) {
  const {
    typeMs = 48,
    deleteMs = 14,
    holdMs = 3400,
    gapMs = 900,
    enabled = true,
  } = options;

  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<TypewriterPhase>("typing");
  const promptIndexRef = React.useRef(0);
  const charIndexRef = React.useRef(0);

  React.useEffect(() => {
    if (!enabled || prompts.length === 0) {
      setPhase("idle");
      return;
    }

    let timeoutId: any;

    const currentPrompt = prompts[promptIndexRef.current % prompts.length];

    if (phase === "typing") {
      if (charIndexRef.current < currentPrompt.length) {
        timeoutId = setTimeout(() => {
          charIndexRef.current += 1;
          setText(currentPrompt.slice(0, charIndexRef.current));
        }, typeMs);
      } else {
        timeoutId = setTimeout(() => {
          setPhase("holding");
        }, 100);
      }
    } else if (phase === "holding") {
      timeoutId = setTimeout(() => {
        setPhase("deleting");
      }, holdMs);
    } else if (phase === "deleting") {
      if (charIndexRef.current > 0) {
        timeoutId = setTimeout(() => {
          charIndexRef.current -= 1;
          setText(currentPrompt.slice(0, charIndexRef.current));
        }, deleteMs);
      } else {
        timeoutId = setTimeout(() => {
          promptIndexRef.current = (promptIndexRef.current + 1) % prompts.length;
          setPhase("typing");
        }, gapMs);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [phase, text, enabled, prompts, typeMs, deleteMs, holdMs, gapMs]);

  return { text, phase };
}
