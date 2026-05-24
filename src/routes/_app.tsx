import { createFileRoute, Outlet, useNavigate, useRouterState, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/lib/logo";
import { GlobalSearch } from "@/lib/global-search";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const nav = [
  { to: "/invoices", label: "Invoices" },
  { to: "/clients", label: "Clients" },
  { to: "/receipts", label: "Receipts" },
];

function AppLayout() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!state.user) navigate({ to: "/login" });
  }, [state.user, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!state.user) return null;

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-stone no-print">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-6">
          <Logo to="/dashboard" />
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="nav-link" data-status={path.startsWith(n.to) ? "active" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 flex justify-end md:justify-center">
            <div className="hidden md:block w-full max-w-md"><GlobalSearch /></div>
          </div>
          <Link to="/invoices/new" className="btn-primary inline-flex" aria-label="New invoice">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New invoice</span>
          </Link>
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sand transition">
              <div className="w-8 h-8 rounded-full gradient-wine text-ivory flex items-center justify-center text-xs font-semibold">
                {state.user.initials}
              </div>
              <ChevronDown className="w-4 h-4 text-mocha" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-stone rounded-xl shadow-[var(--shadow-elev)] py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone">
                  <div className="text-sm font-semibold text-espresso">{state.user.name}</div>
                  <div className="text-xs text-mocha truncate">{state.user.email}</div>
                </div>
                <button onClick={() => { setMenuOpen(false); navigate({ to: "/settings" }); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand flex items-center gap-2.5 text-espresso">
                  <UserIcon className="w-4 h-4 text-mocha" /> Profile
                </button>
                <button onClick={() => { setMenuOpen(false); navigate({ to: "/settings" }); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand flex items-center gap-2.5 text-espresso">
                  <SettingsIcon className="w-4 h-4 text-mocha" /> Settings
                </button>
                <div className="divider my-1" />
                <button onClick={() => { dispatch({ type: "LOGOUT" }); navigate({ to: "/login" }); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand flex items-center gap-2.5 text-espresso">
                  <LogOut className="w-4 h-4 text-mocha" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden px-6 pb-3 flex items-center gap-2">
          <div className="flex-1"><GlobalSearch /></div>
        </div>
        <div className="md:hidden border-t border-stone px-2 flex overflow-x-auto scroll-hide">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="nav-link" data-status={path.startsWith(n.to) ? "active" : undefined}>
              {n.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}