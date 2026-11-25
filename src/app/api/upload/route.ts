import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { uploadDir } from "@/lib/paths";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "仅支持 jpeg/png/webp/gif" },
      { status: 400 }
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
  }

  const ext =
    file.type === "image/jpeg"
      ? ".jpg"
      : file.type === "image/png"
        ? ".png"
        : file.type === "image/webp"
          ? ".webp"
          : ".gif";

  const name = `${randomUUID()}${ext}`;
  const dir = uploadDir();
  const full = path.join(dir, name);
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(full, buf);

  return NextResponse.json({ url: `/uploads/${name}` });
}
