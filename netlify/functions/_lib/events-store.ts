import { randomUUID } from "node:crypto";
import { getEventsStore } from "./blobs";
import type { EventDraft, EventRecord } from "../../../src/types/event";

// Netlify Blobs' list() is only eventually consistent, while get()/set() by an
// exact key are strongly consistent. The public events feed needs reads to
// reflect writes immediately, so event ids are tracked in this single index
// document instead of discovering them via list().
const INDEX_KEY = "index";

function keyFor(id: string): string {
  return `event:${id}`;
}

async function getIndex(): Promise<string[]> {
  const store = getEventsStore();
  const ids = (await store.get(INDEX_KEY, { type: "json" })) as string[] | null;
  return ids ?? [];
}

async function addToIndex(id: string): Promise<void> {
  const store = getEventsStore();
  const ids = await getIndex();
  if (!ids.includes(id)) {
    await store.setJSON(INDEX_KEY, [...ids, id]);
  }
}

async function removeFromIndex(id: string): Promise<void> {
  const store = getEventsStore();
  const ids = await getIndex();
  await store.setJSON(INDEX_KEY, ids.filter((existingId) => existingId !== id));
}

export async function listAllEvents(): Promise<EventRecord[]> {
  const store = getEventsStore();
  const ids = await getIndex();
  const records = await Promise.all(
    ids.map((id) => store.get(keyFor(id), { type: "json" }) as Promise<EventRecord | null>),
  );
  return records.filter((r): r is EventRecord => r !== null);
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const store = getEventsStore();
  return (await store.get(keyFor(id), { type: "json" })) as EventRecord | null;
}

function effectiveEndTime(event: EventRecord): number {
  return new Date(event.end ?? event.start).getTime();
}

export async function listUpcomingEvents(): Promise<EventRecord[]> {
  const all = await listAllEvents();
  const now = Date.now();
  return all
    .filter((e) => effectiveEndTime(e) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export async function listPastEvents(limit = 50): Promise<EventRecord[]> {
  const all = await listAllEvents();
  const now = Date.now();
  return all
    .filter((e) => effectiveEndTime(e) < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .slice(0, limit);
}

export async function createEvent(draft: EventDraft): Promise<EventRecord> {
  const now = new Date().toISOString();
  const record: EventRecord = {
    id: randomUUID(),
    title: draft.title ?? "",
    start: draft.start ?? now,
    end: draft.end,
    timezone: draft.timezone ?? "America/Los_Angeles",
    locationName: draft.locationName,
    address: draft.address,
    city: draft.city,
    isOnline: draft.isOnline ?? false,
    imageUrl: draft.imageUrl,
    hostName: draft.hostName,
    description: draft.description,
    registrationUrl: draft.registrationUrl ?? "",
    sourceUrl: draft.sourceUrl,
    tags: draft.tags ?? [],
    recommendation: draft.recommendation,
    cohosted: draft.cohosted ?? false,
    cohostLabel: draft.cohostLabel,
    createdAt: now,
    updatedAt: now,
  };
  const store = getEventsStore();
  await store.setJSON(keyFor(record.id), record);
  await addToIndex(record.id);
  return record;
}

export async function updateEvent(id: string, draft: EventDraft): Promise<EventRecord | null> {
  const existing = await getEvent(id);
  if (!existing) return null;

  const updated: EventRecord = {
    ...existing,
    ...draft,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const store = getEventsStore();
  await store.setJSON(keyFor(id), updated);
  return updated;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const existing = await getEvent(id);
  if (!existing) return false;
  const store = getEventsStore();
  await store.delete(keyFor(id));
  await removeFromIndex(id);
  return true;
}
