import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, TrendingUp, Clock, CheckCircle2, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { useStore, formatMoney, formatDate, invoiceTotal, statusMeta } from "@/lib/store";
import { RevenueChart } from "@/lib/charts";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { state } = useStore();
  const nav = useNavigate();

  const active = state.invoices.filter((i) => !i.archived);
  const paid = active.filter((i) => i.status === "paid");
  const pending = active.filter((i) => i.status === "pending");
  const overdue = active.filter((i) => i.status === "overdue");
  const draft = active.filter((i) => i.status === "draft");
  const totalRevenue = paid.reduce((s, i) => s + invoiceTotal(i), 0);
  const pendingValue = pending.reduce((s, i) => s + invoiceTotal(i), 0);
  const overdueValue = overdue.reduce((s, i) => s + invoiceTotal(i), 0);

  const chartData = useMemo(() => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const now = new Date();
    const buckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets[`${d.getFullYear()}-${d.getMonth()}`] = 0;
    }
    paid.forEach((inv) => {
      if (!inv.paidDate) return;
      const d = new Date(inv.paidDate);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k in buckets) buckets[k] += invoiceTotal(inv);
    });
    return Object.keys(buckets).map((k) => {
      const m = parseInt(k.split("-")[1], 10);
      return { label: months[m], value: Math.round(buckets[k]) };
    });
  }, [paid]);

  const recent = [...active].sort((a, b) => (b.issueDate > a.issueDate ? 1 : -1)).slice(0, 6);

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    paid.forEach((i) => map.set(i.clientId, (map.get(i.clientId) || 0) + invoiceTotal(i)));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, amount]) => ({ client: state.clients.find((c) => c.id === id), amount }));
  }, [paid, state.clients]);

  const isEmpty = active.length === 0;

  if (isEmpty) {
    return (
      <div className="fade-up">
        <Header business={state.business.name} userName={state.user!.name} />
        <div className="card-elev p-12 text-center mt-8 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-sand mx-auto flex items-center justify-center mb-5">
            <Sparkles className="w-6 h-6 text-wine" />
          </div>
          <h2 className="text-xl font-semibold text-espresso">Your workspace is ready</h2>
          <p className="text-sm text-mocha mt-2 max-w-md mx-auto">
            Add your first client and send your first invoice. Everything you do here updates this dashboard in real time.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/invoices/new" className="btn-primary">Create your first invoice</Link>
            <Link to="/clients" className="btn-ghost">Add a client</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up space-y-8">
      <Header business={state.business.name} userName={state.user!.name} />

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue Snapshot"
          value={formatMoney(totalRevenue, state.business.currency)}
          sub={`${paid.length} paid invoices`}
          icon={<TrendingUp className="w-4 h-4" />}
          onClick={() => nav({ to: "/invoices", search: { status: "paid" } as never })}
        />
        <MetricCard
          label="Pending"
          value={formatMoney(pendingValue, state.business.currency)}
          sub={`${pending.length} awaiting payment`}
          icon={<Clock className="w-4 h-4" />}
          onClick={() => nav({ to: "/invoices", search: { status: "pending" } as never })}
        />
        <MetricCard
          label="Overdue"
          value={formatMoney(overdueValue, state.business.currency)}
          sub={`${overdue.length} need follow-up`}
          icon={<AlertTriangle className="w-4 h-4" />}
          tone="warn"
          onClick={() => nav({ to: "/invoices", search: { status: "overdue" } as never })}
        />
        <MetricCard
          label="Drafts"
          value={String(draft.length)}
          sub="Ready to send"
          icon={<FileText className="w-4 h-4" />}
          onClick={() => nav({ to: "/invoices", search: { status: "draft" } as never })}
        />
      </div>

      {/* Charts + Pipeline */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-elev p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-espresso">Billing Overview</h3>
              <p className="text-xs text-mocha mt-0.5">Last 12 months · paid invoices</p>
            </div>
            <Link to="/invoices" className="text-xs text-wine inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <RevenueChart data={chartData} />
        </div>
        <div className="card-elev p-6">
          <h3 className="text-sm font-semibold text-espresso">Invoice Pipeline</h3>
          <p className="text-xs text-mocha mt-0.5">Distribution by status</p>
          <div className="mt-6 space-y-4">
            <Pipeline label="Paid" count={paid.length} total={active.length} amount={totalRevenue} color="oklch(0.55 0.12 145)" />
            <Pipeline label="Pending" count={pending.length} total={active.length} amount={pendingValue} color="oklch(0.62 0.16 65)" />
            <Pipeline label="Overdue" count={overdue.length} total={active.length} amount={overdueValue} color="oklch(0.52 0.18 25)" />
            <Pipeline label="Draft" count={draft.length} total={active.length} amount={0} color="var(--mocha)" />
          </div>
        </div>
      </div>

      {/* Recently updated + Top clients */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-elev p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-espresso">Recently Updated</h3>
              <p className="text-xs text-mocha mt-0.5">Pick up where you left off</p>
            </div>
            <Link to="/invoices" className="text-xs text-wine inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--stone)]">
            {recent.length === 0 && <div className="py-10 text-center text-sm text-mocha">Nothing here yet.</div>}
            {recent.map((i) => {
              const c = state.clients.find((x) => x.id === i.clientId);
              const meta = statusMeta(i.status);
              return (
                <Link key={i.id} to={`/invoices/${i.id}`} className="flex items-center gap-4 py-3.5 table-row -mx-2 px-2 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-sand flex items-center justify-center text-[10px] font-semibold text-wine">
                    {(c?.company || c?.name || "??").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-espresso truncate">{i.number} · {c?.company || c?.name}</div>
                    <div className="text-xs text-mocha mt-0.5">Due {formatDate(i.dueDate)}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-espresso">{formatMoney(invoiceTotal(i), state.business.currency)}</div>
                    <span className={`badge-pill ${meta.cls} mt-1`}>{meta.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card-elev p-6">
          <h3 className="text-sm font-semibold text-espresso">Top Clients</h3>
          <p className="text-xs text-mocha mt-0.5">By lifetime paid revenue</p>
          <div className="mt-5 space-y-3">
            {topClients.length === 0 && <div className="text-sm text-mocha py-6 text-center">No paid invoices yet.</div>}
            {topClients.map(({ client, amount }, idx) => client && (
              <div key={client.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-sand transition">
                <div className="text-xs font-semibold text-mocha w-4">{idx + 1}</div>
                <div className="w-8 h-8 rounded-full bg-[oklch(0.92_0.03_18)] text-wine text-[10px] font-semibold flex items-center justify-center">
                  {(client.company || client.name).split(/\s+/).slice(0, 2).map((s) => s[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-espresso truncate">{client.company || client.name}</div>
                  <div className="text-xs text-mocha truncate">{client.email}</div>
                </div>
                <div className="text-sm font-semibold text-espresso">{formatMoney(amount, state.business.currency)}</div>
              </div>
            ))}
          </div>
          <Link to="/clients" className="btn-ghost w-full justify-center mt-5">Manage clients</Link>
        </div>
      </div>
    </div>
  );
}

function Header({ business, userName }: { business: string; userName: string }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        <p className="text-xs text-mocha tracking-wider uppercase">{today}</p>
        <h1 className="text-3xl font-semibold text-espresso mt-1">Good to see you, {userName.split(" ")[0]}.</h1>
        <p className="text-sm text-mocha mt-1">Here's what's happening at {business || "your studio"} today.</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, accent, tone, onClick }:
  { label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean; tone?: "warn"; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`card-elev clickable text-left p-5 flex flex-col gap-3 ${accent ? "bg-wine text-ivory" : ""}`}
      style={accent ? { background: "linear-gradient(135deg, var(--wine), var(--wine-deep))", color: "var(--ivory)", borderColor: "transparent" } : undefined}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold tracking-[0.14em] uppercase ${accent ? "opacity-80" : "text-mocha"}`}>{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-white/15" : tone === "warn" ? "bg-[oklch(0.95_0.05_25)] text-[var(--error)]" : "bg-sand text-wine"}`}>
          {icon}
        </span>
      </div>
      <div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className={`text-xs mt-1 ${accent ? "opacity-75" : "text-mocha"}`}>{sub}</div>
      </div>
    </button>
  );
}

function Pipeline({ label, count, total, amount, color }: { label: string; count: number; total: number; amount: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-espresso"><span className="dot" style={{ background: color }} />{label}</span>
        <span className="text-mocha text-xs">{count} · {amount ? formatMoney(amount) : "—"}</span>
      </div>
      <div className="h-1.5 rounded-full bg-sand mt-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}