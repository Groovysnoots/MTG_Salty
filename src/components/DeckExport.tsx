"use client";

import { useState } from "react";
import type { CounterCommander, CounterCard } from "@/lib/types";

interface DeckExportProps {
  commander: CounterCommander | null;
  cards: CounterCard[];
}

export default function DeckExport({ commander, cards }: DeckExportProps) {
  const [copied, setCopied] = useState(false);

  if (!commander && cards.length === 0) return null;

  const deckText = generateDeckText(commander, cards);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(deckText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([deckText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counter-deck${commander ? `-${commander.name.replace(/[^a-zA-Z0-9]/g, "_")}` : ""}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="font-bold text-zinc-100">Export Deck List</h3>
      <p className="text-sm text-zinc-400">
        Copy this list and paste it into Moxfield&apos;s import tool.
      </p>

      <pre className="max-h-64 overflow-y-auto rounded-lg bg-zinc-950 p-3 font-mono text-sm text-zinc-300">
        {deckText}
      </pre>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handleDownload}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Download .txt
        </button>
      </div>
    </div>
  );
}

function generateDeckText(commander: CounterCommander | null, cards: CounterCard[]): string {
  const lines: string[] = [];

  if (commander) {
    lines.push("Commander");
    lines.push(`1 ${commander.name}`);
    lines.push("");
  }

  if (cards.length > 0) {
    lines.push("Deck");
    for (const card of cards) {
      lines.push(`1 ${card.name}`);
    }
  }

  return lines.join("\n");
}
