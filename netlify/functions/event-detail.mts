import type { Config, Context } from "@netlify/functions";
import { getEvent } from "./_lib/events-store";

export default async (request: Request, context: Context) => {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const id = context.params.id;
  if (!id) {
    return Response.json({ error: "Missing event id" }, { status: 400 });
  }

  const event = await getEvent(id);
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json(event);
};

export const config: Config = {
  path: "/api/events/:id",
};
