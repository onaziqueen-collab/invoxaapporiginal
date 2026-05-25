import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, AlertCircle, CheckCircle2, FileText, Settings as SettingsIcon } from "lucide-react";
import { useStore, formatDate, formatMoney, invoiceTotal } from "@/lib/store";

type Item = {
  id: string;
  kind: "overdue" | "paid" | "draft" | "system";
  title: string;
  body: string;
  date: string;
  to?: string;
};

export function NotificationsBell() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("invoxa_notif_read") || "[]")); } catch { return new Set(); }
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items: Item[] = useMemo(() => {
    const list: Item[] = [];
    const clientName = (cid: string) =>
      state.clients.find((c) => c.id === cid)?.company ||
      state.clients.find((c) => c.id === cid)?.name || "Client";

    for (const i of state.invoices.filter((x) => !x.archived)) {
      if (i.status === "overdue") {
        list.push({
          id: `ov_${i.id}`, kind: "overdue",
          title: `${i.number} is overdue`,
          body: `${clientName(i.clientId)} — ${formatMoney(invoiceTotal(i), state.business.currency)}`,
          date: i.dueDate, to: `/invoices/${i.id}`,
        });
      } else if (i.status === "paid" && i.paidDate) {
        list.push({
          id: `pd_${i.id}`, kind: "paid",
          title: `Payment received`,
          body: `${clientName(i.clientId)} paid ${i.number} — ${formatMoney(invoiceTotal(i), state.business.currency)}`,
          date: i.paidDate, to: `/invoices/${i.id}`,
        });
      }
    }

    list.push({
      id: "sys_welcome", kind: "system",
      title: "Payment Integrations are live",
      body: "Connect Paystack, Flutterwave or Stripe from settings.",
      date: new Date().toISOString().slice(0, 10),
      to: "/settings",
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  }, [state]);

  const unread = items.filter((i) => !readIds.has(i.id)).length;

  function markAllRead() {
    const next = new Set(items.map((i) => i.id));
    setReadIds(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("invoxa_notif_read", JSON.stringify([...next]));
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-lg hover:bg-sand transition flex items-center justify-center text-mocha"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--wine)] text-ivory text-[10px] font-semibold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[92vw] bg-surface border border-stone rounded-xl shadow-[var(--shadow-elev)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone">
            <div>
              <div className="text-sm font-semibold text-espresso">Notifications</div>
              <div className="text-[11px] text-mocha mt-0.5">{unread > 0 ? `${unread} unread` : "All caught up"}</div>
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-medium text-wine hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-mocha">Nothing to show yet.</div>
            ) : (
              items.map((it) => {
                const isUnread = !readIds.has(it.id);
                const body = (
                  <div className={`flex gap-3 px-4 py-3 ${isUnread ? "bg-[oklch(0.97_0.02_30)]" : ""} hover:bg-sand transition cursor-pointer`}>
                    <div className="mt-0.5"><IconFor kind={it.kind} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-espresso truncate">{it.title}</div>
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--wine)] mt-1.5 shrink-0" />}
                      </div>
                      <div className="text-xs text-mocha mt-0.5 truncate">{it.body}</div>
                      <div className="text-[10px] text-mocha mt-1 tracking-wide uppercase">{formatDate(it.date)}</div>
                    </div>
                  </div>
                );
                return it.to ? (
                  <Link key={it.id} to={it.to} onClick={() => setOpen(false)} className="block border-b border-stone last:border-0">
                    {body}
                  </Link>
                ) : (
                  <div key={it.id} className="border-b border-stone last:border-0">{body}</div>
                );
              })
            )}
          </div>
          <Link to="/settings" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-xs text-mocha hover:bg-sand border-t border-stone text-center">
            Notification settings
          </Link>
        </div>
      )}
    </div>
  );
}

function IconFor({ kind }: { kind: Item["kind"] }) {
  const base = "w-4 h-4";
  if (kind === "overdue") return <span className="w-7 h-7 rounded-full bg-[oklch(0.94_0.05_25)] text-[oklch(0.52_0.18_25)] flex items-center justify-center"><AlertCircle className={base} /></span>;
  if (kind === "paid") return <span className="w-7 h-7 rounded-full bg-[oklch(0.94_0.04_145)] text-[oklch(0.45_0.12_145)] flex items-center justify-center"><CheckCircle2 className={base} /></span>;
  if (kind === "draft") return <span className="w-7 h-7 rounded-full bg-sand text-mocha flex items-center justify-center"><FileText className={base} /></span>;
  return <span className="w-7 h-7 rounded-full bg-[oklch(0.93_0.03_18)] text-wine flex items-center justify-center"><SettingsIcon className={base} /></span>;
}
