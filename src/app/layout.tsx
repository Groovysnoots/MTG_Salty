import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "mana-font/css/mana.css";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MTG Salty — Counter Any Commander",
  description:
    "Find the best commanders and cards to counter any Magic: The Gathering commander that's dominating your playgroup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} min-h-screen bg-[#010101] antialiased`}
      >
        <header className="border-b border-zinc-800/60 bg-[#010101] sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-5">
            <a href="/" className="font-bold text-sm tracking-tight text-[#f7f8f8]">
              MTGSalty
            </a>
            <span className="font-label text-xs tracking-[0.6px] uppercase text-zinc-500">
              Counter any commander.
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>
        <footer className="border-t border-zinc-800/40 py-6 mt-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between">
            <p className="text-xs text-zinc-600 font-label">
              Card data from Scryfall. Not affiliated with Wizards of the Coast.
            </p>
            <p className="text-xs text-zinc-700 font-label">
              MTG Salty
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
