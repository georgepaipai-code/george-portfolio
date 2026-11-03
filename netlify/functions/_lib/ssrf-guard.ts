import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;

export class SsrfBlockedError extends Error {}

function isAllowedIp(ip: string): boolean {
  try {
    const addr = ipaddr.process(ip);
    // "unicast" is the only range covering ordinary public addresses.
    // Everything else (private, loopback, linkLocal, uniqueLocal, reserved,
    // multicast, carrierGradeNat, etc.) is blocked.
    return addr.range() === "unicast";
  } catch {
    return false;
  }
}

async function assertHostIsSafe(hostname: string): Promise<void> {
  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new SsrfBlockedError(`Could not resolve host: ${hostname}`);
  }
  if (addresses.length === 0) {
    throw new SsrfBlockedError(`Could not resolve host: ${hostname}`);
  }
  for (const { address } of addresses) {
    if (!isAllowedIp(address)) {
      throw new SsrfBlockedError(`"${hostname}" resolves to a disallowed address`);
    }
  }
}

function assertUrlIsSafe(url: URL): void {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfBlockedError("Only http:// and https:// URLs are allowed");
  }
}

export interface SafeFetchResult {
  finalUrl: string;
  body: string;
  contentType: string;
}

export async function safeFetch(inputUrl: string): Promise<SafeFetchResult> {
  let currentUrl: URL;
  try {
    currentUrl = new URL(inputUrl);
  } catch {
    throw new SsrfBlockedError("Not a valid URL");
  }

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    assertUrlIsSafe(currentUrl);
    await assertHostIsSafe(currentUrl.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "georgep.ai-event-parser/1.0" },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Request timed out after 10 seconds");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new SsrfBlockedError("Redirect response had no Location header");
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const body = await readBodyWithLimit(response, MAX_BYTES);
    return { finalUrl: currentUrl.toString(), body, contentType };
  }

  throw new SsrfBlockedError("Too many redirects (max 3)");
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new Error("Response body exceeded 2 MB limit");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
