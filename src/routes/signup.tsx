import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/lib/auth-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Please enter your name.");
    if (!email.includes("@")) return setErr("Please enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    const initials = name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "IN";
    dispatch({
      type: "LOGIN",
      user: { id: "u_" + Math.random().toString(36).slice(2, 8), name, email, initials },
      seedAlex: false,
    });
    toast.success("Account created — welcome to Invoxa");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Create your Invoxa account" subtitle="Free to start. No card required.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-mocha uppercase tracking-wider">Full name</label>
          <input className="input-field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
        </div>
        <div>
          <label className="text-xs font-medium text-mocha uppercase tracking-wider">Work email</label>
          <input className="input-field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@studio.com" />
        </div>
        <div>
          <label className="text-xs font-medium text-mocha uppercase tracking-wider">Password</label>
          <input className="input-field mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        {err && <div className="text-sm text-[var(--error)] bg-[oklch(0.96_0.04_25)] border border-[oklch(0.85_0.08_25)] rounded-lg px-3 py-2">{err}</div>}
        <button className="btn-primary w-full justify-center mt-2">Create account</button>
        <p className="text-sm text-mocha text-center pt-2">
          Already with us? <Link to="/login" className="text-wine font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}