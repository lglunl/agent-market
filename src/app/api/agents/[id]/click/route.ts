import { NextRequest, NextResponse } from "next/server";
import { getAgent, incrementClick } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = getAgent(id);
  if (!existing || !existing.published) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  const agent = incrementClick(id);
  return NextResponse.json({
    ok: true,
    click_count: agent?.click_count ?? 0,
    url: existing.url,
  });
}
