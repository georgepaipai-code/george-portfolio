import type { Config } from "@netlify/functions";
import { isAuthenticated } from "./_lib/session";

export default async (request: Request) => {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ loggedIn: isAuthenticated(request) });
};

export const config: Config = {
  path: "/api/admin/me",
};
