import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint {
  index: number;
  count: number;
}

interface MessageCountChartProps {
  data: DataPoint[];
}

export default function MessageCountChart({ data }: MessageCountChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="border border-border border-glow rounded bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-terminal-cyan text-glow-cyan text-xs font-mono tracking-wider uppercase">
          ◈ Message Count
        </span>
        <span className="text-muted-foreground text-xs font-mono">
          ({data[data.length - 1]?.count ?? 0} msgs)
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
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
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 7%)",
                border: "1px solid hsl(120 50% 15%)",
                borderRadius: "2px",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                color: "hsl(120 100% 63%)",
                boxShadow: "0 0 8px hsl(120 100% 63% / 0.15)",
              }}
              labelFormatter={(v) => `Reply #${v}`}
              formatter={(value: number) => [`${value}`, "Messages"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(120 100% 63%)"
              strokeWidth={2}
              dot={{
                fill: "hsl(120 100% 63%)",
                r: 3,
                strokeWidth: 0,
              }}
              activeDot={{
                fill: "hsl(180 100% 45%)",
                r: 5,
                strokeWidth: 0,
              }}
              style={{
                filter: "drop-shadow(0 0 4px hsl(120 100% 63% / 0.5))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
