import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, FileText, Users, Receipt as RcpIcon } from "lucide-react";
import { useStore, formatMoney, statusMeta } from "@/lib/store";

export function GlobalSearch() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        (ref.current?.querySelector("input") as HTMLInputElement)?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return { invoices: [], clients: [], receipts: [] };
    const clientName = (cid: string) => state.clients.find((c) => c.id === cid)?.company || state.clients.find((c) => c.id === cid)?.name || "";
    return {
      invoices: state.invoices.filter((i) =>
        i.number.toLowerCase().includes(term) ||
        clientName(i.clientId).toLowerCase().includes(term) ||
        i.status.includes(term)
      ).slice(0, 5),
      clients: state.clients.filter((c) =>
        c.name.toLowerCase().includes(term) ||
        (c.company || "").toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      ).slice(0, 5),
      receipts: state.receipts.filter((r) => r.number.toLowerCase().includes(term)).slice(0, 5),
    };
  }, [term, state]);

  const total = results.invoices.length + results.clients.length + results.receipts.length;

  function go(to: string) {
    setOpen(false);
    setQ("");
    nav({ to });
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search invoices, clients, receipts…"
          className="w-full pl-10 pr-14 py-2.5 rounded-xl border border-stone bg-surface text-sm focus:outline-none focus:border-[var(--wine)] focus:ring-2 focus:ring-[oklch(0.42_0.105_18_/_0.12)]"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 kbd">⌘K</span>
      </div>
      {open && term && (
        <div className="absolute z-50 mt-2 w-full bg-surface border border-stone rounded-xl shadow-[var(--shadow-elev)] overflow-hidden">
          {total === 0 ? (
            <div className="p-6 text-center text-sm text-mocha">No matches for "{q}"</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto py-2">
              {results.invoices.length > 0 && (
                <Section title="Invoices" icon={<FileText className="w-3.5 h-3.5" />}>
                  {results.invoices.map((i) => {
                    const c = state.clients.find((x) => x.id === i.clientId);
                    const meta = statusMeta(i.status);
                    return (
                      <button key={i.id} onClick={() => go(`/invoices/${i.id}`)} className="w-full text-left px-4 py-2.5 hover:bg-sand flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-espresso font-medium truncate">{i.number}</div>
                          <div className="text-xs text-mocha truncate">{c?.company || c?.name}</div>
                        </div>
                        <span className={`badge-pill ${meta.cls}`}>{meta.label}</span>
                      </button>
                    );
                  })}
                </Section>
              )}
              {results.clients.length > 0 && (
                <Section title="Clients" icon={<Users className="w-3.5 h-3.5" />}>
                  {results.clients.map((c) => (
                    <button key={c.id} onClick={() => go(`/clients`)} className="w-full text-left px-4 py-2.5 hover:bg-sand">
                      <div className="text-sm text-espresso font-medium">{c.company || c.name}</div>
                      <div className="text-xs text-mocha">{c.email}</div>
                    </button>
                  ))}
                </Section>
              )}
              {results.receipts.length > 0 && (
                <Section title="Receipts" icon={<RcpIcon className="w-3.5 h-3.5" />}>
                  {results.receipts.map((r) => (
                    <button key={r.id} onClick={() => go(`/receipts/${r.id}`)} className="w-full text-left px-4 py-2.5 hover:bg-sand flex justify-between">
                      <span className="text-sm text-espresso font-medium">{r.number}</span>
                      <span className="text-xs text-mocha">{formatMoney(r.amount)}</span>
                    </button>
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha flex items-center gap-1.5">{icon}{title}</div>
      {children}
    </div>
  );
}