import type { Config } from "@netlify/functions";
import { clearSessionCookie } from "./_lib/session";

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
};

export const config: Config = {
  path: "/api/admin/logout",
};
