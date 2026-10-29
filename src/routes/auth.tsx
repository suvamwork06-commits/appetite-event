import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LuxeButton } from "@/components/luxe/LuxeButton";
import { brand } from "@/lib/content";
import { isAdminEmail } from "@/lib/admin";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Ambient & Appetite" },
      { name: "description", content: "Private access for the Ambient & Appetite concierge team." },
    ],
  }),
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!isAdminEmail(email)) {
      setError("Wrong admin mail.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("A password reset link has been sent to your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        navigate({ to: "/admin/enquiries" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain flex min-h-svh items-center justify-center px-6 py-24">
      <div className="clay-card w-full max-w-md rounded-2xl p-8 md:p-12">
        <div className="mb-10 text-center">
          <span className="font-display text-2xl tracking-[0.14em] text-gold">{brand.name}</span>
          <h1 className="mt-4 text-3xl text-ivory">Private Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For the concierge team only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="block">
            <span className="eyebrow mb-2 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full border border-input bg-background/40 px-4 text-sm text-ivory outline-none placeholder:text-muted-foreground/60 focus:border-gold"
              placeholder="you@appetiteevent.com"
            />
          </label>

          {mode === "signin" ? (
          <label className="block">
            <span className="eyebrow mb-2 block">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full border border-input bg-background/40 px-4 text-sm text-ivory outline-none placeholder:text-muted-foreground/60 focus:border-gold"
              placeholder="••••••••"
            />
          </label>
          ) : null}

          {error ? (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded border border-gold/40 bg-gold/10 p-3 text-sm text-ivory">
              {message}
            </div>
          ) : null}

          <LuxeButton type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Send Reset Link"}
          </LuxeButton>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "forgot" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="text-center text-xs text-muted-foreground transition-colors hover:text-ivory"
          >
            {mode === "signin" ? "Forgot password?" : "Back to sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
