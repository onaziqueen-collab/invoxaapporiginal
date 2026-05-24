import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Users, ReceiptText, Check, CircleDot } from "lucide-react";
import { Logo, LogoMark, Wordmark } from "@/lib/logo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { state } = useStore();
  const workspaceHref = state.user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-stone">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center">
          <Logo to="/" />
          <nav className="hidden md:flex items-center gap-1 ml-10">
            <a href="#features" className="nav-link">Features</a>
            <Link to={workspaceHref} className="nav-link">Workspace</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </nav>
          <div className="flex-1" />
          <Link to="/signup" className="btn-primary inline-flex">
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-mocha bg-sand border border-stone rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-wine" />
            Built for Nigerian freelancers & studios
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05] text-espresso">
            Modern billing for<br />independent professionals.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-mocha leading-relaxed max-w-2xl">
            Create invoices, manage clients and track payments from one streamlined workspace.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary inline-flex">
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={workspaceHref} className="btn-ghost inline-flex">View Workspace</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mocha">
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-wine" /> No credit card required</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-wine" /> Naira-native, VAT-ready</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-wine" /> Receipts in one click</span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 md:mt-20">
          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-stone bg-[color-mix(in_oklab,var(--sand)_55%,var(--ivory))]">
        <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-wine">What's inside</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-espresso">
              The essentials, thoughtfully arranged.
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="Invoice Tracking"
              body="Monitor invoice progress from draft to paid."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Client Management"
              body="Manage reusable client records and billing history."
            />
            <FeatureCard
              icon={<ReceiptText className="w-5 h-5" />}
              title="Receipt Generation"
              body="Convert completed invoices into downloadable receipts."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-stone">
        <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-espresso max-w-3xl mx-auto leading-[1.1]">
            Built for modern freelancers and small businesses.
          </h2>
          <p className="mt-5 text-lg text-mocha max-w-xl mx-auto">
            Organize billing workflows with clarity and confidence.
          </p>
          <div className="mt-9">
            <Link to={workspaceHref} className="btn-primary inline-flex">
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone bg-ivory">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <Wordmark size={16} />
          </div>
          <p className="text-xs text-mocha">© {new Date().getFullYear()} Invoxa. Crafted for independent work.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group bg-[var(--surface)] border border-stone rounded-2xl p-6 transition hover:border-[color-mix(in_oklab,var(--wine)_40%,var(--stone))] hover:shadow-[var(--shadow-card)]">
      <div className="w-10 h-10 rounded-lg bg-sand border border-stone flex items-center justify-center text-wine group-hover:bg-ivory transition">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-espresso tracking-[-0.01em]">{title}</h3>
      <p className="mt-2 text-sm text-mocha leading-relaxed">{body}</p>
    </div>
  );
}

/* ---------- Dashboard preview mock ---------- */

function DashboardPreview() {
  return (
    <div
      className="relative rounded-2xl border border-stone bg-[var(--surface)] overflow-hidden"
      style={{ boxShadow: "var(--shadow-elev)" }}
    >
      {/* Browser-ish chrome */}
      <div className="flex items-center gap-2 px-4 h-9 border-b border-stone bg-[color-mix(in_oklab,var(--sand)_70%,var(--ivory))]">
        <span className="w-2.5 h-2.5 rounded-full bg-[color-mix(in_oklab,var(--wine)_25%,var(--stone))]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[color-mix(in_oklab,var(--wine)_15%,var(--stone))]" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone" />
        <span className="ml-3 text-[11px] text-mocha font-medium">app.invoxa.ng / dashboard</span>
      </div>

      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="hidden md:flex col-span-2 border-r border-stone p-4 flex-col gap-1">
          <div className="flex items-center gap-2 mb-4">
            <LogoMark size={20} />
            <Wordmark size={14} />
          </div>
          {["Dashboard", "Invoices", "Clients", "Receipts", "Settings"].map((l, i) => (
            <div
              key={l}
              className={
                "text-xs px-2.5 py-1.5 rounded-md " +
                (i === 0 ? "bg-sand text-wine font-medium" : "text-mocha")
              }
            >
              {l}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="col-span-12 md:col-span-10 p-5 md:p-7 space-y-5">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-mocha">Good morning, Alex</p>
              <h3 className="text-xl md:text-2xl font-semibold text-espresso tracking-[-0.01em]">Dashboard</h3>
            </div>
            <div className="hidden sm:inline-flex btn-primary text-xs">+ New invoice</div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricMock label="Revenue snapshot" value="₦4,820,000" delta="+12.4%" />
            <MetricMock label="Outstanding" value="₦1,140,500" delta="3 pending" />
            <MetricMock label="Paid this month" value="₦3,680,000" delta="+8 invoices" />
            <MetricMock label="Active clients" value="24" delta="+2 new" />
          </div>

          {/* Chart + Pipeline */}
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 rounded-xl border border-stone p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-espresso">Revenue</p>
                <p className="text-[11px] text-mocha">Last 6 months</p>
              </div>
              <MockChart />
            </div>
            <div className="rounded-xl border border-stone p-4">
              <p className="text-sm font-medium text-espresso">Invoice pipeline</p>
              <div className="mt-4 space-y-3">
                <PipelineRow label="Draft" count={3} pct={20} tone="stone" />
                <PipelineRow label="Sent" count={6} pct={45} tone="mocha" />
                <PipelineRow label="Paid" count={12} pct={75} tone="wine" />
                <PipelineRow label="Overdue" count={1} pct={10} tone="wine-deep" />
              </div>
            </div>
          </div>

          {/* Client activity */}
          <div className="rounded-xl border border-stone overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone">
              <p className="text-sm font-medium text-espresso">Recent activity</p>
              <p className="text-[11px] text-mocha">View all</p>
            </div>
            <div className="divide-y divide-[var(--stone)]">
              <ActivityRow client="Lumen Studios" invoice="INV-1042" amount="₦620,000" status="Paid" />
              <ActivityRow client="Northwind Co." invoice="INV-1041" amount="₦284,500" status="Sent" />
              <ActivityRow client="Kano Textiles" invoice="INV-1040" amount="₦1,120,000" status="Paid" />
              <ActivityRow client="Ade & Partners" invoice="INV-1039" amount="₦96,750" status="Draft" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricMock({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border border-stone p-3.5">
      <p className="text-[11px] uppercase tracking-wider text-mocha">{label}</p>
      <p className="mt-1.5 text-base md:text-lg font-semibold text-espresso tracking-[-0.01em]">{value}</p>
      <p className="mt-0.5 text-[11px] text-wine">{delta}</p>
    </div>
  );
}

function MockChart() {
  const points = [22, 34, 28, 46, 40, 58, 52, 66, 60, 72, 68, 84];
  const max = 90;
  const w = 100;
  const h = 38;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(h - (p / max) * h).toFixed(2)}`)
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-24">
        <defs>
          <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wine)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--wine)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg)" />
        <path d={path} fill="none" stroke="var(--wine)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-mocha">
        {["Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function PipelineRow({ label, count, pct, tone }: { label: string; count: number; pct: number; tone: "stone" | "mocha" | "wine" | "wine-deep" }) {
  const color =
    tone === "wine" ? "var(--wine)" :
    tone === "wine-deep" ? "var(--wine-deep)" :
    tone === "mocha" ? "var(--mocha)" : "var(--stone)";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-mocha">{label}</span>
        <span className="text-espresso font-medium">{count}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-sand overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ActivityRow({ client, invoice, amount, status }: { client: string; invoice: string; amount: string; status: "Paid" | "Sent" | "Draft" }) {
  const tone =
    status === "Paid" ? { bg: "color-mix(in oklab, var(--wine) 12%, var(--ivory))", fg: "var(--wine)" } :
    status === "Sent" ? { bg: "var(--sand)", fg: "var(--mocha)" } :
    { bg: "var(--sand)", fg: "var(--mocha)" };
  return (
    <div className="flex items-center px-4 py-2.5 text-xs">
      <div className="w-7 h-7 rounded-full bg-sand border border-stone flex items-center justify-center mr-3">
        <CircleDot className="w-3.5 h-3.5 text-wine" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-espresso font-medium truncate">{client}</p>
        <p className="text-mocha">{invoice}</p>
      </div>
      <span className="text-espresso font-medium mr-3 hidden sm:inline">{amount}</span>
      <span
        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ background: tone.bg, color: tone.fg }}
      >
        {status}
      </span>
    </div>
  );
}