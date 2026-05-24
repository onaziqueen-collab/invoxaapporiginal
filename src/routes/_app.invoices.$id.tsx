import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Copy, Trash2, Archive, CheckCircle2, Share2, Download, Pencil, Receipt as RcpIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, formatMoney, formatDate, invoiceTotal, statusMeta, type Invoice, type InvoiceItem } from "@/lib/store";
import { InvoicePreview, printInvoice } from "@/lib/invoice-preview";

export const Route = createFileRoute("/_app/invoices/$id")({ component: InvoiceDetail });

function InvoiceDetail() {
  const { id } = useParams({ from: "/_app/invoices/$id" });
  const { state, dispatch, helpers } = useStore();
  const nav = useNavigate();
  const invoice = state.invoices.find((i) => i.id === id);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!invoice) {
    return (
      <div className="card-elev p-10 text-center">
        <p className="text-sm text-mocha">Invoice not found.</p>
        <Link to="/invoices" className="btn-primary mt-4 inline-flex">Back to invoices</Link>
      </div>
    );
  }

  const client = state.clients.find((c) => c.id === invoice.clientId);
  const meta = statusMeta(invoice.status);
  const receipt = state.receipts.find((r) => r.invoiceId === invoice.id);

  function markPaid() {
    dispatch({ type: "MARK_PAID", id: invoice!.id });
    toast.success("Marked as paid · receipt generated");
  }
  function duplicate() {
    const copy: Invoice = {
      ...invoice!,
      id: helpers.newId("inv"),
      number: helpers.nextInvoiceNumber(),
      status: "draft",
      paidDate: undefined,
      items: invoice!.items.map((x) => ({ ...x, id: helpers.newId("it") })),
    };
    dispatch({ type: "ADD_INVOICE", invoice: copy });
    toast.success("Duplicated as draft");
    nav({ to: `/invoices/${copy.id}` });
  }
  function archive() {
    dispatch({ type: "ARCHIVE_INVOICE", id: invoice!.id });
    toast.success("Archived");
    nav({ to: "/invoices" });
  }
  function del() {
    dispatch({ type: "DELETE_INVOICE", id: invoice!.id });
    toast.success("Invoice deleted");
    nav({ to: "/invoices" });
  }
  function share() {
    const link = `${window.location.origin}/invoices/${invoice!.id}`;
    navigator.clipboard?.writeText(link);
    toast.success("Share link copied");
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => nav({ to: "/invoices" })} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div>
            <div className="text-xs text-mocha tracking-wider uppercase">{client?.company || client?.name}</div>
            <h1 className="text-xl font-semibold text-espresso flex items-center gap-3">{invoice.number} <span className={`badge-pill ${meta.cls}`}>{meta.label}</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== "paid" && (
            <button onClick={markPaid} className="btn-primary"><CheckCircle2 className="w-4 h-4" /> Mark as paid</button>
          )}
          {invoice.status === "paid" && receipt && (
            <Link to={`/receipts/${receipt.id}`} className="btn-primary"><RcpIcon className="w-4 h-4" /> View receipt</Link>
          )}
          <button onClick={() => setEditing((v) => !v)} className="btn-ghost"><Pencil className="w-4 h-4" /> {editing ? "Done" : "Edit"}</button>
          <button onClick={share} className="btn-ghost"><Share2 className="w-4 h-4" /> Share</button>
          <button onClick={printInvoice} className="btn-ghost"><Download className="w-4 h-4" /> Download</button>
          <button onClick={duplicate} className="btn-ghost"><Copy className="w-4 h-4" /> Duplicate</button>
          <button onClick={archive} className="btn-ghost"><Archive className="w-4 h-4" /> Archive</button>
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost text-[var(--error)] hover:bg-[oklch(0.96_0.04_25)]"><Trash2 className="w-4 h-4" /> Delete</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 no-print">
          <div className="card-elev p-5">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">Summary</div>
            <div className="text-3xl font-semibold text-espresso mt-3">{formatMoney(invoiceTotal(invoice), state.business.currency)}</div>
            <div className="text-xs text-mocha mt-1">Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}</div>
            {invoice.paidDate && <div className="mt-3 px-3 py-2 rounded-lg bg-[oklch(0.96_0.025_145)] text-[oklch(0.38_0.10_145)] text-xs font-medium">Paid on {formatDate(invoice.paidDate)}</div>}
          </div>
          <div className="card-elev p-5">
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha mb-3">Client</div>
            <div className="text-sm font-medium text-espresso">{client?.company || client?.name}</div>
            <div className="text-xs text-mocha mt-1">{client?.email}</div>
            {client?.phone && <div className="text-xs text-mocha">{client.phone}</div>}
            <div className="text-xs text-mocha mt-2 whitespace-pre-line">{client?.address}</div>
          </div>

          {editing && <EditPanel invoice={invoice} />}
        </div>

        <div className="lg:col-span-2">
          <InvoicePreview invoice={invoice} />
        </div>
      </div>

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <h3 className="text-lg font-semibold text-espresso">Delete this invoice?</h3>
          <p className="text-sm text-mocha mt-2">This will permanently remove {invoice.number}. Linked receipts will also be removed.</p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost">Cancel</button>
            <button onClick={del} className="btn-primary" style={{ background: "var(--error)" }}>Delete invoice</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EditPanel({ invoice }: { invoice: Invoice }) {
  const { dispatch, helpers } = useStore();
  const [items, setItems] = useState<InvoiceItem[]>(invoice.items);
  const [notes, setNotes] = useState(invoice.notes);
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [taxRate, setTaxRate] = useState(invoice.taxRate);

  function save() {
    dispatch({ type: "UPDATE_INVOICE", invoice: { ...invoice, items, notes, dueDate, taxRate } });
    toast.success("Invoice updated");
  }

  return (
    <div className="card-elev p-5 space-y-3">
      <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha">Edit</div>
      <label className="block text-xs text-mocha">Due date
        <input type="date" className="input-field mt-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label className="block text-xs text-mocha">Tax %
        <input type="number" step="0.1" className="input-field mt-1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
      </label>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 gap-1.5">
            <input className="input-field col-span-6 text-xs py-2" value={it.description} onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, description: e.target.value } : x))} />
            <input type="number" className="input-field col-span-2 text-xs py-2" value={it.quantity} onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, quantity: Number(e.target.value) } : x))} />
            <input type="number" className="input-field col-span-4 text-xs py-2" value={it.rate} onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, rate: Number(e.target.value) } : x))} />
          </div>
        ))}
        <button onClick={() => setItems((arr) => [...arr, { id: helpers.newId("it"), description: "", quantity: 1, rate: 0 }])} className="btn-ghost w-full justify-center text-xs py-1.5">+ Add line</button>
      </div>
      <label className="block text-xs text-mocha">Notes
        <textarea className="input-field mt-1 min-h-16 text-xs" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button onClick={save} className="btn-primary w-full justify-center">Save changes</button>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-[var(--shadow-elev)] relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-sand"><X className="w-4 h-4 text-mocha" /></button>
        {children}
      </div>
    </div>
  );
}