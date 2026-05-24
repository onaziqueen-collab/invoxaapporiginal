import { Link } from "@tanstack/react-router";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="30" width="26" height="10" rx="2" fill="#C49099" />
      <rect x="10" y="19" width="26" height="10" rx="2" fill="#A85C68" />
      <path d="M8 8 H30 L38 16 V28 H8 V8 Z" fill="#7B3340" />
      <path d="M30 8 L38 16 H30 V8 Z" fill="#5C2330" />
    </svg>
  );
}

export function Wordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.03em",
        color: light ? "var(--ivory)" : "var(--espresso)",
        lineHeight: 1,
      }}
    >
      Invo<span style={{ color: light ? "#E8B4BC" : "var(--wine)" }}>xa</span>
    </span>
  );
}

export function Logo({ to = "/dashboard", size = 28, word = 20, light = false }: { to?: string; size?: number; word?: number; light?: boolean }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 group">
      <LogoMark size={size} />
      <Wordmark size={word} light={light} />
    </Link>
  );
}