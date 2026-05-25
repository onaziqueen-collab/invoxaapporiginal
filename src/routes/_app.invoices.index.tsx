import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useStore, formatMoney, formatDate, invoiceTotal, statusMeta, type InvoiceStatus } from "@/lib/store";

type SearchParams = { status?: InvoiceStatus | "all" };

export const Route = createFileRoute("/_app/invoices/")({
  component: InvoicesPage,
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    status: (s.status as SearchParams["status"]) || "all",
  }),
});

function InvoicesPage() {
  const { state } = useStore();
  const nav = useNavigate();
  const search = useSearch({ from: "/_app/invoices/" });
  const status = (search.status || "all") as InvoiceStatus | "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "amount" | "due">("new");

  let list = state.invoices.filter((i) => !i.archived);
  if (status !== "all") list = list.filter((i) => i.status === status);
  if (q.trim()) {
    const t = q.toLowerCase();
    list = list.filter((i) => {
      const c = state.clients.find((x) => x.id === i.clientId);
      return i.number.toLowerCase().includes(t) || (c?.company || c?.name || "").toLowerCase().includes(t);
    });
  }
  list = [...list].sort((a, b) => {
    if (sort === "amount") return invoiceTotal(b) - invoiceTotal(a);
    if (sort === "due") return a.dueDate.localeCompare(b.dueDate);
    return b.issueDate.localeCompare(a.issueDate);
  });

  const tabs: { key: InvoiceStatus | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: state.invoices.filter((i) => !i.archived).length },
    { key: "pending", label: "Pending", count: state.invoices.filter((i) => i.status === "pending").length },
    { key: "overdue", label: "Overdue", count: state.invoices.filter((i) => i.status === "overdue").length },
    { key: "paid", label: "Paid", count: state.invoices.filter((i) => i.status === "paid").length },
    { key: "draft", label: "Draft", count: state.invoices.filter((i) => i.status === "draft").length },
  ];

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-espresso">Invoices</h1>
        <p className="text-sm text-mocha mt-1">Track everything you've issued, in every state.</p>
      </div>

      <div className="card-elev p-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto scroll-hide -mx-1 px-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => nav({ to: "/invoices", search: { status: t.key } })}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${status === t.key ? "bg-sand text-espresso" : "text-mocha hover:text-espresso hover:bg-sand/60"}`}>
                {t.label}
                <span className="count-chip" data-active={status === t.key ? "true" : "false"}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-60 min-w-0">
              <Search className="w-4 h-4 text-mocha absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices…" className="input-field !pl-10 py-2 text-sm w-full" />
            </div>
            <div className="relative shrink-0">
              <select value={sort} onChange={(e) => setSort(e.target.value as never)} className="input-field select-field py-2 text-sm w-auto">
                <option value="new">Newest</option>
                <option value="amount">Amount</option>
                <option value="due">Due date</option>
              </select>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-mocha">No invoices to show.</p>
            <Link to="/invoices/new" className="btn-primary mt-4 inline-flex">Create your first invoice</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-mocha uppercase tracking-wider">
                  <th className="text-left font-medium px-4 py-3">Invoice</th>
                  <th className="text-left font-medium px-4 py-3">Client</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Issued</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Due</th>
                  <th className="text-right font-medium px-4 py-3">Amount</th>
                  <th className="text-right font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => {
                  const c = state.clients.find((x) => x.id === i.clientId);
                  const meta = statusMeta(i.status);
                  return (
                    <tr key={i.id} onClick={() => nav({ to: `/invoices/${i.id}` })} className="table-row cursor-pointer border-t border-stone">
                      <td className="px-4 py-3.5 font-medium text-espresso">{i.number}</td>
                      <td className="px-4 py-3.5 text-espresso">{c?.company || c?.name || "—"}</td>
                      <td className="px-4 py-3.5 text-mocha hidden md:table-cell">{formatDate(i.issueDate)}</td>
                      <td className="px-4 py-3.5 text-mocha hidden md:table-cell">{formatDate(i.dueDate)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-espresso">{formatMoney(invoiceTotal(i), state.business.currency)}</td>
                      <td className="px-4 py-3.5 text-right"><span className={`badge-pill ${meta.cls}`}>{meta.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}