import { useState, useRef, useCallback } from "react";
import {
  fetchThreads,
  fetchThread,
  deleteThread,
  healthCheck,
  generateThreadId,
  createWebSocket,
  type Thread,
  type Message,
  type WsChunkData,
} from "@/lib/api";

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "error" | "ai" | "human" | "tool" | "info";
  content: string;
  timestamp: Date;
}

interface TerminalState {
  lines: TerminalLine[];
  currentThread: string | null;
  isConnected: boolean;
  isProcessing: boolean;
  threads: Thread[];
}

let lineCounter = 0;
function createLine(type: TerminalLine["type"], content: string): TerminalLine {
  return { id: `line-${++lineCounter}`, type, content, timestamp: new Date() };
}

export function useTerminal() {
  const [state, setState] = useState<TerminalState>({
    lines: [
      createLine("system", "╔══════════════════════════════════════════════════╗"),
      createLine("system", "║       LANGGRAPH AGENT TERMINAL v1.0.0           ║"),
      createLine("system", "║       Secure Connection Interface               ║"),
      createLine("system", "╚══════════════════════════════════════════════════╝"),
      createLine("info", ""),
      createLine("info", 'Type "help" for available commands.'),
      createLine("info", ""),
    ],
    currentThread: null,
    isConnected: false,
    isProcessing: false,
    threads: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const connectionsRef = useRef<Map<string, WebSocket>>(new Map());

  const addLine = useCallback((type: TerminalLine["type"], content: string) => {
    setState((s) => ({ ...s, lines: [...s.lines, createLine(type, content)] }));
  }, []);

  const addLines = useCallback((lines: Array<{ type: TerminalLine["type"]; content: string }>) => {
    setState((s) => ({
      ...s,
      lines: [...s.lines, ...lines.map((l) => createLine(l.type, l.content))],
    }));
  }, []);

  const connectToThread = useCallback(
    (threadId: string) => {
      // Reuse existing connection
      const existing = connectionsRef.current.get(threadId);
      if (existing && existing.readyState === WebSocket.OPEN) {
        wsRef.current = existing;
        setState((s) => ({ ...s, currentThread: threadId, isConnected: true }));
        return;
      }

      const ws = createWebSocket();

      ws.onopen = () => {
        connectionsRef.current.set(threadId, ws);
        wsRef.current = ws;
        setState((s) => ({ ...s, currentThread: threadId, isConnected: true }));
        addLine("system", `⚡ Connected to thread: ${threadId}`);
      };

      ws.onmessage = (event) => {
        try {
          const data: WsChunkData = JSON.parse(event.data);
          if (data.data) {
            for (const nodeData of Object.values(data.data)) {
              if (nodeData.ai_messages) {
                for (const msg of nodeData.ai_messages) {
                  const tokens = msg.usage_metadata?.total_tokens;
                  const suffix = tokens ? ` [${tokens} tokens]` : "";
                  addLine("ai", `${msg.content}${suffix}`);
                }
              }
              if (nodeData.tool_messages) {
                for (const msg of nodeData.tool_messages) {
                  addLine("tool", msg.content);
                }
              }
            }
          }
          setState((s) => ({ ...s, isProcessing: false }));
        } catch {
          addLine("output", event.data);
          setState((s) => ({ ...s, isProcessing: false }));
        }
      };

      ws.onclose = () => {
        connectionsRef.current.delete(threadId);
        if (wsRef.current === ws) {
          wsRef.current = null;
          setState((s) => ({ ...s, isConnected: false }));
        }
        addLine("system", `✕ Disconnected from thread: ${threadId}`);
      };

      ws.onerror = () => {
        addLine("error", `Connection error for thread: ${threadId}`);
        setState((s) => ({ ...s, isProcessing: false }));
      };
    },
    [addLine]
  );

  const disconnectThread = useCallback(
    (threadId: string) => {
      const ws = connectionsRef.current.get(threadId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        connectionsRef.current.delete(threadId);
      }
      if (state.currentThread === threadId) {
        wsRef.current = null;
        setState((s) => ({ ...s, currentThread: null, isConnected: false }));
      }
    },
    [state.currentThread]
  );

  const processCommand = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      addLine("input", trimmed);

      const [cmd, ...args] = trimmed.split(/\s+/);
      const command = cmd.toLowerCase();

      try {
        switch (command) {
          case "help": {
            addLines([
              { type: "info", content: "┌─── AVAILABLE COMMANDS ───────────────────────┐" },
              { type: "info", content: "│  new              Start a new conversation    │" },
              { type: "info", content: "│  threads          List all threads             │" },
              { type: "info", content: "│  connect <id|n>   Connect to a thread          │" },
              { type: "info", content: "│  disconnect       Disconnect current thread    │" },
              { type: "info", content: "│  delete <id|n>    Delete a thread              │" },
              { type: "info", content: "│  history          Show current thread messages  │" },
              { type: "info", content: "│  status           Show connection status       │" },
              { type: "info", content: "│  health           Server health check          │" },
              { type: "info", content: "│  clear            Clear terminal               │" },
              { type: "info", content: "│  help             Show this help               │" },
              { type: "info", content: "├──────────────────────────────────────────────── │" },
              { type: "info", content: "│  Any other input sends a message to the agent  │" },
              { type: "info", content: "└───────────────────────────────────────────────┘" },
            ]);
            break;
          }

          case "new": {
            const threadId = generateThreadId();
            addLine("system", `Creating new thread: ${threadId}`);
            connectToThread(threadId);
            break;
          }

          case "threads": {
            addLine("system", "Fetching threads...");
            const threads = await fetchThreads();
            setState((s) => ({ ...s, threads }));
            if (threads.length === 0) {
              addLine("info", "No threads found. Use 'new' to start a conversation.");
            } else {
              addLines([
                { type: "info", content: "┌─── THREADS ──────────────────────────────────┐" },
                ...threads.map((t, i) => ({
                  type: "info" as const,
                  content: `│  [${i}] ${t.thread_id}`,
                })),
                { type: "info", content: "└───────────────────────────────────────────────┘" },
              ]);
            }
            break;
          }

          case "connect": {
            const target = args[0];
            if (!target) {
              addLine("error", "Usage: connect <thread_id | index>");
              break;
            }
            let threadId = target;
            const idx = parseInt(target);
            if (!isNaN(idx) && idx >= 0 && idx < state.threads.length) {
              threadId = state.threads[idx].thread_id;
            }
            addLine("system", `Connecting to ${threadId}...`);
            connectToThread(threadId);

            // Load history
            const messages = await fetchThread(threadId);
            if (messages.length > 0) {
              addLine("info", "── Conversation History ──");
              for (const msg of messages) {
                if (msg.type === "human") addLine("human", msg.content);
                else if (msg.type === "ai") addLine("ai", msg.content);
                else if (msg.type === "tool") addLine("tool", msg.content);
              }
              addLine("info", "── End of History ──");
            }
            break;
          }

          case "disconnect": {
            if (!state.currentThread) {
              addLine("error", "No active connection.");
              break;
            }
            disconnectThread(state.currentThread);
            addLine("system", "Disconnected.");
            break;
          }

          case "delete": {
            const target = args[0];
            if (!target) {
              addLine("error", "Usage: delete <thread_id | index>");
              break;
            }
            let deleteId = target;
            const idx2 = parseInt(target);
            if (!isNaN(idx2) && idx2 >= 0 && idx2 < state.threads.length) {
              deleteId = state.threads[idx2].thread_id;
            }
            addLine("system", `Deleting thread: ${deleteId}...`);
            await deleteThread(deleteId);
            disconnectThread(deleteId);
            addLine("system", `Thread ${deleteId} deleted.`);
            break;
          }

          case "history": {
            if (!state.currentThread) {
              addLine("error", "No active thread. Connect to one first.");
              break;
            }
            const msgs = await fetchThread(state.currentThread);
            if (msgs.length === 0) {
              addLine("info", "No messages in this thread.");
            } else {
              addLine("info", "── Conversation History ──");
              for (const msg of msgs) {
                if (msg.type === "human") addLine("human", msg.content);
                else if (msg.type === "ai") addLine("ai", msg.content);
                else if (msg.type === "tool") addLine("tool", msg.content);
              }
              addLine("info", "── End of History ──");
            }
            break;
          }

          case "status": {
            addLines([
              { type: "info", content: `Thread:    ${state.currentThread ?? "none"}` },
              { type: "info", content: `Connected: ${state.isConnected ? "yes" : "no"}` },
              { type: "info", content: `Active WS: ${connectionsRef.current.size}` },
            ]);
            break;
          }

          case "health": {
            addLine("system", "Checking server health...");
            const h = await healthCheck();
            addLine("info", `Status: ${h.status} — ${h.message}`);
            break;
          }

          case "clear": {
            setState((s) => ({ ...s, lines: [] }));
            break;
          }

          default: {
            // Send as message to agent
            if (!state.currentThread || !state.isConnected) {
              addLine("error", 'Not connected to any thread. Use "new" or "connect <id>" first.');
              break;
            }

            const ws = connectionsRef.current.get(state.currentThread);
            if (!ws || ws.readyState !== WebSocket.OPEN) {
              addLine("error", "WebSocket not ready. Try reconnecting.");
              break;
            }

            setState((s) => ({ ...s, isProcessing: true }));
            addLine("human", trimmed);
            ws.send(JSON.stringify({ message: trimmed, thread_id: state.currentThread }));
            break;
          }
        }
      } catch (err) {
        addLine("error", `Error: ${err instanceof Error ? err.message : String(err)}`);
        setState((s) => ({ ...s, isProcessing: false }));
      }
    },
    [addLine, addLines, connectToThread, disconnectThread, state.currentThread, state.isConnected, state.threads]
  );

  return {
    lines: state.lines,
    currentThread: state.currentThread,
    isConnected: state.isConnected,
    isProcessing: state.isProcessing,
    processCommand,
  };
}
