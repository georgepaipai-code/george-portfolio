import type { Config } from "@netlify/functions";
import { requireAuth } from "./_lib/session";
import { parseEventFromUrl } from "./_lib/parse-event";
import { SsrfBlockedError } from "./_lib/ssrf-guard";

export default async (request: Request) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = typeof (body as any)?.url === "string" ? (body as any).url : "";
  if (!url) {
    return Response.json({ error: '"url" is required' }, { status: 400 });
  }

  try {
    const result = await parseEventFromUrl(url);
    return Response.json(result);
  } catch (err) {
    if (err instanceof SsrfBlockedError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to read that link";
    return Response.json({ error: message }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/admin/parse",
};
