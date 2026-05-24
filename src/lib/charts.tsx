import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
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
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
          cursor={{ stroke: "#A85C68", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <Area type="monotone" dataKey="value" stroke="#7B3340" strokeWidth={2.5} fill="url(#wineFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}