import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/lib/auth-shell";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    setSent(true);
    toast.success("Reset link sent — check your inbox");
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure link to set a new one.">
      {sent ? (
        <div className="space-y-4">
          <div className="bg-sand border border-stone rounded-xl p-5">
            <p className="text-sm text-espresso font-medium">Email sent</p>
            <p className="text-sm text-mocha mt-1">If an account exists for <span className="text-espresso">{email}</span>, a reset link is on its way.</p>
          </div>
          <Link to="/login" className="btn-ghost w-full justify-center">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-mocha uppercase tracking-wider">Email</label>
            <input className="input-field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" />
          </div>
          <button className="btn-primary w-full justify-center">Send reset link</button>
          <p className="text-sm text-mocha text-center pt-1">
            Remembered it? <Link to="/login" className="text-wine font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}