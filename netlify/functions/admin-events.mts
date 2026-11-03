import type { Config } from "@netlify/functions";
import { requireAuth } from "./_lib/session";
import { createEvent } from "./_lib/events-store";
import { validateEventInput, ValidationError } from "./_lib/validate";

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

  try {
    const draft = validateEventInput(body, true);
    const event = await createEvent(draft);
    return Response.json(event, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
};

export const config: Config = {
  path: "/api/admin/events",
};
