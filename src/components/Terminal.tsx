import { useState } from "react";
import { useTerminal } from "@/hooks/useTerminal";
import { useIsMobile } from "@/hooks/use-mobile";
import TerminalHeader from "@/components/TerminalHeader";
import TerminalOutput from "@/components/TerminalOutput";
import TerminalInput from "@/components/TerminalInput";
import TerminalLoginDialog from "@/components/TerminalLoginDialog";
import MessageCountChart from "@/components/MessageCountChart";
import TokenCountChart from "@/components/TokenCountChart";
import OutputTokensChart from "@/components/OutputTokensChart";
import CostChart from "@/components/CostChart";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3 } from "lucide-react";

function ChartPanel({ messageCounts, tokenCounts, outputTokenCounts }: {
  messageCounts: any[];
  tokenCounts: any[];
  outputTokenCounts: any[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <MessageCountChart data={messageCounts} />
      <TokenCountChart data={tokenCounts} />
      <OutputTokensChart data={outputTokenCounts} />
      <CostChart inputTokens={tokenCounts} outputTokens={outputTokenCounts} />
    </div>
  );
}

export default function Terminal() {
  const {
    lines, currentThread, isConnected, isProcessing,
    showLogin, loginError, isLoggingIn, messageCounts, tokenCounts, outputTokenCounts,
    handleLogin, handleLoginCancel, processCommand,
  } = useTerminal();

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const showSidebar = messageCounts.length > 0 || tokenCounts.length > 0 || outputTokenCounts.length > 0;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-2 sm:p-4">
      <div className="scanline flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border border-glow bg-card">
        <TerminalHeader isConnected={isConnected} currentThread={currentThread}>
          {isMobile && showSidebar && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-terminal-cyan text-glow-cyan hover:opacity-80 transition-opacity px-2 py-1 border border-border rounded">
                  <BarChart3 className="w-3 h-3" />
                  <span className="hidden xs:inline">Stats</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-card border-border border-glow max-h-[70vh] overflow-y-auto">
                <SheetTitle className="text-terminal-cyan text-glow-cyan text-sm font-mono tracking-wider uppercase mb-3">
                  ◈ Session Stats
                </SheetTitle>
                <ChartPanel messageCounts={messageCounts} tokenCounts={tokenCounts} outputTokenCounts={outputTokenCounts} />
              </SheetContent>
            </Sheet>
          )}
        </TerminalHeader>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <TerminalOutput lines={lines} isProcessing={isProcessing} />
            <TerminalInput
              onSubmit={processCommand}
              isProcessing={isProcessing}
              currentThread={currentThread}
            />
          </div>
          {!isMobile && showSidebar && (
            <div className="w-72 border-l border-border p-3 flex flex-col justify-end gap-3 overflow-y-auto">
              <ChartPanel messageCounts={messageCounts} tokenCounts={tokenCounts} outputTokenCounts={outputTokenCounts} />
            </div>
          )}
        </div>
      </div>
      <TerminalLoginDialog
        open={showLogin}
        onLogin={handleLogin}
        onCancel={handleLoginCancel}
        error={loginError}
        isLoading={isLoggingIn}
      />
    </div>
  );
}
