import { NextRequest, NextResponse } from "next/server";
import { parseMoxfieldUrl, fetchMoxfieldDeck, parseTextDeckList } from "@/lib/moxfield";
import { getCardByName } from "@/lib/scryfall";
import type { Deck } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, text } = body;

    let deck: Deck;

    if (url) {
      const publicId = parseMoxfieldUrl(url);
      if (!publicId) {
        return NextResponse.json({ error: "Invalid Moxfield URL" }, { status: 400 });
      }
      deck = await fetchMoxfieldDeck(publicId);
    } else if (text) {
      deck = parseTextDeckList(text);
    } else {
      return NextResponse.json({ error: "Provide a Moxfield URL or deck list text" }, { status: 400 });
    }

    // Enrich commander with Scryfall data
    if (deck.commander) {
      const card = await getCardByName(deck.commander.name);
      if (card) {
        deck.commander.card = card;
      }
    }

    return NextResponse.json({ deck });
  } catch (error) {
    console.error("Deck import failed:", error);
    return NextResponse.json({ error: "Deck import failed" }, { status: 500 });
  }
}
