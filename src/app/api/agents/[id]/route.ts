import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteAgent, getAgent, updateAgent } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const agent = getAgent(id);
  if (!agent || !agent.published) {
    const auth = await requireAdmin();
    if (!auth.ok || !agent) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }
  }
  return NextResponse.json({ agent });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const agent = updateAgent(id, {
    name: body.name,
    description: body.description,
    cover: body.cover,
    url: body.url,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    category: body.category,
    sort_order: body.sort_order,
    published: body.published,
  });

  if (!agent) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json({ agent });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!deleteAgent(id)) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
