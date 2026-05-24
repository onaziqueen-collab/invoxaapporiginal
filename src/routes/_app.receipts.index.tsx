import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useStore, formatMoney, formatDate } from "@/lib/store";

export const Route = createFileRoute("/_app/receipts/")({ component: ReceiptsPage });

function ReceiptsPage() {
  const { state } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const list = state.receipts.filter((r) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    const inv = state.invoices.find((i) => i.id === r.invoiceId);
    const c = state.clients.find((x) => x.id === inv?.clientId);
    return r.number.toLowerCase().includes(t) || (inv?.number.toLowerCase() || "").includes(t) || (c?.company || c?.name || "").toLowerCase().includes(t);
  });

  return (
    <div className="fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-espresso">Receipts</h1>
        <p className="text-sm text-mocha mt-1">Issued automatically when invoices are marked as paid.</p>
      </div>

      <div className="card-elev p-5">
        <div className="relative max-w-md mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search receipts…" className="input-field pl-10" />
        </div>

        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-mocha">No receipts yet. They appear once an invoice is marked paid.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-mocha uppercase tracking-wider">
                  <th className="text-left font-medium px-4 py-3">Receipt</th>
                  <th className="text-left font-medium px-4 py-3">For invoice</th>
                  <th className="text-left font-medium px-4 py-3">Client</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Paid on</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Method</th>
                  <th className="text-right font-medium px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const inv = state.invoices.find((i) => i.id === r.invoiceId);
                  const c = state.clients.find((x) => x.id === inv?.clientId);
                  return (
                    <tr key={r.id} onClick={() => nav({ to: `/receipts/${r.id}` })} className="table-row cursor-pointer border-t border-stone">
                      <td className="px-4 py-3.5 font-medium text-espresso">{r.number}</td>
                      <td className="px-4 py-3.5 text-wine">{inv?.number || "—"}</td>
                      <td className="px-4 py-3.5 text-espresso">{c?.company || c?.name || "—"}</td>
                      <td className="px-4 py-3.5 text-mocha hidden md:table-cell">{formatDate(r.paidDate)}</td>
                      <td className="px-4 py-3.5 text-mocha hidden md:table-cell">{r.method}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-espresso">{formatMoney(r.amount, state.business.currency)}</td>
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