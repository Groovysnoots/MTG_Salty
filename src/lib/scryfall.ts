import type { ScryfallCard, ScryfallSearchResult, ScryfallAutocomplete } from "./types";

const BASE_URL = "https://api.scryfall.com";
const RATE_LIMIT_MS = 75;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  return fetch(url);
}

export async function searchCommanders(query: string): Promise<ScryfallCard[]> {
  if (!query.trim()) return [];

  const encodedQuery = encodeURIComponent(`${query} is:commander f:commander`);
  const res = await rateLimitedFetch(`${BASE_URL}/cards/search?q=${encodedQuery}&order=edhrec`);

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Scryfall search failed: ${res.status}`);
  }

  const data: ScryfallSearchResult = await res.json();
  return data.data;
}

export async function autocompleteCards(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 2) return [];

  const encodedQuery = encodeURIComponent(query);
  const res = await rateLimitedFetch(`${BASE_URL}/cards/autocomplete?q=${encodedQuery}`);

  if (!res.ok) return [];

  const data: ScryfallAutocomplete = await res.json();
  return data.data;
}

export async function getCardByName(name: string): Promise<ScryfallCard | null> {
  const encodedName = encodeURIComponent(name);
  const res = await rateLimitedFetch(`${BASE_URL}/cards/named?exact=${encodedName}`);

  if (!res.ok) return null;
  return res.json();
}

export async function getCardById(id: string): Promise<ScryfallCard | null> {
  const res = await rateLimitedFetch(`${BASE_URL}/cards/${id}`);

  if (!res.ok) return null;
  return res.json();
}

export async function searchCards(query: string): Promise<ScryfallCard[]> {
  if (!query.trim()) return [];

  const encodedQuery = encodeURIComponent(query);
  const res = await rateLimitedFetch(`${BASE_URL}/cards/search?q=${encodedQuery}&order=edhrec`);

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Scryfall search failed: ${res.status}`);
  }

  const data: ScryfallSearchResult = await res.json();
  return data.data;
}

export function getCardImageUrl(card: ScryfallCard, size: "small" | "normal" | "large" = "normal"): string {
  if (card.image_uris) {
    return card.image_uris[size];
  }
  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris[size];
  }
  return "";
}

export function getCardOracleText(card: ScryfallCard): string {
  if (card.oracle_text) return card.oracle_text;
  if (card.card_faces) {
    return card.card_faces.map((face) => face.oracle_text || "").join("\n\n// ");
  }
  return "";
}

export function getCardPrice(card: ScryfallCard): number | null {
  if (card.prices.usd) return parseFloat(card.prices.usd);
  if (card.prices.usd_foil) return parseFloat(card.prices.usd_foil);
  return null;
}

export function isCommanderLegal(card: ScryfallCard): boolean {
  return card.legalities.commander === "legal";
}

export function isValidCommander(card: ScryfallCard): boolean {
  const typeLine = card.type_line.toLowerCase();
  const oracleText = getCardOracleText(card).toLowerCase();

  const isLegendaryCreature = typeLine.includes("legendary") && typeLine.includes("creature");
  const canBeCommander = oracleText.includes("can be your commander");

  return (isLegendaryCreature || canBeCommander) && isCommanderLegal(card);
}

export function formatColorIdentity(colors: string[]): string {
  if (colors.length === 0) return "Colorless";
  return colors.join("");
}

const COLOR_MAP: Record<string, string> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
};

export function colorIdentityToNames(colors: string[]): string[] {
  return colors.map((c) => COLOR_MAP[c] || c);
}
