import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/lib/auth-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@invoxa.com");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@")) return setErr("Please enter a valid email.");
    if (password.length < 4) return setErr("Password is too short.");
    setLoading(true);
    setTimeout(() => {
      const isAlex = email.trim().toLowerCase() === "alex@invoxa.com";
      dispatch({
        type: "LOGIN",
        user: {
          id: isAlex ? "u_alex" : "u_" + Math.random().toString(36).slice(2, 8),
          name: isAlex ? "Alex Morgan" : email.split("@")[0],
          email,
          initials: isAlex ? "AM" : email.slice(0, 2).toUpperCase(),
        },
        seedAlex: isAlex,
      });
      toast.success(isAlex ? "Welcome back, Alex" : "Signed in successfully");
      navigate({ to: "/dashboard" });
    }, 500);
  }

  return (
    <AuthShell title="Sign in to Invoxa" subtitle="Welcome back. Pick up where you left off.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-mocha uppercase tracking-wider">Email</label>
          <input className="input-field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-mocha uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs text-wine hover:underline">Forgot?</Link>
          </div>
          <input className="input-field mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <label className="flex items-center gap-2 text-sm text-mocha cursor-pointer">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--wine)]" />
          Remember me on this device
        </label>
        {err && <div className="text-sm text-[var(--error)] bg-[oklch(0.96_0.04_25)] border border-[oklch(0.85_0.08_25)] rounded-lg px-3 py-2">{err}</div>}
        <button disabled={loading} className="btn-primary w-full justify-center mt-2">{loading ? "Signing in…" : "Sign in"}</button>
        <p className="text-sm text-mocha text-center pt-2">
          New to Invoxa? <Link to="/signup" className="text-wine font-medium hover:underline">Create an account</Link>
        </p>
        <div className="text-xs text-mocha bg-sand border border-stone rounded-lg px-3 py-2.5 mt-3">
          <span className="font-medium text-espresso">Demo:</span> alex@invoxa.com / password — loads a populated workspace.
        </div>
      </form>
    </AuthShell>
  );
}