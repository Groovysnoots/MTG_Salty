import { NextRequest, NextResponse } from "next/server";
import { analyzeDeckSuggestions } from "@/lib/claude";
import { getCardByName, getCardImageUrl, isCommanderLegal } from "@/lib/scryfall";
import type { HateLevel, DeckSuggestion } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetCommander,
      targetCommanderText,
      userCommander,
      userColorIdentity,
      deckList,
      hateLevel,
    } = body;

    if (!targetCommander || !userCommander || !deckList) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rawSuggestions = await analyzeDeckSuggestions({
      targetCommander,
      targetCommanderText: targetCommanderText || "",
      userCommander,
      userColorIdentity: userColorIdentity || [],
      currentDeckList: deckList,
      hateLevel: (hateLevel || 3) as HateLevel,
    });

    // Validate cards to add against Scryfall
    const validatedAdds: DeckSuggestion["cardsToAdd"] = [];
    for (const suggestion of rawSuggestions.cardsToAdd) {
      const card = await getCardByName(suggestion.name);
      if (card && isCommanderLegal(card)) {
        validatedAdds.push({
          ...suggestion,
          card: {
            ...card,
            imageUrl: getCardImageUrl(card),
          },
        });
      }
    }

    return NextResponse.json({
      explanation: rawSuggestions.explanation,
      cardsToAdd: validatedAdds,
      cardsToRemove: rawSuggestions.cardsToRemove,
    });
  } catch (error) {
    console.error("Deck suggestions failed:", error);
    return NextResponse.json({ error: "Deck suggestions failed" }, { status: 500 });
  }
}
