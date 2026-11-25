import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAgent, listAgents } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const all = searchParams.get("all") === "1";

  if (all) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    return NextResponse.json({ agents: listAgents({ q, category }) });
  }

  return NextResponse.json({
    agents: listAgents({ publishedOnly: true, q, category }),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim() || !body?.url?.trim()) {
    return NextResponse.json({ error: "名称和 URL 必填" }, { status: 400 });
  }

  const agent = createAgent({
    name: body.name,
    description: body.description,
    cover: body.cover ?? null,
    url: body.url,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    category: body.category,
    sort_order: body.sort_order,
    published: body.published !== false,
  });

  return NextResponse.json({ agent }, { status: 201 });
}
