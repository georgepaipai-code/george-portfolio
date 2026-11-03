import { getLoginAttemptsStore } from "./blobs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface AttemptRecord {
  count: number;
  windowStart: number;
}

function keyFor(ip: string): string {
  return `attempts:${encodeURIComponent(ip)}`;
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const store = getLoginAttemptsStore();
  const record = await store.get(keyFor(ip), { type: "json" }) as AttemptRecord | null;
  if (!record) return false;
  if (Date.now() - record.windowStart > WINDOW_MS) return false;
  return record.count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const store = getLoginAttemptsStore();
  const key = keyFor(ip);
  const existing = await store.get(key, { type: "json" }) as AttemptRecord | null;

  const now = Date.now();
  const record: AttemptRecord =
    existing && now - existing.windowStart <= WINDOW_MS
      ? { count: existing.count + 1, windowStart: existing.windowStart }
      : { count: 1, windowStart: now };

  await store.setJSON(key, record);
}

export async function clearAttempts(ip: string): Promise<void> {
  const store = getLoginAttemptsStore();
  await store.delete(keyFor(ip));
}
