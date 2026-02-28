import { useTerminal } from "@/hooks/useTerminal";
import TerminalHeader from "@/components/TerminalHeader";
import TerminalOutput from "@/components/TerminalOutput";
import TerminalInput from "@/components/TerminalInput";

export default function Terminal() {
  const { lines, currentThread, isConnected, isProcessing, processCommand } = useTerminal();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <div className="scanline flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border border-glow bg-card">
        <TerminalHeader isConnected={isConnected} currentThread={currentThread} />
        <TerminalOutput lines={lines} isProcessing={isProcessing} />
        <TerminalInput
          onSubmit={processCommand}
          isProcessing={isProcessing}
          currentThread={currentThread}
        />
      </div>
    </div>
  );
}
