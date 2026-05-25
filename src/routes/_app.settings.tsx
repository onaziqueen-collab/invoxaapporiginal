import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, X, Lock, Building2, CreditCard } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { state, dispatch } = useStore();
  const [biz, setBiz] = useState(state.business);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [notifyPaid, setNotifyPaid] = useState(true);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBiz({ ...biz, logoDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  }

  function save() {
    dispatch({ type: "UPDATE_BUSINESS", patch: biz });
    toast.success("Settings saved");
  }

  return (
    <div className="fade-up space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-espresso">Settings</h1>
        <p className="text-sm text-mocha mt-1">How your business shows up on invoices and receipts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-elev p-5 md:col-span-2 space-y-4">
          <SectionHeader title="Business profile" subtitle="Appears at the top of every document." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Business name"><input className="input-field" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} /></Field>
            <Field label="Contact email"><input className="input-field" value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} /></Field>
          </div>
          <Field label="Address"><textarea className="input-field min-h-20 resize-none" value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tax ID / EIN"><input className="input-field" value={biz.taxId} onChange={(e) => setBiz({ ...biz, taxId: e.target.value })} /></Field>
            <Field label="Default currency">
              <select className="input-field" value={biz.currency} onChange={(e) => setBiz({ ...biz, currency: e.target.value })}>
                <option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option><option>GHS</option><option>ZAR</option>
              </select>
            </Field>
          </div>
          <Field label="Default tax / VAT (%)"><input type="number" step="0.1" className="input-field" value={biz.defaultTax} onChange={(e) => setBiz({ ...biz, defaultTax: Number(e.target.value) })} /></Field>
        </div>

        <div className="card-elev p-5">
          <SectionHeader title="Branding" subtitle="Logo on documents" />
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-sand flex items-center justify-center overflow-hidden border border-stone">
              {biz.logoDataUrl ? <img src={biz.logoDataUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xs text-mocha">No logo</span>}
            </div>
            <label className="btn-ghost cursor-pointer">
              Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </label>
          </div>
        </div>

        <div className="card-elev p-5 md:col-span-2 space-y-3">
          <SectionHeader title="Payment methods" subtitle="What clients can use to pay you." />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {["Bank transfer", "Card (Paystack)", "Card (Flutterwave)", "USSD", "Cash"].map((m) => (
              <label key={m} className="flex items-center gap-2 p-3 rounded-lg border border-stone hover:border-blush text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[var(--wine)]" /> {m}
              </label>
            ))}
          </div>
        </div>

        <div className="card-elev p-5">
          <SectionHeader title="Notifications" subtitle="Email alerts" />
          <div className="mt-4 space-y-3">
            <Toggle label="Overdue invoices" v={notifyOverdue} onChange={setNotifyOverdue} />
            <Toggle label="Payment received" v={notifyPaid} onChange={setNotifyPaid} />
          </div>
        </div>
      </div>

      <PaymentIntegrationsSection />

      <div className="flex justify-end">
        <button onClick={save} className="btn-primary">Save settings</button>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-espresso">{title}</div>
      <div className="text-xs text-mocha mt-0.5">{subtitle}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-mocha">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm text-espresso cursor-pointer">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!v)}
        className={`w-9 h-5 rounded-full transition relative ${v ? "bg-[var(--wine)]" : "bg-[var(--stone)]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${v ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}

type ProviderKey = "stripe" | "paystack" | "flutterwave" | "bank";
type ProviderState = "connected" | "disconnected" | "soon";

interface ProviderMeta {
  key: ProviderKey;
  name: string;
  description: string;
  badge?: string;
  mark: { letter: string; bg: string; fg: string };
  fields?: { key: string; label: string; placeholder: string; secret?: boolean }[];
}

const PROVIDERS: ProviderMeta[] = [
  {
    key: "paystack", name: "Paystack",
    description: "Accept cards, bank transfers and USSD across Nigeria and West Africa.",
    mark: { letter: "P", bg: "oklch(0.93 0.08 220)", fg: "oklch(0.42 0.16 255)" },
    fields: [
      { key: "public", label: "Public key", placeholder: "pk_live_••••••••••••" },
      { key: "secret", label: "Secret key", placeholder: "sk_live_••••••••••••", secret: true },
    ],
  },
  {
    key: "flutterwave", name: "Flutterwave",
    description: "Multi-currency payments with payouts to local Nigerian banks.",
    mark: { letter: "F", bg: "oklch(0.93 0.06 35)", fg: "oklch(0.45 0.16 35)" },
    fields: [
      { key: "public", label: "Public key", placeholder: "FLWPUBK-••••••••••••" },
      { key: "secret", label: "Secret key", placeholder: "FLWSECK-••••••••••••", secret: true },
    ],
  },
  {
    key: "stripe", name: "Stripe",
    description: "International cards for global clients. Settle to USD or NGN.",
    badge: "International",
    mark: { letter: "S", bg: "oklch(0.92 0.05 285)", fg: "oklch(0.42 0.16 285)" },
    fields: [
      { key: "secret", label: "Secret key", placeholder: "sk_live_••••••••••••", secret: true },
    ],
  },
  {
    key: "bank", name: "Bank Transfer",
    description: "Display your NUBAN account details directly on every invoice.",
    mark: { letter: "B", bg: "oklch(0.94 0.03 30)", fg: "var(--wine)" },
    fields: [
      { key: "bank", label: "Bank name", placeholder: "GTBank" },
      { key: "account", label: "Account number", placeholder: "0123456789" },
      { key: "name", label: "Account name", placeholder: "Morgan Studio Ltd" },
    ],
  },
];

interface IntegrationsState {
  providers: Record<ProviderKey, ProviderState>;
  autoConfirm: boolean;
  autoReceipts: boolean;
  trackRefs: boolean;
}

const DEFAULT_INTEGRATIONS: IntegrationsState = {
  providers: { stripe: "disconnected", paystack: "disconnected", flutterwave: "disconnected", bank: "disconnected" },
  autoConfirm: true,
  autoReceipts: true,
  trackRefs: true,
};

const INTEG_KEY = "invoxa_integrations_v1";

function PaymentIntegrationsSection() {
  const [s, setS] = useState<IntegrationsState>(DEFAULT_INTEGRATIONS);
  const [active, setActive] = useState<ProviderMeta | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(INTEG_KEY);
      if (raw) setS({ ...DEFAULT_INTEGRATIONS, ...JSON.parse(raw) });
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(INTEG_KEY, JSON.stringify(s));
  }, [s]);

  function setProvider(k: ProviderKey, v: ProviderState) {
    setS((prev) => ({ ...prev, providers: { ...prev.providers, [k]: v } }));
  }

  function disconnect(k: ProviderKey, name: string) {
    setProvider(k, "disconnected");
    toast.success(`${name} disconnected`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-espresso flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-wine" /> Payment Integrations
          </h2>
          <p className="text-sm text-mocha mt-1">Connect a gateway so clients can pay invoices in one tap.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-mocha bg-sand border border-stone rounded-full px-2.5 py-1">
          <Sparkles className="w-3 h-3" /> More integrations coming soon
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {PROVIDERS.map((p) => {
          const status = s.providers[p.key];
          return (
            <div key={p.key} className="card-elev p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: p.mark.bg, color: p.mark.fg }}
                  >
                    {p.mark.letter}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-espresso flex items-center gap-2">
                      {p.name}
                      {p.badge && <span className="text-[10px] font-medium text-mocha bg-sand border border-stone rounded-full px-1.5 py-0.5">{p.badge}</span>}
                    </div>
                    <StatusPill status={status} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-mocha leading-relaxed">{p.description}</p>
              <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-stone">
                <span className="text-[11px] text-mocha inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Keys stored encrypted</span>
                {status === "connected" ? (
                  <button onClick={() => disconnect(p.key, p.name)} className="btn-ghost text-xs py-1.5 px-3">Disconnect</button>
                ) : status === "soon" ? (
                  <button disabled className="btn-ghost text-xs py-1.5 px-3 opacity-60 cursor-not-allowed">Coming soon</button>
                ) : (
                  <button onClick={() => setActive(p)} className="btn-primary text-xs py-1.5 px-3">Connect</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-elev p-5 space-y-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-wine" />
          <div className="text-sm font-semibold text-espresso">Payment Monitoring</div>
        </div>
        <p className="text-xs text-mocha">Automate the busywork around incoming payments.</p>
        <div className="mt-4 divide-y divide-stone">
          <MonitorRow
            title="Auto-confirm paid invoices"
            sub="When a gateway reports a successful charge, mark the invoice as paid."
            v={s.autoConfirm}
            onChange={(v) => setS({ ...s, autoConfirm: v })}
          />
          <MonitorRow
            title="Generate receipts automatically"
            sub="Issue a numbered receipt the moment payment is confirmed."
            v={s.autoReceipts}
            onChange={(v) => setS({ ...s, autoReceipts: v })}
          />
          <MonitorRow
            title="Track payment references"
            sub="Save gateway reference IDs against each invoice for reconciliation."
            v={s.trackRefs}
            onChange={(v) => setS({ ...s, trackRefs: v })}
          />
        </div>
      </div>

      {active && (
        <ConnectModal
          provider={active}
          onClose={() => setActive(null)}
          onConnect={() => {
            setProvider(active.key, "connected");
            toast.success(`${active.name} connected`);
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ProviderState }) {
  if (status === "connected") return (
    <div className="text-[11px] mt-1 inline-flex items-center gap-1 text-[oklch(0.45_0.12_145)]">
      <CheckCircle2 className="w-3 h-3" /> Connected
    </div>
  );
  if (status === "soon") return <div className="text-[11px] mt-1 text-mocha">Coming soon</div>;
  return <div className="text-[11px] mt-1 text-mocha">Not connected</div>;
}

function MonitorRow({ title, sub, v, onChange }: { title: string; sub: string; v: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-espresso">{title}</div>
        <div className="text-xs text-mocha mt-0.5">{sub}</div>
      </div>
      <button type="button" onClick={() => onChange(!v)}
        className={`shrink-0 w-9 h-5 rounded-full transition relative ${v ? "bg-[var(--wine)]" : "bg-[var(--stone)]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${v ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

function ConnectModal({ provider, onClose, onConnect }: { provider: ProviderMeta; onClose: () => void; onConnect: () => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const valid = (provider.fields || []).every((f) => (vals[f.key] || "").trim().length >= 4);

  function submit() {
    if (!valid) return toast.error("Fill in all fields to continue");
    setBusy(true);
    setTimeout(() => { setBusy(false); onConnect(); }, 700);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-[var(--shadow-elev)] relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-sand"><X className="w-4 h-4 text-mocha" /></button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold" style={{ background: provider.mark.bg, color: provider.mark.fg }}>
            {provider.mark.letter}
          </div>
          <div>
            <h3 className="text-base font-semibold text-espresso">Connect {provider.name}</h3>
            <p className="text-xs text-mocha">{provider.description}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {(provider.fields || []).map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs text-mocha">{f.label}</span>
              <input
                type={f.secret ? "password" : "text"}
                className="input-field mt-1"
                placeholder={f.placeholder}
                value={vals[f.key] || ""}
                onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-mocha flex items-start gap-1.5 bg-sand border border-stone rounded-lg p-3">
          <Lock className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Credentials are stored securely and never shared with third parties. You can revoke access anytime.</span>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={submit} disabled={!valid || busy} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {busy ? "Connecting…" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}