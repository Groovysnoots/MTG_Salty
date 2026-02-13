import type { Deck, DeckCard } from "./types";

const MOXFIELD_URL_REGEX = /https?:\/\/(?:www\.)?moxfield\.com\/decks\/([A-Za-z0-9_-]+)/;

export function parseMoxfieldUrl(url: string): string | null {
  const match = url.match(MOXFIELD_URL_REGEX);
  return match ? match[1] : null;
}

export async function fetchMoxfieldDeck(publicId: string): Promise<Deck> {
  const res = await fetch(`https://api.moxfield.com/v2/decks/all/${publicId}`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "MTG_Salty/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Moxfield deck: ${res.status}`);
  }

  const data = await res.json();
  const deck: Deck = { mainboard: [], sideboard: [] };

  // Extract commander
  if (data.commanders && Object.keys(data.commanders).length > 0) {
    const firstCommander = Object.values(data.commanders)[0] as {
      quantity: number;
      card: { name: string; set: string; collector_number: string };
    };
    deck.commander = {
      quantity: firstCommander.quantity,
      name: firstCommander.card.name,
      setCode: firstCommander.card.set,
      collectorNumber: firstCommander.card.collector_number,
    };
  }

  // Extract mainboard
  if (data.mainboard) {
    for (const entry of Object.values(data.mainboard) as {
      quantity: number;
      card: { name: string; set: string; collector_number: string };
    }[]) {
      deck.mainboard.push({
        quantity: entry.quantity,
        name: entry.card.name,
        setCode: entry.card.set,
        collectorNumber: entry.card.collector_number,
      });
    }
  }

  // Extract sideboard
  if (data.sideboard) {
    for (const entry of Object.values(data.sideboard) as {
      quantity: number;
      card: { name: string; set: string; collector_number: string };
    }[]) {
      deck.sideboard.push({
        quantity: entry.quantity,
        name: entry.card.name,
        setCode: entry.card.set,
        collectorNumber: entry.card.collector_number,
      });
    }
  }

  return deck;
}

export function parseTextDeckList(text: string): Deck {
  const lines = text.trim().split("\n");
  const deck: Deck = { mainboard: [], sideboard: [] };
  let currentSection: "commander" | "mainboard" | "sideboard" = "mainboard";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const lowerLine = line.toLowerCase();
    if (lowerLine === "commander" || lowerLine === "commander:") {
      currentSection = "commander";
      continue;
    }
    if (
      lowerLine === "deck" ||
      lowerLine === "deck:" ||
      lowerLine === "mainboard" ||
      lowerLine === "mainboard:" ||
      lowerLine === "library" ||
      lowerLine === "library:"
    ) {
      currentSection = "mainboard";
      continue;
    }
    if (lowerLine === "sideboard" || lowerLine === "sideboard:") {
      currentSection = "sideboard";
      continue;
    }

    // Skip other section headers
    if (
      lowerLine === "companion" ||
      lowerLine === "companion:" ||
      lowerLine === "maybeboard" ||
      lowerLine === "maybeboard:"
    ) {
      continue;
    }

    const parsed = parseCardLine(line);
    if (!parsed) continue;

    if (currentSection === "commander") {
      deck.commander = parsed;
    } else if (currentSection === "sideboard") {
      deck.sideboard.push(parsed);
    } else {
      deck.mainboard.push(parsed);
    }
  }

  return deck;
}

function parseCardLine(line: string): DeckCard | null {
  // Match: "1 Lightning Bolt (M21) 152" or "1x Lightning Bolt" or "Lightning Bolt"
  const match = line.match(/^(\d+)\s*x?\s+(.+?)(?:\s+\((\w+)\)(?:\s+(\d+))?)?$/);
  if (match) {
    return {
      quantity: parseInt(match[1], 10),
      name: match[2].trim(),
      setCode: match[3],
      collectorNumber: match[4],
    };
  }

  // Just a card name
  if (line.match(/^[A-Z]/)) {
    return { quantity: 1, name: line.trim() };
  }

  return null;
}

export function exportDeckToText(deck: Deck): string {
  const lines: string[] = [];

  if (deck.commander) {
    lines.push("Commander");
    lines.push(formatCardLine(deck.commander));
    lines.push("");
  }

  if (deck.mainboard.length > 0) {
    lines.push("Deck");
    for (const card of deck.mainboard) {
      lines.push(formatCardLine(card));
    }
  }

  if (deck.sideboard.length > 0) {
    lines.push("");
    lines.push("Sideboard");
    for (const card of deck.sideboard) {
      lines.push(formatCardLine(card));
    }
  }

  return lines.join("\n");
}

function formatCardLine(card: DeckCard): string {
  let line = `${card.quantity} ${card.name}`;
  if (card.setCode) {
    line += ` (${card.setCode.toUpperCase()})`;
    if (card.collectorNumber) {
      line += ` ${card.collectorNumber}`;
    }
  }
  return line;
}
