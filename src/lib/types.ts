// Scryfall card data types
export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Record<string, string>;
  set: string;
  set_name: string;
  collector_number: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: {
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }[];
  prices: {
    usd?: string | null;
    usd_foil?: string | null;
  };
  edhrec_rank?: number;
  scryfall_uri: string;
  rulings_uri: string;
}

export interface ScryfallSearchResult {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: ScryfallCard[];
}

export interface ScryfallAutocomplete {
  object: string;
  total_values: number;
  data: string[];
}

// App-specific types
export interface Commander {
  card: ScryfallCard;
  imageUrl: string;
}

export type HateLevel = 1 | 2 | 3 | 4 | 5;

export const HATE_LEVEL_LABELS: Record<HateLevel, { name: string; description: string }> = {
  1: { name: "Sprinkle", description: "Add 2-3 answer cards to any existing deck" },
  2: { name: "Nudge", description: "Choose a commander with a naturally good matchup" },
  3: { name: "Focused", description: "Build a deck that specifically addresses the strategy" },
  4: { name: "Hard Counter", description: "Optimize the deck to shut down that commander" },
  5: { name: "Maximum Salt", description: "Go full hate — even if it means a narrow deck" },
};

export interface CounterRecommendation {
  commanders: CounterCommander[];
  cards: CounterCard[];
  analysis: string;
}

export interface CounterCommander {
  name: string;
  reason: string;
  strategy: string;
  colorIdentity: string[];
  estimatedCost: string;
  card?: ScryfallCard;
  imageUrl?: string;
}

export interface CounterCard {
  name: string;
  reason: string;
  category: CardCategory;
  card?: ScryfallCard;
  imageUrl?: string;
}

export type CardCategory =
  | "removal"
  | "hate_piece"
  | "protection"
  | "board_wipe"
  | "counterspell"
  | "graveyard_hate"
  | "stax"
  | "combo_disruption"
  | "other";

export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  removal: "Removal",
  hate_piece: "Hate Pieces",
  protection: "Protection",
  board_wipe: "Board Wipes",
  counterspell: "Counterspells",
  graveyard_hate: "Graveyard Hate",
  stax: "Stax",
  combo_disruption: "Combo Disruption",
  other: "Other",
};

// Deck types
export interface DeckCard {
  quantity: number;
  name: string;
  setCode?: string;
  collectorNumber?: string;
  card?: ScryfallCard;
}

export interface Deck {
  commander?: DeckCard;
  mainboard: DeckCard[];
  sideboard: DeckCard[];
}

export interface DeckSuggestion {
  cardsToAdd: { name: string; reason: string; card?: ScryfallCard }[];
  cardsToRemove: { name: string; reason: string }[];
  explanation: string;
}
