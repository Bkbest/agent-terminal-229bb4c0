interface TerminalHeaderProps {
  isConnected: boolean;
  currentThread: string | null;
}

export default function TerminalHeader({ isConnected, currentThread }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2 select-none">
      <div className="flex items-center gap-3">
        {/* Traffic light dots */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-terminal-amber/80" />
          <div className="w-3 h-3 rounded-full bg-primary/80" />
        </div>
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          LangGraph Agent Terminal
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {currentThread && (
          <span className="text-muted-foreground truncate max-w-[200px]">
            {currentThread}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "bg-destructive"
            }`}
          />
          <span className={isConnected ? "text-foreground" : "text-destructive"}>
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}
