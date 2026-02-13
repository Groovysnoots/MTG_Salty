"use client";

import { useState } from "react";
import type { Deck } from "@/lib/types";

interface DeckImportProps {
  onImport: (deck: Deck) => void;
}

export default function DeckImport({ onImport }: DeckImportProps) {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const body = mode === "url" ? { url } : { text };
      const res = await fetch("/api/deck-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }

      const data = await res.json();
      onImport(data.deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="font-bold text-zinc-100">Import Your Deck</h3>
      <p className="text-sm text-zinc-400">
        Import your existing deck to get suggestions on what to add or cut.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("url")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "url"
              ? "bg-amber-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Moxfield URL
        </button>
        <button
          onClick={() => setMode("text")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "text"
              ? "bg-amber-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Paste Deck List
        </button>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://moxfield.com/decks/..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Commander\n1 Atraxa, Praetors' Voice\n\nDeck\n1 Sol Ring\n1 Arcane Signet\n...`}
          rows={8}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
        />
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleImport}
        disabled={isLoading || (mode === "url" ? !url.trim() : !text.trim())}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Importing..." : "Import Deck"}
      </button>
    </div>
  );
}
