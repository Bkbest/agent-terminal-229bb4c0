import { useRef, useEffect, useState } from "react";
import type { TerminalLine } from "@/hooks/useTerminal";
import TypewriterText from "@/components/TypewriterText";

interface TerminalOutputProps {
  lines: TerminalLine[];
  isProcessing: boolean;
}

const typeStyles: Record<TerminalLine["type"], string> = {
  input: "text-foreground text-glow",
  output: "text-foreground",
  system: "text-terminal-cyan text-glow-cyan",
  error: "text-destructive",
  ai: "text-foreground",
  human: "text-terminal-amber text-glow-amber",
  tool: "text-terminal-dim",
  info: "text-muted-foreground",
};

const prefixes: Record<TerminalLine["type"], string> = {
  input: "❯ ",
  output: "",
  system: "[SYS] ",
  error: "[ERR] ",
  ai: "┃ ",
  human: "┃ ",
  tool: "┃ 🔧 ",
  info: "",
};

export default function TerminalOutput({ lines, isProcessing }: TerminalOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const prevLengthRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, animatedIds]);

  // Track which AI lines are "new" (appeared since last render)
  const newAiIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (lines.length > prevLengthRef.current) {
      for (let i = prevLengthRef.current; i < lines.length; i++) {
        if (lines[i].type === "ai") {
          newAiIds.current.add(lines[i].id);
        }
      }
    }
    prevLengthRef.current = lines.length;
  }, [lines]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
      {lines.map((line) => (
        <div key={line.id} className={`${typeStyles[line.type]} whitespace-pre-wrap break-words`}>
          <span className="opacity-60">{prefixes[line.type]}</span>
          {line.type === "ai" && newAiIds.current.has(line.id) && !animatedIds.has(line.id) ? (
            <TypewriterText
              text={line.content}
              speed={12}
              onComplete={() => {
                newAiIds.current.delete(line.id);
                setAnimatedIds((s) => new Set(s).add(line.id));
              }}
            />
          ) : (
            line.content
          )}
        </div>
      ))}
      {isProcessing && (
        <div className="text-terminal-cyan text-glow-cyan flex items-center gap-1">
          <span className="opacity-60">[SYS] </span>
          Processing
          <span className="animate-typing-dot">.</span>
          <span className="animate-typing-dot-delay-1">.</span>
          <span className="animate-typing-dot-delay-2">.</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
