import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "am_admin_session";

function secretKey() {
  const secret =
    process.env.AUTH_SECRET || "agent-market-dev-secret-change-in-prod";
  return new TextEncoder().encode(secret);
}

// 会话 Cookie 是否仅走 HTTPS。
// 默认跟随 NODE_ENV（生产环境为 true）。直连 IP:端口、无 HTTPS 时需设 COOKIE_SECURE=false，
// 否则浏览器不会在 HTTP 下回传 Secure Cookie，导致后台无法保持登录。
function secureCookie() {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === "true";
  }
  return process.env.NODE_ENV === "production";
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

export async function createSessionToken(username: string) {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== "admin" || typeof payload.sub !== "string") {
      return null;
    }
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "未登录" }, { status: 401 }) };
  }
  return { ok: true as const, session };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return !!(await verifySessionToken(token));
}
