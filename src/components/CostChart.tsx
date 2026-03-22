import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Approximate industry-average pricing (GPT-4o tier)
const INPUT_COST_PER_TOKEN = 2.5 / 1_000_000;   // $2.50 per 1M input tokens
const OUTPUT_COST_PER_TOKEN = 10.0 / 1_000_000;  // $10.00 per 1M output tokens

interface TokenDataPoint {
  index: number;
  tokens: number;
}

interface CostChartProps {
  inputTokens: TokenDataPoint[];
  outputTokens: TokenDataPoint[];
}

interface CostPoint {
  index: number;
  cost: number;
}

export default function CostChart({ inputTokens, outputTokens }: CostChartProps) {
  if (inputTokens.length === 0 && outputTokens.length === 0) return null;

  const maxLen = Math.max(inputTokens.length, outputTokens.length);
  const cumulative: CostPoint[] = [];
  let runningCost = 0;

  for (let i = 0; i < maxLen; i++) {
    const inTok = inputTokens[i]?.tokens ?? 0;
    const outTok = outputTokens[i]?.tokens ?? 0;
    runningCost += inTok * INPUT_COST_PER_TOKEN + outTok * OUTPUT_COST_PER_TOKEN;
    cumulative.push({ index: i + 1, cost: parseFloat(runningCost.toFixed(6)) });
  }

  const totalCost = cumulative[cumulative.length - 1]?.cost ?? 0;

  return (
    <div className="border border-border border-glow rounded bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-terminal-cyan text-glow-cyan text-xs font-mono tracking-wider uppercase">
          ◈ Est. Cost
        </span>
        <span className="text-muted-foreground text-xs font-mono">
          (${totalCost.toFixed(4)})
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
              width={50}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 7%)",
                border: "1px solid hsl(50 100% 40%)",
                borderRadius: "2px",
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                color: "hsl(50 100% 65%)",
                boxShadow: "0 0 8px hsl(50 100% 50% / 0.15)",
              }}
              labelFormatter={(v) => `Reply #${v}`}
              formatter={(value: number) => [`$${value.toFixed(4)}`, "Cumulative Cost"]}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="hsl(50 100% 55%)"
              strokeWidth={2}
              dot={{
                fill: "hsl(50 100% 55%)",
                r: 3,
                strokeWidth: 0,
              }}
              activeDot={{
                fill: "hsl(60 100% 65%)",
                r: 5,
                strokeWidth: 0,
              }}
              style={{
                filter: "drop-shadow(0 0 4px hsl(50 100% 55% / 0.5))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
