import { useStore, formatMoney, formatDate, invoiceSubtotal, invoiceTax, invoiceTotal, type Invoice } from "@/lib/store";
import { LogoMark } from "@/lib/logo";

export function InvoicePreview({ invoice, mode = "invoice", receiptNumber }: { invoice: Invoice; mode?: "invoice" | "receipt"; receiptNumber?: string }) {
  const { state } = useStore();
  const client = state.clients.find((c) => c.id === invoice.clientId);
  const biz = state.business;

  return (
    <div className="print-area bg-surface text-espresso rounded-2xl border border-stone overflow-hidden">
      <div className="px-10 py-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            {biz.logoDataUrl ? (
              <img src={biz.logoDataUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <LogoMark size={42} />
            )}
            <div>
              <div className="text-base font-semibold tracking-tight">{biz.name || "Your business"}</div>
              <div className="text-xs text-mocha">{biz.email}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-mocha">
              {mode === "receipt" ? "Receipt" : "Invoice"}
            </div>
            <div className="text-xl font-semibold mt-1">{mode === "receipt" ? receiptNumber : invoice.number}</div>
            {mode === "receipt" && <div className="text-xs text-mocha mt-1">for {invoice.number}</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">From</div>
            <div className="text-sm mt-2 leading-relaxed">
              <div className="font-medium">{biz.name}</div>
              <div className="text-mocha whitespace-pre-line">{biz.address}</div>
              <div className="text-mocha">{biz.taxId}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">Billed to</div>
            <div className="text-sm mt-2 leading-relaxed">
              <div className="font-medium">{client?.company || client?.name || "—"}</div>
              <div className="text-mocha">{client?.name}</div>
              <div className="text-mocha whitespace-pre-line">{client?.address}</div>
              <div className="text-mocha">{client?.email}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-stone text-sm">
          <Meta label="Issued" value={formatDate(invoice.issueDate)} />
          <Meta label={mode === "receipt" ? "Paid on" : "Due"} value={formatDate(mode === "receipt" ? (invoice.paidDate || invoice.dueDate) : invoice.dueDate)} />
          <Meta label="Payment" value={invoice.paymentMethod} />
        </div>

        <table className="w-full mt-8 text-sm">
          <thead>
            <tr className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha border-b border-stone">
              <th className="text-left py-3">Description</th>
              <th className="text-right py-3 w-20">Qty</th>
              <th className="text-right py-3 w-28">Rate</th>
              <th className="text-right py-3 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id} className="border-b border-[oklch(0.93_0.008_50)]">
                <td className="py-3.5 text-espresso">{it.description || <span className="text-mocha italic">Untitled item</span>}</td>
                <td className="py-3.5 text-right text-mocha">{it.quantity}</td>
                <td className="py-3.5 text-right text-mocha">{formatMoney(it.rate, biz.currency)}</td>
                <td className="py-3.5 text-right font-medium">{formatMoney(it.quantity * it.rate, biz.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <div className="w-72 space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(invoiceSubtotal(invoice), biz.currency)} />
            <Row label={`Tax (${invoice.taxRate}%)`} value={formatMoney(invoiceTax(invoice), biz.currency)} />
            <div className="border-t border-stone pt-3 mt-2 flex justify-between">
              <span className="text-sm font-semibold">{mode === "receipt" ? "Amount paid" : "Total due"}</span>
              <span className="text-lg font-semibold text-wine">{formatMoney(invoiceTotal(invoice), biz.currency)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-stone">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">Notes</div>
            <p className="text-sm text-mocha mt-2 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {mode === "receipt" && (
          <div className="mt-8 px-5 py-4 rounded-xl bg-[oklch(0.96_0.025_145)] border border-[oklch(0.85_0.06_145)]">
            <div className="text-sm font-semibold text-[oklch(0.38_0.10_145)]">Payment confirmed</div>
            <div className="text-xs text-mocha mt-1">Received {formatDate(invoice.paidDate!)} via {invoice.paymentMethod}.</div>
          </div>
        )}
      </div>
      <div className="px-10 py-5 bg-sand border-t border-stone flex items-center justify-between text-xs text-mocha">
        <span>Generated with Invoxa</span>
        <span>{biz.email}</span>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-mocha"><span>{label}</span><span className="text-espresso">{value}</span></div>;
}

export function printInvoice() {
  window.print();
}