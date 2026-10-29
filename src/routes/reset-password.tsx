import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LuxeButton } from "@/components/luxe/LuxeButton";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Password — Ambient & Appetite" },
      { name: "description", content: "Set a new admin password." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Older reset emails point here; forward them to the admin panel with the link details intact.
  useEffect(() => {
    window.location.replace(`/auth${window.location.search}${window.location.hash}`);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
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

  const cls =
    "h-12 w-full border border-input bg-background/40 px-4 text-sm text-ivory outline-none focus:border-gold";

  return (
    <div className="grain flex min-h-svh items-center justify-center px-6 py-24">
      <div className="clay-card w-full max-w-md rounded-2xl p-8 md:p-12">
        <h1 className="mb-8 text-center text-3xl text-ivory">Set New Password</h1>
        <form onSubmit={onSubmit} className="grid gap-5">
          <label className="block">
            <span className="eyebrow mb-2 block">New password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={cls} />
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block">Confirm password</span>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={cls} />
          </label>
          {error ? (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          ) : null}
          <LuxeButton type="submit" disabled={loading} className="w-full">
            {loading ? "Please wait…" : "Save Password"}
          </LuxeButton>
        </form>
      </div>
    </div>
  );
}
