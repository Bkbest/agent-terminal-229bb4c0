import { useState, useRef, useEffect } from "react";

interface TerminalInputProps {
  onSubmit: (input: string) => void;
  isProcessing: boolean;
  currentThread: string | null;
}

export default function TerminalInput({ onSubmit, isProcessing, currentThread }: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || isProcessing) return;
    onSubmit(value);
    setHistory((h) => [value, ...h]);
    setHistoryIdx(-1);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const next = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(next);
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const next = historyIdx - 1;
        setHistoryIdx(next);
        setValue(history[next]);
      } else {
        setHistoryIdx(-1);
        setValue("");
      }
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const prompt = currentThread
    ? isMobile ? `$ ` : `agent@${currentThread.slice(0, 20)}:~$`
    : isMobile ? `$ ` : "agent@disconnected:~$";

  return (
    <div
      className="flex items-center gap-2 border-t border-border px-4 py-3 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-terminal-cyan text-glow-cyan text-sm font-semibold shrink-0 select-none">
        {prompt}
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        placeholder={isProcessing ? "Processing..." : "Type a command or message..."}
        className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/50 caret-primary disabled:opacity-50 font-mono"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="text-foreground animate-cursor-blink text-sm select-none">█</span>
    </div>
  );
}
