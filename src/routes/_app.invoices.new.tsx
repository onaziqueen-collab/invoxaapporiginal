import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Save, Send, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Invoice, type InvoiceItem } from "@/lib/store";
import { InvoicePreview, printInvoice } from "@/lib/invoice-preview";

export const Route = createFileRoute("/_app/invoices/new")({ component: NewInvoice });

function NewInvoice() {
  const { state, dispatch, helpers } = useStore();
  const nav = useNavigate();

  const [number] = useState(helpers.nextInvoiceNumber());
  const [clientId, setClientId] = useState(state.clients[0]?.id || "");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ id: helpers.newId("it"), description: "", quantity: 1, rate: 0 }]);
  const [taxRate, setTaxRate] = useState(state.business.defaultTax || 0);
  const [notes, setNotes] = useState("Thank you for your partnership.");
  const [paymentMethod, setPaymentMethod] = useState("Wire transfer");

  // Inline client create
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);

  function addItem() {
    setItems((it) => [...it, { id: helpers.newId("it"), description: "", quantity: 1, rate: 0 }]);
  }
  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((it) => it.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeItem(id: string) {
    setItems((it) => it.length > 1 ? it.filter((x) => x.id !== id) : it);
  }
  function quickAddClient() {
    if (!newClientName.trim() || !newClientEmail.includes("@")) {
      toast.error("Enter a name and valid email");
      return;
    }
    const c = { id: helpers.newId("c"), name: newClientName, email: newClientEmail };
    dispatch({ type: "ADD_CLIENT", client: c });
    setClientId(c.id);
    setNewClientName("");
    setNewClientEmail("");
    setShowAddClient(false);
    toast.success("Client added — selected on this invoice");
  }

  const draft: Invoice = useMemo(() => ({
    id: "preview",
    number,
    clientId,
    issueDate,
    dueDate,
    items,
    taxRate,
    notes,
    status: "draft",
    paymentMethod,
  }), [number, clientId, issueDate, dueDate, items, taxRate, notes, paymentMethod]);

  function save(status: "draft" | "pending") {
    if (!clientId) return toast.error("Pick a client first");
    if (items.every((i) => !i.description.trim())) return toast.error("Add at least one line item");
    const invoice: Invoice = { ...draft, id: helpers.newId("inv"), status };
    dispatch({ type: "ADD_INVOICE", invoice });
    toast.success(status === "pending" ? "Invoice sent" : "Draft saved");
    nav({ to: `/invoices/${invoice.id}` });
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => nav({ to: "/invoices" })} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2">
          <button onClick={() => save("draft")} className="btn-ghost"><Save className="w-4 h-4" /> Save draft</button>
          <button onClick={printInvoice} className="btn-ghost"><Download className="w-4 h-4" /> Download PDF</button>
          <button onClick={() => save("pending")} className="btn-primary"><Send className="w-4 h-4" /> Send invoice</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-elev p-5 space-y-4">
            <Section label="Invoice details">
              <Field label="Invoice number"><input className="input-field" value={number} disabled /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issued"><input type="date" className="input-field" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></Field>
                <Field label="Due"><input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
              </div>
            </Section>

            <Section label="Client">
              <div className="flex gap-2">
                <select className="input-field flex-1" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">Select client…</option>
                  {state.clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company || c.name}</option>
                  ))}
                </select>
                <button onClick={() => setShowAddClient((v) => !v)} className="btn-ghost px-3"><Plus className="w-4 h-4" /></button>
              </div>
              {showAddClient && (
                <div className="mt-3 p-3 bg-sand rounded-lg space-y-2">
                  <input className="input-field" placeholder="Client / company name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                  <input className="input-field" placeholder="Email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
                  <button onClick={quickAddClient} className="btn-primary w-full justify-center">Add client</button>
                </div>
              )}
            </Section>

            <Section label="Items">
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 items-start">
                    <input className="input-field col-span-6" placeholder="Description" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                    <input type="number" className="input-field col-span-2" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })} />
                    <input type="number" className="input-field col-span-3" placeholder="Rate" value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} />
                    <button onClick={() => removeItem(it.id)} className="col-span-1 h-[42px] flex items-center justify-center text-mocha hover:text-[var(--error)]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addItem} className="btn-ghost w-full justify-center"><Plus className="w-4 h-4" /> Add line item</button>
              </div>
            </Section>

            <Section label="Tax & payment">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tax / VAT (%)"><input type="number" step="0.1" className="input-field" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} /></Field>
                <Field label="Payment method">
                  <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option>Wire transfer</option><option>Credit card</option><option>ACH</option><option>PayPal</option><option>Cash</option>
                  </select>
                </Field>
              </div>
              <Field label="Notes"><textarea className="input-field min-h-20 resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </Section>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-mocha">Live preview</span>
              <span className="text-xs text-mocha">Updates as you type</span>
            </div>
            <InvoicePreview invoice={draft} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-mocha mb-3">{label}</div>
      <div className="space-y-3">{children}</div>
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