import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/db";

export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    return NextResponse.json({ categories: listCategories(false) });
  }
  return NextResponse.json({ categories: listCategories(true) });
}
