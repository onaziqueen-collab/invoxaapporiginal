import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string; // ISO date
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number; // percent
  notes: string;
  status: InvoiceStatus;
  paymentMethod: string;
  paidDate?: string;
  archived?: boolean;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Receipt {
  id: string;
  number: string;
  invoiceId: string;
  amount: number;
  paidDate: string;
  method: string;
}

export interface BusinessProfile {
  name: string;
  email: string;
  address: string;
  taxId: string;
  currency: string;
  defaultTax: number;
  logoDataUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface AppState {
  user: User | null;
  business: BusinessProfile;
  clients: Client[];
  invoices: Invoice[];
  receipts: Receipt[];
}

const STORAGE_KEY = "invoxa_state_v1";

const emptyBusiness: BusinessProfile = {
  name: "",
  email: "",
  address: "",
  taxId: "",
  currency: "USD",
  defaultTax: 0,
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function isoDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number) {
  return isoDaysFromNow(-days);
}

function seededAlexState(): Omit<AppState, "user"> {
  const clients: Client[] = [
    { id: "c_north", name: "Maya Okafor", company: "Northwind Studio", email: "maya@northwind.co", phone: "+1 415 555 0142", address: "221 Folsom St, San Francisco, CA" },
    { id: "c_lumen", name: "Daniel Ferreira", company: "Lumen & Co.", email: "daniel@lumenco.io", phone: "+44 20 7946 0021", address: "12 Charlotte Rd, London EC2A" },
    { id: "c_arlo", name: "Sienna Park", company: "Arlo Type Foundry", email: "sienna@arlotype.com", phone: "+1 718 555 0188", address: "55 Berry St, Brooklyn, NY" },
    { id: "c_orbit", name: "Jules Marchetti", company: "Orbit Coffee Roasters", email: "jules@orbitcoffee.com", phone: "+39 02 5555 113", address: "Via Tortona 27, Milan" },
    { id: "c_haven", name: "Priya Iyer", company: "Haven Wellness", email: "priya@havenwellness.co", phone: "+91 22 5555 1290", address: "Bandra West, Mumbai" },
    { id: "c_meri", name: "Tomás Aguilar", company: "Meridian Bicycles", email: "tomas@meridianbikes.com", phone: "+34 93 555 7711", address: "Carrer de Pau Claris 88, Barcelona" },
    { id: "c_kit", name: "Hannah Lindqvist", company: "Kit & Kiln Ceramics", email: "hannah@kitandkiln.se", phone: "+46 8 555 9821", address: "Götgatan 14, Stockholm" },
  ];

  const mk = (
    n: number,
    clientId: string,
    issueAgo: number,
    dueIn: number,
    items: InvoiceItem[],
    status: InvoiceStatus,
    paidAgo?: number,
  ): Invoice => ({
    id: uid("inv"),
    number: `INV-2026-${String(n).padStart(4, "0")}`,
    clientId,
    issueDate: isoDaysAgo(issueAgo),
    dueDate: isoDaysFromNow(dueIn),
    items,
    taxRate: 8.5,
    notes: "Thank you for your partnership. Payment via wire or card accepted.",
    status,
    paymentMethod: "Wire transfer",
    paidDate: paidAgo !== undefined ? isoDaysAgo(paidAgo) : undefined,
  });

  const item = (description: string, quantity: number, rate: number): InvoiceItem => ({
    id: uid("it"), description, quantity, rate,
  });

  const invoices: Invoice[] = [
    mk(127, "c_north", 2, 12, [item("Brand identity system — Q2 retainer", 1, 4800), item("Landing page revisions", 6, 180)], "pending"),
    mk(126, "c_lumen", 6, 8, [item("Mobile app design sprint", 1, 6200), item("Prototype testing", 8, 145)], "pending"),
    mk(125, "c_arlo", 14, -2, [item("Variable font production", 1, 3400)], "overdue"),
    mk(124, "c_orbit", 24, -8, [item("E-commerce build — Phase 2", 1, 5200), item("Hosting setup", 1, 320)], "overdue"),
    mk(123, "c_haven", 18, -10, [item("Wellness platform UI kit", 1, 4100)], "paid", 7),
    mk(122, "c_meri", 31, -16, [item("Annual maintenance contract", 1, 7800)], "paid", 14),
    mk(121, "c_kit", 45, -30, [item("Packaging design system", 1, 5600), item("Photography direction", 1, 1200)], "paid", 22),
    mk(120, "c_north", 60, -45, [item("Brand identity system — Q1 retainer", 1, 4800)], "paid", 38),
    mk(119, "c_lumen", 75, -60, [item("Design audit & strategy", 1, 3900)], "paid", 52),
    mk(118, "c_orbit", 92, -77, [item("Original E-commerce build", 1, 9400)], "paid", 70),
    mk(128, "c_arlo", 0, 14, [item("Specimen site refresh", 1, 2100)], "draft"),
    mk(129, "c_haven", 1, 21, [item("Workshop landing page", 1, 1800)], "draft"),
  ];

  const receipts: Receipt[] = invoices
    .filter((i) => i.status === "paid")
    .map((i, idx) => ({
      id: uid("rcp"),
      number: `RCP-2026-${String(40 + idx).padStart(4, "0")}`,
      invoiceId: i.id,
      amount: invoiceTotal(i),
      paidDate: i.paidDate!,
      method: i.paymentMethod,
    }));

  const business: BusinessProfile = {
    name: "Morgan Studio",
    email: "hello@morganstudio.co",
    address: "84 Grand Street, New York, NY 10013",
    taxId: "EIN 88-1247991",
    currency: "USD",
    defaultTax: 8.5,
  };

  return { business, clients, invoices, receipts };
}

export function invoiceSubtotal(inv: Invoice) {
  return inv.items.reduce((s, it) => s + it.quantity * it.rate, 0);
}
export function invoiceTax(inv: Invoice) {
  return invoiceSubtotal(inv) * (inv.taxRate / 100);
}
export function invoiceTotal(inv: Invoice) {
  return invoiceSubtotal(inv) + invoiceTax(inv);
}

type Action =
  | { type: "LOGIN"; user: User; seedAlex: boolean }
  | { type: "LOGOUT" }
  | { type: "ADD_CLIENT"; client: Client }
  | { type: "UPDATE_CLIENT"; client: Client }
  | { type: "DELETE_CLIENT"; id: string }
  | { type: "ADD_INVOICE"; invoice: Invoice }
  | { type: "UPDATE_INVOICE"; invoice: Invoice }
  | { type: "DELETE_INVOICE"; id: string }
  | { type: "MARK_PAID"; id: string; method?: string }
  | { type: "ARCHIVE_INVOICE"; id: string }
  | { type: "UPDATE_BUSINESS"; patch: Partial<BusinessProfile> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN": {
      if (action.seedAlex) {
        return { user: action.user, ...seededAlexState() };
      }
      return {
        user: action.user,
        business: { ...emptyBusiness, name: action.user.name + " Studio", email: action.user.email },
        clients: [],
        invoices: [],
        receipts: [],
      };
    }
    case "LOGOUT":
      return { ...state, user: null };
    case "ADD_CLIENT":
      return { ...state, clients: [action.client, ...state.clients] };
    case "UPDATE_CLIENT":
      return { ...state, clients: state.clients.map((c) => (c.id === action.client.id ? action.client : c)) };
    case "DELETE_CLIENT":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id) };
    case "ADD_INVOICE":
      return { ...state, invoices: [action.invoice, ...state.invoices] };
    case "UPDATE_INVOICE":
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.invoice.id ? action.invoice : i)) };
    case "DELETE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.filter((i) => i.id !== action.id),
        receipts: state.receipts.filter((r) => r.invoiceId !== action.id),
      };
    case "ARCHIVE_INVOICE":
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.id ? { ...i, archived: true } : i)) };
    case "MARK_PAID": {
      const inv = state.invoices.find((i) => i.id === action.id);
      if (!inv) return state;
      const paidDate = new Date().toISOString().slice(0, 10);
      const updated: Invoice = { ...inv, status: "paid", paidDate, paymentMethod: action.method || inv.paymentMethod };
      const existing = state.receipts.find((r) => r.invoiceId === inv.id);
      const receipts = existing
        ? state.receipts
        : [
            {
              id: uid("rcp"),
              number: `RCP-2026-${String(100 + state.receipts.length).padStart(4, "0")}`,
              invoiceId: inv.id,
              amount: invoiceTotal(updated),
              paidDate,
              method: updated.paymentMethod,
            },
            ...state.receipts,
          ];
      return { ...state, invoices: state.invoices.map((i) => (i.id === inv.id ? updated : i)), receipts };
    }
    case "UPDATE_BUSINESS":
      return { ...state, business: { ...state.business, ...action.patch } };
    default:
      return state;
  }
}

const initialState: AppState = {
  user: null,
  business: emptyBusiness,
  clients: [],
  invoices: [],
  receipts: [],
};

const StoreCtx = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  helpers: {
    newId: typeof uid;
    nextInvoiceNumber: () => string;
  };
} | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return JSON.parse(raw) as AppState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      helpers: {
        newId: uid,
        nextInvoiceNumber: () => {
          const nums = state.invoices
            .map((i) => parseInt(i.number.split("-").pop() || "0", 10))
            .filter((n) => !Number.isNaN(n));
          const next = (nums.length ? Math.max(...nums) : 100) + 1;
          return `INV-2026-${String(next).padStart(4, "0")}`;
        },
      },
    }),
    [state],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function formatMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n || 0);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function statusMeta(s: InvoiceStatus) {
  switch (s) {
    case "paid": return { label: "Paid", cls: "status-paid", dot: "oklch(0.55 0.12 145)" };
    case "pending": return { label: "Pending", cls: "status-pending", dot: "oklch(0.62 0.16 65)" };
    case "overdue": return { label: "Overdue", cls: "status-overdue", dot: "oklch(0.52 0.18 25)" };
    case "draft": return { label: "Draft", cls: "status-draft", dot: "var(--mocha)" };
  }
}