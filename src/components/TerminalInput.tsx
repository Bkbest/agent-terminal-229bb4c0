import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface TerminalInputProps {
  onSubmit: (input: string, images?: string[]) => void;
  isProcessing: boolean;
  currentThread: string | null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TerminalInput({ onSubmit, isProcessing, currentThread }: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if ((!value.trim() && images.length === 0) || isProcessing) return;
    onSubmit(value, images.length > 0 ? images : undefined);
    if (value.trim()) {
      setHistory((h) => [value, ...h]);
    }
    setHistoryIdx(-1);
    setValue("");
    setImages([]);
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

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return;
    e.preventDefault();
    try {
      const urls = await Promise.all(files.map(fileToDataUrl));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      // ignore
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const prompt = currentThread
    ? isMobile ? `$ ` : `agent@${currentThread.slice(0, 20)}:~$`
    : isMobile ? `$ ` : "agent@disconnected:~$";

  return (
    <div className="border-t border-border cursor-text" onClick={() => inputRef.current?.focus()}>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-2">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`pasted-${i}`}
                className="h-16 w-16 object-cover rounded border border-border"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-80 hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-terminal-cyan text-glow-cyan text-sm font-semibold shrink-0 select-none">
          {prompt}
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isProcessing}
          placeholder={isProcessing ? "Processing..." : "Type or paste an image..."}
          className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/50 caret-primary disabled:opacity-50 font-mono"
          autoComplete="off"
          spellCheck={false}
        />
        <span className="text-foreground animate-cursor-blink text-sm select-none">█</span>
      </div>
    </div>
  );
}
