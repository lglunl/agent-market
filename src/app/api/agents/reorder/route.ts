import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { reorderAgents } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.ids) || body.ids.some((x: unknown) => typeof x !== "string")) {
    return NextResponse.json({ error: "需要 ids 字符串数组" }, { status: 400 });
  }

  reorderAgents(body.ids);
  return NextResponse.json({ ok: true });
}
