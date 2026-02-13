import { NextRequest, NextResponse } from "next/server";
import { searchCommanders } from "@/lib/scryfall";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const cards = await searchCommanders(query);
    return NextResponse.json({ data: cards });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
