import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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

function PasswordInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} pr-12`}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-gold"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}


function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState<"signin" | "forgot" | "verifying" | "reset">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Detect a password-recovery link returning to this page and open the reset form in place.
  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const code = url.searchParams.get("code");
    const linkError = hash.get("error_description") || url.searchParams.get("error_description");
    const isRecovery = hash.get("type") === "recovery" || url.searchParams.get("type") === "recovery" || !!code;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setError(null);
      }
    });

    const clean = () => window.history.replaceState(null, "", "/auth");

    if (linkError) {
      setError("This reset link has expired or was already used. Please request a fresh link.");
      setMode("forgot");
      clean();
    } else if (isRecovery) {
      setMode("verifying");
      (async () => {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
              setError("This reset link has expired or was already used. Please request a fresh link.");
              setMode("forgot");
              clean();
              return;
            }
          }
        } else {
          // Implicit flow: the client reads the tokens from the URL; wait for the session.
          for (let i = 0; i < 20; i++) {
            const { data } = await supabase.auth.getSession();
            if (data.session) break;
            await new Promise((r) => setTimeout(r, 250));
          }
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setError("This reset link has expired or was already used. Please request a fresh link.");
            setMode("forgot");
            clean();
            return;
          }
        }
        setMode("reset");
        clean();
      })();
    }
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate({ to: "/admin/enquiries" });
  };

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
          redirectTo: `${window.location.origin}/auth`,
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

  const inputCls =
    "h-12 w-full border border-input bg-background/40 px-4 text-sm text-ivory outline-none placeholder:text-muted-foreground/60 focus:border-gold";

  if (mode === "verifying" || mode === "reset") {
    return (
      <div className="grain flex min-h-svh items-center justify-center px-6 py-24">
        <div className="clay-card w-full max-w-md rounded-2xl p-8 md:p-12">
          <div className="mb-10 text-center">
            <span className="font-display text-2xl tracking-[0.14em] text-gold">{brand.name}</span>
            <h1 className="mt-4 text-3xl text-ivory">Set New Password</h1>
          </div>
          {mode === "verifying" ? (
            <p className="text-center text-sm text-muted-foreground">Verifying your reset link…</p>
          ) : (
            <form onSubmit={handleReset} className="grid gap-5">
              <label className="block">
                <span className="eyebrow mb-2 block">New password</span>
                <PasswordInput value={password} onChange={setPassword} className={inputCls} />
              </label>
              <label className="block">
                <span className="eyebrow mb-2 block">Confirm password</span>
                <PasswordInput value={confirm} onChange={setConfirm} className={inputCls} />
              </label>
              {error ? (
                <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              ) : null}
              <LuxeButton type="submit" disabled={loading} className="mt-2 w-full">
                {loading ? "Please wait…" : "Save Password"}
              </LuxeButton>
            </form>
          )}
        </div>
      </div>
    );
  }

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
            <PasswordInput value={password} onChange={setPassword} className={inputCls} />
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
