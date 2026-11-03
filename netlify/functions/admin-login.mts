import type { Config, Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./_lib/env";
import { createSessionCookie } from "./_lib/session";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "./_lib/rate-limit";

function timingSafeStringEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export default async (request: Request, context: Context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const ip = context.ip || "unknown";

  if (await isRateLimited(ip)) {
    return Response.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = typeof (body as any)?.password === "string" ? (body as any).password : "";
  const adminPassword = requireEnv("ADMIN_PASSWORD");

  if (!password || !timingSafeStringEqual(password, adminPassword)) {
    await recordFailedAttempt(ip);
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  await clearAttempts(ip);

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": createSessionCookie() } },
  );
};

export const config: Config = {
  path: "/api/admin/login",
};
