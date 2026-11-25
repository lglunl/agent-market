import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const settings = updateSettings({
    site_name: body.site_name,
    public_url_prefix: body.public_url_prefix,
    announcement: body.announcement,
  });
  return NextResponse.json({ settings });
}
