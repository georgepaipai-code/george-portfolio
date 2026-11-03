import type { EventDraft, EventRecord, ParseEventResponse } from "@/types/event";

class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // ignore - use default message
    }
    throw new ApiError(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getUpcomingEvents(): Promise<EventRecord[]> {
  return request<EventRecord[]>("/api/events");
}

export function getPastEvents(): Promise<EventRecord[]> {
  return request<EventRecord[]>("/api/events?past=1");
}

export function getEventById(id: string): Promise<EventRecord> {
  return request<EventRecord>(`/api/events/${encodeURIComponent(id)}`);
}

export function adminLogin(password: string): Promise<{ ok: true }> {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function adminLogout(): Promise<{ ok: true }> {
  return request("/api/admin/logout", { method: "POST" });
}

export function adminMe(): Promise<{ loggedIn: boolean }> {
  return request("/api/admin/me");
}

export function adminParseLink(url: string): Promise<ParseEventResponse> {
  return request("/api/admin/parse", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function adminCreateEvent(draft: EventDraft): Promise<EventRecord> {
  return request("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(draft),
  });
}

export function adminUpdateEvent(id: string, draft: EventDraft): Promise<EventRecord> {
  return request(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(draft),
  });
}

export function adminDeleteEvent(id: string): Promise<{ ok: true }> {
  return request(`/api/admin/events/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export { ApiError };
