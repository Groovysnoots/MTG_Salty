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
    <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-3">
        <svg className="h-5 w-5 text-emerald-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <h3 className="font-bold text-zinc-100">Import Your Deck</h3>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">
        Import your existing deck to get suggestions on what to add or cut.
      </p>

      <div className="flex gap-1.5 rounded-lg bg-zinc-800/50 p-1">
        <button
          onClick={() => setMode("url")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            mode === "url"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Moxfield URL
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            mode === "text"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
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
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Commander\n1 Atraxa, Praetors' Voice\n\nDeck\n1 Sol Ring\n1 Arcane Signet\n...`}
          rows={8}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/60 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
        />
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400 ring-1 ring-red-900/50">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={isLoading || (mode === "url" ? !url.trim() : !text.trim())}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Importing...
          </span>
        ) : (
          "Import Deck"
        )}
      </button>
    </div>
  );
}
