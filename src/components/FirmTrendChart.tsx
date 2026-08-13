import { useMemo } from "react";
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";

type Case = {
  status: string;
  payout_date: string | null;
  created_at: string;
  amount: number | string | null;
};

const FirmTrendChart = ({ cases }: { cases: Case[] }) => {
  const data = useMemo(() => {
    const buckets = new Map<string, { approved: number; total: number }>();
    cases.forEach((c) => {
      const dateStr = c.payout_date || c.created_at;
      if (!dateStr) return;
      const month = format(new Date(dateStr), "yyyy-MM");
      const bucket = buckets.get(month) || { approved: 0, total: 0 };
      bucket.total += 1;
      if (c.status === "approved") bucket.approved += 1;
      buckets.set(month, bucket);
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, b]) => ({
        month: format(parseISO(`${month}-01`), "MMM yyyy"),
        rate: Number(((b.approved / b.total) * 100).toFixed(1)),
      }));
  }, [cases]);

  if (data.length < 3) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
        Not enough data yet for a trend
      </div>
    );
  }

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: any) => [`${value}%`, "Approval rate"]}
          />
          <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FirmTrendChart;
