const API_BASE = `http://${import.meta.env.VITE_LANGGRAPH_HOST || '192.168.68.111'}:${import.meta.env.VITE_API_PORT || '8001'}`;
const WS_BASE = `ws://${import.meta.env.VITE_LANGGRAPH_HOST || '192.168.68.111'}:${import.meta.env.VITE_WS_PORT || '8001'}`;

let authToken: string | null = localStorage.getItem('agent_token');

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('agent_token', token);
  } else {
    localStorage.removeItem('agent_token');
  }
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

function authHeaders(): Record<string, string> {
  if (!authToken) return {};
  return { Authorization: `Bearer ${authToken}` };
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please login again.");
    this.name = "SessionExpiredError";
  }
}

function handleResponse(res: Response): Response {
  if (res.status === 401 && authToken) {
    setToken(null);
    throw new SessionExpiredError();
  }
  return res;
}


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

export async function login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Login failed: ${res.status}` }));
    throw new Error(err.error || err.detail || `Login failed: ${res.status}`);
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export function logout() {
  setToken(null);
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = handleResponse(await fetch(`${API_BASE}/api/threads`, { headers: authHeaders() }));
  if (!res.ok) throw new Error(`Failed to fetch threads: ${res.status}`);
  const data = await res.json();
  return data.threads ?? [];
}

export async function fetchThread(threadId: string): Promise<Message[]> {
  const res = handleResponse(await fetch(`${API_BASE}/api/thread/${threadId}`, { headers: authHeaders() }));
  if (!res.ok) throw new Error(`Failed to fetch thread: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function deleteThread(threadId: string): Promise<void> {
  const res = handleResponse(await fetch(`${API_BASE}/api/thread/${threadId}`, { method: "DELETE", headers: authHeaders() }));
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
  const url = authToken ? `${WS_BASE}/ws?token=${authToken}` : `${WS_BASE}/ws`;
  return new WebSocket(url);
}
