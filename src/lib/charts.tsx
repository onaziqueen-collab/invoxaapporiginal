import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function RevenueChart({ data, currency = "NGN" }: { data: { label: string; value: number }[]; currency?: string }) {
  const fmt = (v: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(v || 0);
  const fmtCompact = (v: number) => {
    const sym = (0).toLocaleString("en-NG", { style: "currency", currency }).replace(/[\d.,\s]/g, "");
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}k`;
    return `${sym}${v}`;
  };
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="wineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B3340" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#7B3340" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E6DDD8" strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={fmtCompact} fontSize={11} width={56} />
        <Tooltip
          formatter={(v: number) => [fmt(v), "Revenue"]}
          cursor={{ stroke: "#A85C68", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <Area type="monotone" dataKey="value" stroke="#7B3340" strokeWidth={2.5} fill="url(#wineFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}