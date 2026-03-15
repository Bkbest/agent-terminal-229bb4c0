import { useTerminal } from "@/hooks/useTerminal";
import TerminalHeader from "@/components/TerminalHeader";
import TerminalOutput from "@/components/TerminalOutput";
import TerminalInput from "@/components/TerminalInput";
import TerminalLoginDialog from "@/components/TerminalLoginDialog";
import MessageCountChart from "@/components/MessageCountChart";
import TokenCountChart from "@/components/TokenCountChart";

export default function Terminal() {
  const {
    lines, currentThread, isConnected, isProcessing,
    showLogin, loginError, isLoggingIn, messageCounts, tokenCounts,
    handleLogin, handleLoginCancel, processCommand,
  } = useTerminal();

  const showSidebar = messageCounts.length > 0 || tokenCounts.length > 0;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <div className="scanline flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border border-glow bg-card">
        <TerminalHeader isConnected={isConnected} currentThread={currentThread} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <TerminalOutput lines={lines} isProcessing={isProcessing} />
            <TerminalInput
              onSubmit={processCommand}
              isProcessing={isProcessing}
              currentThread={currentThread}
            />
          </div>
          {showSidebar && (
            <div className="w-72 border-l border-border p-3 flex flex-col justify-end gap-3 overflow-y-auto">
              <MessageCountChart data={messageCounts} />
              <TokenCountChart data={tokenCounts} />
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
