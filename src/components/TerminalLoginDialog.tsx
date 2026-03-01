import { useState, useRef, useEffect } from "react";

interface TerminalLoginDialogProps {
  open: boolean;
  onLogin: (username: string, password: string) => void;
  onCancel: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export default function TerminalLoginDialog({
  open,
  onLogin,
  onCancel,
  error,
  isLoading,
}: TerminalLoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focusField, setFocusField] = useState<"username" | "password">("username");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUsername("");
      setPassword("");
      setFocusField("username");
      setTimeout(() => usernameRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (focusField === "username") usernameRef.current?.focus();
    else passwordRef.current?.focus();
  }, [focusField]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent, field: "username" | "password") => {
    if (e.key === "Enter") {
      if (field === "username") {
        setFocusField("password");
      } else {
        if (username.trim() && password.trim()) {
          onLogin(username.trim(), password.trim());
        }
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md border border-border border-glow rounded bg-card p-0 font-mono scanline">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-amber/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80" />
          </div>
          <span className="text-xs text-muted-foreground tracking-widest uppercase">
            Authentication Required
          </span>
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            [ESC]
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-sm">
          <div className="text-terminal-cyan text-glow-cyan">
            [SYS] Secure login required to access the agent server.
          </div>

          {error && (
            <div className="text-destructive">
              [ERR] {error}
            </div>
          )}

          {/* Username */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0">username@login:~$</span>
            <input
              ref={usernameRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "username")}
              disabled={isLoading}
              placeholder="enter username"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/40 caret-primary disabled:opacity-50"
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0">password@login:~$</span>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "password")}
              disabled={isLoading}
              placeholder="enter password"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/40 caret-primary disabled:opacity-50"
              autoComplete="current-password"
              spellCheck={false}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <span>
              {isLoading ? (
                <span className="text-terminal-cyan text-glow-cyan">
                  Authenticating
                  <span className="animate-typing-dot">.</span>
                  <span className="animate-typing-dot-delay-1">.</span>
                  <span className="animate-typing-dot-delay-2">.</span>
                </span>
              ) : (
                "Press ENTER to proceed"
              )}
            </span>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                [CANCEL]
              </button>
              <button
                onClick={() => {
                  if (username.trim() && password.trim()) {
                    onLogin(username.trim(), password.trim());
                  }
                }}
                disabled={isLoading || !username.trim() || !password.trim()}
                className="text-primary text-glow hover:text-foreground transition-colors disabled:opacity-50"
              >
                [LOGIN]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
