"use client";

import { useState } from "react";
import type { CounterCommander, CounterCard } from "@/lib/types";

interface DeckExportProps {
  commander: CounterCommander | null;
  cards: CounterCard[];
}

export default function DeckExport({ commander, cards }: DeckExportProps) {
  const [copied, setCopied] = useState(false);
  const [showList, setShowList] = useState(false);

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
    <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-emerald-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <h3 className="font-bold text-zinc-100">Export Deck List</h3>
        </div>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 font-label">
          {cards.length + (commander ? 1 : 0)} cards
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">
        Copy this list and paste it into Moxfield&apos;s import tool.
      </p>

      <button
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <svg
          className={`h-4 w-4 transition-transform ${showList ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showList ? "Hide" : "Show"} deck list
      </button>

      {showList && (
        <pre className="max-h-64 overflow-y-auto rounded-xl bg-zinc-950/80 p-4 font-mono text-sm leading-relaxed text-zinc-300 ring-1 ring-zinc-800/80">
          {deckText}
        </pre>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
        >
          {copied ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-700/60"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
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
