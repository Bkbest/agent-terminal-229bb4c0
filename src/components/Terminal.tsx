import { useTerminal } from "@/hooks/useTerminal";
import TerminalHeader from "@/components/TerminalHeader";
import TerminalOutput from "@/components/TerminalOutput";
import TerminalInput from "@/components/TerminalInput";
import TerminalLoginDialog from "@/components/TerminalLoginDialog";
import MessageCountChart from "@/components/MessageCountChart";

export default function Terminal() {
  const {
    lines, currentThread, isConnected, isProcessing,
    showLogin, loginError, isLoggingIn, messageCounts,
    handleLogin, handleLoginCancel, processCommand,
  } = useTerminal();

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
          {messageCounts.length > 0 && (
            <div className="w-72 border-l border-border p-3 flex flex-col justify-end overflow-hidden">
              <MessageCountChart data={messageCounts} />
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
