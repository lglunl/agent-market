import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { uploadDir } from "@/lib/paths";

type Ctx = { params: Promise<{ path: string[] }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const parts = (await ctx.params).path || [];
  if (parts.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))) {
    return NextResponse.json({ error: "非法路径" }, { status: 400 });
  }

  const filename = parts.join("/");
  const full = path.join(uploadDir(), filename);
  if (!full.startsWith(uploadDir()) || !fs.existsSync(full)) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  const ext = path.extname(full).toLowerCase();
  const data = fs.readFileSync(full);
  return new NextResponse(data, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
