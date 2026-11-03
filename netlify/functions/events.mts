import type { Config } from "@netlify/functions";
import { listUpcomingEvents, listPastEvents } from "./_lib/events-store";

export default async (request: Request) => {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const isPast = url.searchParams.get("past") === "1";

  const events = isPast ? await listPastEvents(50) : await listUpcomingEvents();
  return Response.json(events);
};

export const config: Config = {
  path: "/api/events",
};
