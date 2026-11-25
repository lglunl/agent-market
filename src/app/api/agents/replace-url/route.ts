import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { replaceUrlPrefix } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const from = String(body?.from || "");
  const to = String(body?.to ?? "");

  if (!from) {
    return NextResponse.json({ error: "原前缀 from 必填" }, { status: 400 });
  }

  const updated = replaceUrlPrefix(from, to);
  return NextResponse.json({ ok: true, updated });
}
