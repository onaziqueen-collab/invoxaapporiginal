import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Mail, Phone, Pencil, Trash2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useStore, formatMoney, invoiceTotal, type Client } from "@/lib/store";

export const Route = createFileRoute("/_app/clients")({ component: ClientsPage });

function ClientsPage() {
  const { state, dispatch, helpers } = useStore();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = state.clients.filter((c) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return c.name.toLowerCase().includes(t) || (c.company || "").toLowerCase().includes(t) || c.email.toLowerCase().includes(t);
  });

  function stats(clientId: string) {
    const inv = state.invoices.filter((i) => i.clientId === clientId && !i.archived);
    const paid = inv.filter((i) => i.status === "paid").reduce((s, i) => s + invoiceTotal(i), 0);
    const open = inv.filter((i) => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + invoiceTotal(i), 0);
    return { count: inv.length, paid, open };
  }

  function startNew() {
    setEditing({ id: "", name: "", company: "", email: "", phone: "", address: "" });
    setOpen(true);
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-espresso">Clients</h1>
          <p className="text-sm text-mocha mt-1">Everyone you bill, in one place.</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus className="w-4 h-4" /> Add client</button>
      </div>

      <div className="card-elev p-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha z-10 pointer-events-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="input-field !pl-10 w-full" />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-mocha">No clients yet.</p>
            <button onClick={startNew} className="btn-primary mt-4">Add your first client</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {filtered.map((c) => {
              const s = stats(c.id);
              return (
                <div key={c.id} className="card-elev p-5 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-[oklch(0.92_0.03_18)] text-wine text-xs font-semibold flex items-center justify-center">
                        {(c.company || c.name).split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-espresso">{c.company || c.name}</div>
                      {c.company && <div className="text-xs text-mocha">{c.name}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(c); setOpen(true); }} className="p-1.5 rounded-lg hover:bg-sand text-mocha"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { dispatch({ type: "DELETE_CLIENT", id: c.id }); toast.success("Client removed"); }} className="p-1.5 rounded-lg hover:bg-sand text-mocha"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-mocha">
                    <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {c.email}</div>
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {c.phone}</div>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone grid grid-cols-3 gap-2 text-center">
                    <div><div className="text-sm font-semibold text-espresso">{s.count}</div><div className="text-[10px] text-mocha tracking-wider uppercase mt-0.5">Invoices</div></div>
                    <div><div className="text-sm font-semibold text-espresso">{formatMoney(s.paid).replace(/\.\d+$/, "")}</div><div className="text-[10px] text-mocha tracking-wider uppercase mt-0.5">Paid</div></div>
                    <div><div className="text-sm font-semibold text-espresso">{formatMoney(s.open).replace(/\.\d+$/, "")}</div><div className="text-[10px] text-mocha tracking-wider uppercase mt-0.5">Open</div></div>
                  </div>
                  <Link to="/invoices/new" className="btn-ghost w-full justify-center mt-4 text-xs"><FileText className="w-3.5 h-3.5" /> Create invoice</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && editing && (
        <ClientModal
          client={editing}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={(c) => {
            if (c.id) {
              dispatch({ type: "UPDATE_CLIENT", client: c });
              toast.success("Client updated");
            } else {
              dispatch({ type: "ADD_CLIENT", client: { ...c, id: helpers.newId("c") } });
              toast.success("Client added");
            }
            setOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ClientModal({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: (c: Client) => void }) {
  const [c, setC] = useState(client);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-6 max-w-lg w-full shadow-[var(--shadow-elev)] relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-sand"><X className="w-4 h-4 text-mocha" /></button>
        <h3 className="text-lg font-semibold text-espresso">{c.id ? "Edit client" : "Add client"}</h3>
        <div className="mt-5 space-y-3">
          <input className="input-field" placeholder="Contact name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <input className="input-field" placeholder="Company (optional)" value={c.company || ""} onChange={(e) => setC({ ...c, company: e.target.value })} />
          <input className="input-field" placeholder="Email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
          <input className="input-field" placeholder="Phone" value={c.phone || ""} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          <textarea className="input-field min-h-20 resize-none" placeholder="Billing address" value={c.address || ""} onChange={(e) => setC({ ...c, address: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => {
            if (!c.name.trim() || !c.email.includes("@")) return toast.error("Name and valid email required");
            onSave(c);
          }} className="btn-primary">{c.id ? "Save changes" : "Add client"}</button>
        </div>
      </div>
    </div>
  );
}