import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
                <option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option><option>CAD</option><option>AUD</option>
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
            {["Wire transfer", "Credit card", "ACH", "PayPal", "Cash"].map((m) => (
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