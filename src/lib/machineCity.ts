/**
 * Machine City ASCII art generator — Matrix-style city visualization
 * Buildings represent threads; agents live inside them.
 */

const AGENT_FACES = ["◉", "◎", "●", "○", "◈", "◇", "▣", "▢", "⬡", "⬢"];
const BUILDING_TOPS = ["╔══╗", "┌──┐", "╭──╮", "┏━━┓", "╒══╕"];
const BUILDING_MIDS = ["║██║", "│▓▓│", "│░░│", "┃▒▒┃", "│▇▇│"];
const BUILDING_WINS = ["║◉ ║", "│◎ │", "│● │", "┃◈ ┃", "│◇ │"];
const BUILDING_BOTS = ["╚══╝", "└──┘", "╰──╯", "┗━━┛", "╘══╛"];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function generateBuilding(index: number, height: number, hasAgent: boolean): string[] {
  const top = pickRandom(BUILDING_TOPS, index);
  const mid = pickRandom(BUILDING_MIDS, index);
  const win = pickRandom(BUILDING_WINS, index);
  const bot = pickRandom(BUILDING_BOTS, index);

  const lines: string[] = [top];
  for (let i = 0; i < height; i++) {
    // Put agent face in a random window
    if (hasAgent && i === Math.floor(height / 2)) {
      const face = pickRandom(AGENT_FACES, index);
      lines.push(win.replace(/[◉◎●◈◇]/, face));
    } else {
      lines.push(mid);
    }
  }
  lines.push(bot);
  return lines;
}

export function generateMachineCity(threadCount: number): string[] {
  const output: string[] = [];
  const count = Math.max(threadCount, 0);

  // Header
  output.push("");
  output.push("  ⚡ M A C H I N E   C I T Y ⚡");
  output.push("  ─────────────────────────────");
  output.push("");

  if (count === 0) {
    output.push("  The city is empty... no agents deployed.");
    output.push("  Use 'new' to create a thread and summon an agent.");
    output.push("");
    output.push("       ░░░░░░░░░░░░░░░░░░░░░░");
    output.push("       ░  ABANDONED SECTOR   ░");
    output.push("       ░░░░░░░░░░░░░░░░░░░░░░");
    output.push("");
    return output;
  }

  // Generate buildings of varying heights
  const buildings: string[][] = [];
  const maxHeight = Math.min(3 + Math.floor(count / 2), 8);

  for (let i = 0; i < count; i++) {
    const height = 2 + (i % (maxHeight - 1));
    buildings.push(generateBuilding(i, height, true));
  }

  // Find the tallest building to normalize rows
  const tallest = Math.max(...buildings.map((b) => b.length));

  // Render buildings side by side (fit as many per row as we can ~60 chars)
  const buildingWidth = 5; // each building is 4 chars + 1 space
  const maxPerRow = Math.max(1, Math.floor(56 / buildingWidth));

  for (let rowStart = 0; rowStart < buildings.length; rowStart += maxPerRow) {
    const rowBuildings = buildings.slice(rowStart, rowStart + maxPerRow);
    const rowTallest = Math.max(...rowBuildings.map((b) => b.length));

    // Render row top-to-bottom
    for (let line = 0; line < rowTallest; line++) {
      let row = "  ";
      for (const building of rowBuildings) {
        const offset = rowTallest - building.length;
        if (line < offset) {
          row += "     "; // empty space above shorter buildings
        } else {
          row += building[line - offset] + " ";
        }
      }
      output.push(row);
    }

    // Ground line
    output.push("  " + "█████".repeat(Math.min(rowBuildings.length, maxPerRow)).slice(0, rowBuildings.length * 5));
    output.push("");
  }

  // Stats
  output.push(`  Population: ${count} agent${count !== 1 ? "s" : ""} deployed`);

  if (count >= 10) {
    output.push("  ⚠  City is thriving — agents are collaborating!");
  } else if (count >= 5) {
    output.push("  ◈  Growing metropolis — agents are settling in.");
  } else if (count >= 2) {
    output.push("  ○  Small settlement — room for expansion.");
  } else {
    output.push("  ◇  Lone outpost — one agent guards the frontier.");
  }

  // Skyline decoration
  output.push("");
  output.push("  ·  ✦  ·    ·  ★  ·  ✦    ·  ·  ★  ·");
  output.push("     ·    ✦  ·    ·    ·  ✦  ·    ·");
  output.push("");

  return output;
}
