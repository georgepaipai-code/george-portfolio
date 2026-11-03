import type { Config, Context } from "@netlify/functions";
import { requireAuth } from "./_lib/session";
import { updateEvent, deleteEvent } from "./_lib/events-store";
import { validateEventInput, ValidationError } from "./_lib/validate";

export default async (request: Request, context: Context) => {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;

  const id = context.params.id;
  if (!id) {
    return Response.json({ error: "Missing event id" }, { status: 400 });
  }

  if (request.method === "PUT") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    try {
      const draft = validateEventInput(body, false);
      const updated = await updateEvent(id, draft);
      if (!updated) {
        return Response.json({ error: "Event not found" }, { status: 404 });
      }
      return Response.json(updated);
    } catch (err) {
      if (err instanceof ValidationError) {
        return Response.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  if (request.method === "DELETE") {
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/admin/events/:id",
};
