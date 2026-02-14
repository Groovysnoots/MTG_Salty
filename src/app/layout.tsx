import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "mana-font/css/mana.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
        className={`${inter.variable} ${geistMono.variable} min-h-screen bg-[#070707] antialiased`}
      >
        <header className="border-b border-zinc-800/60 bg-[#070707]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
            <a href="/" className="group flex items-center gap-2.5">
              <span className="text-2xl transition-transform group-hover:rotate-12">🧂</span>
              <span className="text-xl font-bold tracking-tight text-zinc-100">
                MTG <span className="text-emerald-500">Salty</span>
              </span>
            </a>
            <p className="hidden text-sm text-zinc-500 font-label sm:block">
              Counter any commander.
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
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
