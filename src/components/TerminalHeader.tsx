import { ReactNode } from "react";

interface TerminalHeaderProps {
  isConnected: boolean;
  currentThread: string | null;
  children?: ReactNode;
}

export default function TerminalHeader({ isConnected, currentThread, children }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2 select-none gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Traffic light dots */}
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive/80" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-terminal-amber/80" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/80" />
        </div>
        <span className="text-xs text-muted-foreground tracking-widest uppercase hidden sm:inline">
          Agent Terminal
        </span>
        <span className="text-xs text-muted-foreground tracking-wider uppercase sm:hidden">
          AT
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
        {children}
        {currentThread && (
          <span className="text-muted-foreground truncate max-w-[80px] sm:max-w-[200px] hidden sm:inline">
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
            {isConnected ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
