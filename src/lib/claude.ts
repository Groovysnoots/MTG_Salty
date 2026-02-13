import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import type { HateLevel, CounterRecommendation } from "./types";

function getApiKey(): string {
  // Try process.env first
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fall back to reading .env.local directly
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ANTHROPIC_API_KEY=")) {
        return trimmed.slice("ANTHROPIC_API_KEY=".length);
      }
    }
  } catch {
    // ignore
  }
  return "";
}

function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local");
  }
  return new Anthropic({ apiKey });
}

interface CounterAnalysisInput {
  commanderName: string;
  commanderType: string;
  commanderColors: string[];
  commanderText: string;
  commanderKeywords: string[];
  hateLevel: HateLevel;
  userColorIdentity?: string[];
}

export async function analyzeCounterStrategy(input: CounterAnalysisInput): Promise<CounterRecommendation> {
  const hateLevelContext: Record<HateLevel, string> = {
    1: "Suggest 2-3 individual cards that answer this commander. Focus on universally useful cards that happen to be good against this strategy. No need for a dedicated counter-commander.",
    2: "Suggest a commander that naturally has a good matchup against this strategy, even if it wasn't designed specifically to counter it. Include 5-6 individual answer cards.",
    3: "Suggest 2-3 commanders specifically chosen to counter this strategy. Include 8-10 targeted counter-cards. The deck should meaningfully address this commander's strategy.",
    4: "Suggest 3-4 commanders that hard-counter this strategy. Include 12-15 hate cards. The deck should be optimized to shut this commander down while still being functional.",
    5: "Suggest 3-5 commanders that completely lock out this strategy. Include 15-20 of the most oppressive hate cards possible. Maximum salt — the goal is to make this commander unplayable. Go all out.",
  };

  const colorConstraint = input.userColorIdentity
    ? `The user's commander has color identity [${input.userColorIdentity.join(", ")}]. All suggested cards must fit within this color identity.`
    : "No color identity constraint — suggest the best counter-commanders regardless of color.";

  const prompt = `You are an expert Magic: The Gathering Commander/EDH player and deckbuilder.

A player needs help countering this commander:
- Name: ${input.commanderName}
- Type: ${input.commanderType}
- Color Identity: [${input.commanderColors.join(", ")}]
- Oracle Text: ${input.commanderText}
- Keywords: [${input.commanderKeywords.join(", ")}]

Hate Level: ${input.hateLevel}/5
${hateLevelContext[input.hateLevel]}

${colorConstraint}

CRITICAL RULES:
- Only suggest cards that are legal in Commander format
- Only suggest legendary creatures or planeswalkers that explicitly say "can be your commander" as counter-commanders
- Do NOT suggest banned cards (check against the current Commander banned list)
- Do NOT repeat the same commander suggestions — vary your recommendations
- Study what makes this commander unique and dangerous, then target those specific strengths
- Be specific about WHY each suggestion counters this commander

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "analysis": "2-3 sentences explaining what makes this commander strong and what strategies counter it.",
  "commanders": [
    {
      "name": "Exact Card Name",
      "reason": "Why this commander counters the target",
      "strategy": "Brief deck strategy overview",
      "colorIdentity": ["W", "U"],
      "estimatedCost": "$50-100"
    }
  ],
  "cards": [
    {
      "name": "Exact Card Name",
      "reason": "Why this card is effective against the target",
      "category": "removal|hate_piece|protection|board_wipe|counterspell|graveyard_hate|stax|combo_disruption|other"
    }
  ]
}`;

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const parsed: CounterRecommendation = JSON.parse(textBlock.text);
  return parsed;
}

interface DeckSuggestionInput {
  targetCommander: string;
  targetCommanderText: string;
  userCommander: string;
  userColorIdentity: string[];
  currentDeckList: string[];
  hateLevel: HateLevel;
}

export async function analyzeDeckSuggestions(input: DeckSuggestionInput) {
  const prompt = `You are an expert Magic: The Gathering Commander/EDH deckbuilder.

A player wants to modify their existing deck to better counter a specific commander.

Target Commander to Counter: ${input.targetCommander}
Target Commander Text: ${input.targetCommanderText}

Player's Commander: ${input.userCommander}
Player's Color Identity: [${input.userColorIdentity.join(", ")}]
Hate Level: ${input.hateLevel}/5

Current Deck List:
${input.currentDeckList.map((card) => `- ${card}`).join("\n")}

Suggest cards to ADD and cards to REMOVE to better counter the target commander.
All suggestions must be within the player's color identity [${input.userColorIdentity.join(", ")}].
All suggested cards must be Commander-legal and not on the banned list.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "explanation": "Overview of the suggested changes and why they help.",
  "cardsToAdd": [
    { "name": "Exact Card Name", "reason": "Why to add this card" }
  ],
  "cardsToRemove": [
    { "name": "Exact Card Name", "reason": "Why to remove this card" }
  ]
}`;

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return JSON.parse(textBlock.text);
}
