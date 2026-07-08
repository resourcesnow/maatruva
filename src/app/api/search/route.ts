import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchProducts(q, 6);
  return NextResponse.json({ results });
}
