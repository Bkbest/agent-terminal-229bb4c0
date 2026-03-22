import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint {
  index: number;
  tokens: number;
}

interface TotalTokensChartProps {
  data: DataPoint[];
}

export default function TotalTokensChart({ data }: TotalTokensChartProps) {
  if (data.length === 0) return null;

  // Build cumulative data
  const cumulative = data.reduce<DataPoint[]>((acc, point) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].tokens : 0;
    acc.push({ index: point.index, tokens: prev + point.tokens });
    return acc;
  }, []);

  return (
    <div className="border border-border border-glow rounded bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-terminal-cyan text-glow-cyan text-xs font-mono tracking-wider uppercase">
          ◈ Total Tokens
        </span>
        <span className="text-muted-foreground text-xs font-mono">
          ({cumulative[cumulative.length - 1]?.tokens ?? 0} total)
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulative} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="hsl(120 50% 15%)"
              vertical={false}
            />
            <XAxis
              dataKey="index"
              tick={{ fill: "hsl(120 40% 40%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "hsl(120 50% 15%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(120 40% 40%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "hsl(120 50% 15%)" }}
              tickLine={false}
              allowDecimals={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 7%)",
                border: "1px solid hsl(280 100% 40%)",
                borderRadius: "2px",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                color: "hsl(280 100% 70%)",
                boxShadow: "0 0 8px hsl(280 100% 50% / 0.15)",
              }}
              labelFormatter={(v) => `Reply #${v}`}
              formatter={(value: number) => [`${value}`, "Total Tokens"]}
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="hsl(280 100% 70%)"
              strokeWidth={2}
              dot={{
                fill: "hsl(280 100% 70%)",
                r: 3,
                strokeWidth: 0,
              }}
              activeDot={{
                fill: "hsl(300 100% 75%)",
                r: 5,
                strokeWidth: 0,
              }}
              style={{
                filter: "drop-shadow(0 0 4px hsl(280 100% 70% / 0.5))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
