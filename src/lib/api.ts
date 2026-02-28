const API_BASE = `http://192.168.68.111:${import.meta.env.VITE_API_PORT || '8001'}`;
const WS_BASE = `ws://192.168.68.111:${import.meta.env.VITE_WS_PORT || '8001'}`;

export interface Thread {
  thread_id: string;
  created_at: string;
}

export interface Message {
  content: string;
  type: "human" | "ai" | "tool";
  id: string;
  usage_metadata?: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
  };
}

export interface WsChunkData {
  thread_id: string;
  data: Record<string, {
    ai_messages?: Message[];
    human_messages?: Message[];
    tool_messages?: Message[];
    [key: string]: unknown;
  }>;
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch(`${API_BASE}/api/threads`);
  if (!res.ok) throw new Error(`Failed to fetch threads: ${res.status}`);
  const data = await res.json();
  return data.threads ?? [];
}

export async function fetchThread(threadId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/api/thread/${threadId}`);
  if (!res.ok) throw new Error(`Failed to fetch thread: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function deleteThread(threadId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/thread/${threadId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete thread: ${res.status}`);
}

export async function healthCheck(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function generateThreadId(): string {
  return `thread_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

export function createWebSocket(): WebSocket {
  return new WebSocket(`${WS_BASE}/ws`);
}
