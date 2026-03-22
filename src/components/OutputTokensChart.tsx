import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint {
  index: number;
  tokens: number;
}

interface OutputTokensChartProps {
  data: DataPoint[];
}

export default function OutputTokensChart({ data }: OutputTokensChartProps) {
  if (data.length === 0) return null;

  // Build cumulative output tokens
  const cumulative = data.reduce<DataPoint[]>((acc, point) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].tokens : 0;
    acc.push({ index: point.index, tokens: prev + point.tokens });
    return acc;
  }, []);

  return (
    <div className="border border-border border-glow rounded bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-terminal-cyan text-glow-cyan text-xs font-mono tracking-wider uppercase">
          ◈ Output Tokens
        </span>
        <span className="text-muted-foreground text-xs font-mono">
          ({cumulative[cumulative.length - 1]?.tokens ?? 0} total generated)
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
                border: "1px solid hsl(160 100% 30%)",
                borderRadius: "2px",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                color: "hsl(160 100% 60%)",
                boxShadow: "0 0 8px hsl(160 100% 50% / 0.15)",
              }}
              labelFormatter={(v) => `Reply #${v}`}
              formatter={(value: number) => [`${value}`, "Total Generated"]}
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="hsl(160 100% 50%)"
              strokeWidth={2}
              dot={{
                fill: "hsl(160 100% 50%)",
                r: 3,
                strokeWidth: 0,
              }}
              activeDot={{
                fill: "hsl(140 100% 60%)",
                r: 5,
                strokeWidth: 0,
              }}
              style={{
                filter: "drop-shadow(0 0 4px hsl(160 100% 50% / 0.5))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
