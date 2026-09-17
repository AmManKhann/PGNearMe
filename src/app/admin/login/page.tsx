"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, User, LogIn, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import type { UserSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter the admin email.");
      return;
    }
    if (!password) {
      setError("Please enter the admin password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      login(data.user as UserSession);
      router.replace("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-border shadow-lg shadow-black/20 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4 neon-glow">
              <LockKeyhole className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted mt-1">
              Restricted area. Authorized administrators only.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Admin Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="email"
                  placeholder="admin@pgnearme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-accent"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-all neon-glow disabled:opacity-50 disabled:hover:bg-accent disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In to Admin Dashboard"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-medium text-muted mb-2">
              Admin demo credentials
            </h3>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-foreground">admin@pgnearme.com</p>
                <p className="text-muted">Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}