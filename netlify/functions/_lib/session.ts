import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

const COOKIE_NAME = "admin_session";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  const secret = requireEnv("SESSION_SECRET");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionCookie(): string {
  const expiry = Date.now() + SEVEN_DAYS_MS;
  const payload = String(expiry);
  const signature = sign(payload);
  const token = `${payload}.${signature}`;
  const maxAgeSeconds = Math.floor(SEVEN_DAYS_MS / 1000);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }
  return result;
}

export function isAuthenticated(request: Request): boolean {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[COOKIE_NAME];
  if (!token) return false;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expected = sign(payload);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  return true;
}

export function requireAuth(request: Request): Response | null {
  if (!isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
