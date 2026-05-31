"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

type ResultPayload = {
  user?: { id: number; username: string; email: string };
  impacts?: Array<{ table: string; rows: number }>;
  deletedUser?: { id: number; username: string; email: string };
  linkedDeletions?: Array<{ table: string; deletedRows: number }>;
  accountRows?: number;
  linkedRows?: Array<{ table: string; rows: number }>;
  deletedAccounts?: number;
};

export function DevAdminModal({ open, onClose }: ModalProps) {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);

  const canDeleteAll = useMemo(
    () => username.trim().toLowerCase() === "delete all users",
    [username],
  );

  if (!open) {
    return null;
  }

  async function runAction(action: string, payload?: Record<string, string>) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/dev-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password, ...payload }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        result?: ResultPayload;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setResult(data.result || null);
      return true;
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error ? requestError.message : "Request failed.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    const ok = await runAction("verify");
    if (ok) {
      setVerified(true);
      setMessage("Developer options unlocked.");
    }
  }

  async function previewUser() {
    await runAction("preview-user", { username });
  }

  async function deleteUser() {
    const ok = await runAction("delete-user", { username });
    if (ok) {
      setMessage(`Deleted user ${username} and linked records.`);
    }
  }

  async function previewAll() {
    await runAction("preview-all");
  }

  async function deleteAll() {
    const ok = await runAction("delete-all");
    if (ok) {
      setMessage("Deleted all users and linked records.");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-heading text-xl font-bold text-[#FFD700]">Developer Options</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5 text-sm text-white">
          {!verified ? (
            <div className="space-y-3">
              <p className="text-white/75">Enter admin password to unlock destructive dev tools.</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/[0.03] px-3 py-2 text-white focus:border-[#FFD700]/70 focus:outline-none"
                placeholder="Admin password"
              />
              <button
                type="button"
                onClick={verify}
                disabled={loading}
                className="rounded-lg bg-[#FFD700] px-4 py-2 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Unlock"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="mb-2 font-heading text-base font-semibold text-white">Delete One User</h3>
                  <p className="mb-3 text-xs text-white/65">
                    Enter username, preview linked data impact, then delete.
                  </p>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-3 w-full rounded-lg border border-white/20 bg-white/[0.03] px-3 py-2 text-white focus:border-[#FFD700]/70 focus:outline-none"
                    placeholder="username"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={previewUser}
                      disabled={loading || !username.trim()}
                      className="rounded-lg border border-white/25 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={deleteUser}
                      disabled={loading || !username.trim()}
                      className="rounded-lg bg-red-500/80 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete User
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="mb-2 font-heading text-base font-semibold text-white">Delete All Users</h3>
                  <p className="mb-3 text-xs text-white/65">
                    Type <span className="font-semibold text-[#FFD700]">delete all users</span> in the username input to enable.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={previewAll}
                      disabled={loading}
                      className="rounded-lg border border-white/25 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Preview All
                    </button>
                    <button
                      type="button"
                      onClick={deleteAll}
                      disabled={loading || !canDeleteAll}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {message && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200">{message}</p>}
          {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200">{error}</p>}

          {result && (
            <pre className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/85">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </motion.div>
    </div>
  );
}
