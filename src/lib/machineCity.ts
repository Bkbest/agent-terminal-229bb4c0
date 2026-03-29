/**
 * Machine City — Top-down microchip / circuit-board layout
 * Each thread = a chip module with an agent core inside.
 * Traces (circuits) connect the modules.
 */

const AGENT_CORES = ["◉", "◎", "●", "◈", "⬡", "▣", "⬢", "◇", "○", "▢"];

// Chip module patterns (top-down, 7 wide × 5 tall)
const MODULE_STYLES = [
  // Style 0 — Standard IC
  [
    "┌─┤├─┐",
    "│ ░░░ │",
    "├ ◉◉◉ ┤",
    "│ ░░░ │",
    "└─┤├─┘",
  ],
  // Style 1 — Dense chip
  [
    "╔═╤╤═╗",
    "║▓▓▓▓▓║",
    "╟ ◉◉◉ ╢",
    "║▓▓▓▓▓║",
    "╚═╧╧═╝",
  ],
  // Style 2 — Light processor
  [
    "┏━┯┯━┓",
    "┃ ·░· ┃",
    "┠ ◉◉◉ ┨",
    "┃ ·░· ┃",
    "┗━┷┷━┛",
  ],
  // Style 3 — Memory module
  [
    "╒═╤╤═╕",
    "│▒ ▒ ▒│",
    "╞ ◉◉◉ ╡",
    "│▒ ▒ ▒│",
    "╘═╧╧═╛",
  ],
];

function pickStyle(index: number) {
  return MODULE_STYLES[index % MODULE_STYLES.length];
}

function pickCore(index: number): string {
  return AGENT_CORES[index % AGENT_CORES.length];
}

function renderModule(index: number): string[] {
  const style = pickStyle(index);
  const core = pickCore(index);
  return style.map((line) => line.replace(/◉/g, core));
}

// Horizontal trace connecting modules
function hTrace(len: number): string {
  if (len <= 0) return "";
  const mid = Math.floor(len / 2);
  let t = "";
  for (let i = 0; i < len; i++) {
    t += i === mid ? "┼" : "─";
  }
  return t;
}

export function generateMachineCity(threadCount: number): string[] {
  const out: string[] = [];
  const n = Math.max(threadCount, 0);

  out.push("");
  out.push("  ⚡ M A C H I N E   C I T Y  —  T O P   V I E W ⚡");
  out.push("  ════════════════════════════════════════════════════");
  out.push("  ┌ CIRCUIT BOARD LAYOUT ─────────────────────────┐");
  out.push("  │  Each module = 1 thread  ·  Core = agent      │");
  out.push("  └────────────────────────────────────────────────┘");
  out.push("");

  if (n === 0) {
    out.push("       ┌──────────────────────────────┐");
    out.push("       │                              │");
    out.push("       │   ░░░ NO MODULES FOUND ░░░   │");
    out.push("       │   Use 'new' to deploy an     │");
    out.push("       │   agent onto the board.      │");
    out.push("       │                              │");
    out.push("       └──────────────────────────────┘");
    out.push("");
    return out;
  }

  // Layout: grid of modules, max 4 per row
  const perRow = Math.min(n, 4);
  const moduleW = 7;
  const traceW = 3;

  for (let rowStart = 0; rowStart < n; rowStart += perRow) {
    const rowCount = Math.min(perRow, n - rowStart);
    const modules = [];
    for (let i = 0; i < rowCount; i++) {
      modules.push(renderModule(rowStart + i));
    }

    // Vertical traces above (except first row)
    if (rowStart > 0) {
      let vLine = "  ";
      for (let i = 0; i < rowCount; i++) {
        const pad = Math.floor((moduleW - 1) / 2);
        vLine += " ".repeat(pad) + "│" + " ".repeat(moduleW - pad - 1);
        if (i < rowCount - 1) vLine += " ".repeat(traceW);
      }
      out.push(vLine);
      out.push(vLine);
    }

    // Render module rows (all 5 lines)
    const height = modules[0].length;
    for (let line = 0; line < height; line++) {
      let row = "  ";
      for (let i = 0; i < rowCount; i++) {
        row += modules[i][line];
        // Horizontal trace between modules on middle line
        if (i < rowCount - 1) {
          if (line === Math.floor(height / 2)) {
            row += hTrace(traceW);
          } else {
            row += " ".repeat(traceW);
          }
        }
      }
      out.push(row);
    }
  }

  // Bottom bus bar
  out.push("");
  const busW = Math.min(perRow, n) * (moduleW + traceW) - traceW + 2;
  out.push("  " + "═".repeat(Math.max(busW, 20)));
  out.push("  ╠" + "═".repeat(Math.max(busW - 2, 18)) + "╣");
  out.push("  ║" + " DATA BUS ".padStart(Math.floor((Math.max(busW - 2, 18) + 10) / 2)).padEnd(Math.max(busW - 2, 18)) + "║");
  out.push("  ╠" + "═".repeat(Math.max(busW - 2, 18)) + "╣");
  out.push("  " + "═".repeat(Math.max(busW, 20)));

  // Stats
  out.push("");
  out.push(`  Modules online: ${n}  ·  Agents deployed: ${n}`);

  if (n >= 10) {
    out.push("  ⚠  High-density cluster — parallel processing active!");
  } else if (n >= 5) {
    out.push("  ◈  Multi-core array — agents are synchronizing.");
  } else if (n >= 2) {
    out.push("  ○  Dual-module config — expansion slots available.");
  } else {
    out.push("  ◇  Single-core — awaiting additional deployments.");
  }

  // Pin-out decoration
  out.push("");
  out.push("  ·  ┼  ·  ┼  ·  ┼  ·  ┼  ·  ┼  ·  ┼  ·  ┼  ·");
  out.push("  PIN GRID ARRAY  ·  REV " + new Date().getFullYear());
  out.push("");

  return out;
}
