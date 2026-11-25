import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminCredentials,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "");
  const password = String(body.password || "");
  const creds = getAdminCredentials();

  if (username !== creds.username || password !== creds.password) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  setSessionCookie(res, token);
  return res;
}
