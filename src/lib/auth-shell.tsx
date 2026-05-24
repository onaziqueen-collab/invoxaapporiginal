import { ReactNode } from "react";
import { Logo } from "./logo";
import heroImg from "@/assets/auth-hero.jpg";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="hidden lg:block relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(123,51,64,0.55), rgba(36,27,25,0.55))" }} />
        <div className="relative h-full flex flex-col justify-between p-12 text-ivory">
          <Logo to="/" />
          <div className="max-w-md fade-up">
            <p className="text-xs tracking-[0.18em] uppercase opacity-70 mb-4">Invoxa · for independent professionals</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight" style={{ color: "var(--ivory)" }}>
              Invoicing that feels as considered as the work you send it for.
            </h1>
            <p className="mt-4 text-sm opacity-80 leading-relaxed">
              Track revenue, send polished invoices, and issue receipts in seconds — without losing the calm of your studio.
            </p>
          </div>
          <div className="text-xs opacity-60 tracking-wide">© 2026 Invoxa Studio</div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8"><Logo to="/" /></div>
          <h2 className="text-2xl font-semibold text-espresso">{title}</h2>
          <p className="text-sm text-mocha mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}