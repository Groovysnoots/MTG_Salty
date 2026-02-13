import { NextRequest, NextResponse } from "next/server";
import { analyzeCounterStrategy } from "@/lib/claude";
import { getCardByName, getCardImageUrl, isCommanderLegal, isValidCommander } from "@/lib/scryfall";
import type { HateLevel, CounterCommander, CounterCard } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      commanderName,
      commanderType,
      commanderColors,
      commanderText,
      commanderKeywords,
      hateLevel,
      userColorIdentity,
    } = body;

    if (!commanderName || !hateLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recommendation = await analyzeCounterStrategy({
      commanderName,
      commanderType,
      commanderColors: commanderColors || [],
      commanderText: commanderText || "",
      commanderKeywords: commanderKeywords || [],
      hateLevel: hateLevel as HateLevel,
      userColorIdentity,
    });

    // Validate counter-commanders against Scryfall
    const validatedCommanders: CounterCommander[] = [];
    for (const cmd of recommendation.commanders) {
      const card = await getCardByName(cmd.name);
      if (card && isValidCommander(card) && isCommanderLegal(card)) {
        validatedCommanders.push({
          ...cmd,
          card,
          imageUrl: getCardImageUrl(card),
        });
      }
    }

    // Validate counter-cards against Scryfall
    const validatedCards: CounterCard[] = [];
    for (const c of recommendation.cards) {
      const card = await getCardByName(c.name);
      if (card && isCommanderLegal(card)) {
        validatedCards.push({
          ...c,
          card,
          imageUrl: getCardImageUrl(card),
        });
      }
    }

    return NextResponse.json({
      analysis: recommendation.analysis,
      commanders: validatedCommanders,
      cards: validatedCards,
    });
  } catch (error) {
    console.error("Counter analysis failed:", error);
    return NextResponse.json({ error: "Counter analysis failed" }, { status: 500 });
  }
}
