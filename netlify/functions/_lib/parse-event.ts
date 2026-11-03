import Anthropic from "@anthropic-ai/sdk";
import { safeFetch } from "./ssrf-guard";
import { requireEnv } from "./env";
import type { EventDraft } from "../../../src/types/event";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  trade: "™",
  copy: "©",
  reg: "®",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1]?.toLowerCase() === "x";
      const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    const replacement = NAMED_ENTITIES[body.toLowerCase()];
    return replacement ?? match;
  });
}

// ---- schema.org Event JSON-LD ----

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return blocks;
}

function flattenJsonLd(blocks: unknown[]): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const block of blocks) {
    if (Array.isArray(block)) nodes.push(...block);
    else if (block && typeof block === "object" && Array.isArray((block as any)["@graph"])) {
      nodes.push(...(block as any)["@graph"]);
    } else if (block && typeof block === "object") {
      nodes.push(block as Record<string, unknown>);
    }
  }
  return nodes;
}

function isEventNode(node: Record<string, unknown>): boolean {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => typeof t === "string" && t.toLowerCase().includes("event"));
}

function findEventNode(html: string): Record<string, unknown> | null {
  const nodes = flattenJsonLd(extractJsonLdBlocks(html));
  return nodes.find(isEventNode) ?? null;
}

function imageUrlFrom(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return imageUrlFrom(image[0]);
  if (typeof image === "object" && typeof (image as any).url === "string") return (image as any).url;
  return undefined;
}

function addressStringFrom(address: unknown): string | undefined {
  if (!address) return undefined;
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    const a = address as Record<string, unknown>;
    const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode].filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );
    return parts.length ? parts.join(", ") : undefined;
  }
  return undefined;
}

function cityFrom(address: unknown): string | undefined {
  if (address && typeof address === "object" && typeof (address as any).addressLocality === "string") {
    return (address as any).addressLocality;
  }
  return undefined;
}

function nameFrom(entity: unknown): string | undefined {
  if (!entity) return undefined;
  if (typeof entity === "string") return entity;
  if (Array.isArray(entity)) return nameFrom(entity[0]);
  if (typeof entity === "object" && typeof (entity as any).name === "string") return (entity as any).name;
  return undefined;
}

function mapJsonLdToDraft(node: Record<string, unknown>): EventDraft {
  const draft: EventDraft = {};

  if (typeof node.name === "string") draft.title = node.name;

  if (typeof node.startDate === "string") {
    const d = new Date(node.startDate);
    if (!Number.isNaN(d.getTime())) draft.start = d.toISOString();
  }
  if (typeof node.endDate === "string") {
    const d = new Date(node.endDate);
    if (!Number.isNaN(d.getTime())) draft.end = d.toISOString();
  }
  if (typeof node.description === "string") draft.description = decodeEntities(node.description);

  const img = imageUrlFrom(node.image);
  if (img) draft.imageUrl = img;

  const location = node.location as Record<string, unknown> | undefined;
  const locationType = Array.isArray(location?.["@type"]) ? location?.["@type"][0] : location?.["@type"];
  const attendanceMode = typeof node.eventAttendanceMode === "string" ? node.eventAttendanceMode : "";
  if (locationType === "VirtualLocation" || attendanceMode.includes("Online")) {
    draft.isOnline = true;
  }
  const locName = nameFrom(location);
  if (locName) draft.locationName = locName;
  const address = addressStringFrom(location?.address);
  if (address) draft.address = address;
  const city = cityFrom(location?.address);
  if (city) draft.city = city;

  const host = nameFrom(node.organizer) ?? nameFrom(node.performer);
  if (host) draft.hostName = host;

  const offers = node.offers as any;
  const offerUrl = Array.isArray(offers) ? offers[0]?.url : offers?.url;
  if (typeof offerUrl === "string") draft.registrationUrl = offerUrl;
  else if (typeof node.url === "string") draft.registrationUrl = node.url;

  return draft;
}

// ---- Open Graph fallback ----

function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const re = /<meta\s+[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const tag = match[0];
    const propMatch = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag);
    const contentMatch = /content\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (propMatch && contentMatch) {
      tags[propMatch[1].toLowerCase()] = decodeEntities(contentMatch[1]);
    }
  }
  return tags;
}

function mapOgToDraft(meta: Record<string, string>): EventDraft {
  const draft: EventDraft = {};
  if (meta["og:title"]) draft.title = meta["og:title"];
  if (meta["og:image"]) draft.imageUrl = meta["og:image"];
  if (meta["og:description"]) draft.description = meta["og:description"];
  return draft;
}

// ---- Claude fallback for whatever is still missing ----

function cleanPageText(html: string, maxChars: number): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|li|br|h[1-6]|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  text = text.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
  return text.slice(0, maxChars);
}

function missingCoreFields(draft: EventDraft): string[] {
  const missing: string[] = [];
  if (!draft.title) missing.push("title");
  if (!draft.start) missing.push("start");
  return missing;
}

async function fillGapsWithClaude(pageText: string, draft: EventDraft): Promise<EventDraft> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content:
          "Extract event details from this web page text and reply with ONLY a JSON object " +
          "(no markdown fences, no commentary) with these keys: title (string or null), " +
          "start (ISO 8601 datetime string or null - include a timezone offset if the page shows one, " +
          "otherwise assume America/Los_Angeles time), end (ISO 8601 string or null), " +
          "locationName (string or null), address (string or null), city (string or null), " +
          "isOnline (boolean), hostName (string or null), description (short plain-text string or null). " +
          "Use null for anything you cannot find with confidence.\n\nPAGE TEXT:\n" + pageText,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return draft;

  let parsed: unknown;
  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text);
  } catch {
    return draft; // never trust unparseable model output
  }
  if (typeof parsed !== "object" || parsed === null) return draft;
  const p = parsed as Record<string, unknown>;

  const merged: EventDraft = { ...draft };
  if (!merged.title && typeof p.title === "string" && p.title.trim()) merged.title = p.title.trim();
  if (!merged.start && typeof p.start === "string") {
    const d = new Date(p.start);
    if (!Number.isNaN(d.getTime())) merged.start = d.toISOString();
  }
  if (!merged.end && typeof p.end === "string") {
    const d = new Date(p.end);
    if (!Number.isNaN(d.getTime())) merged.end = d.toISOString();
  }
  if (!merged.locationName && typeof p.locationName === "string") merged.locationName = p.locationName;
  if (!merged.address && typeof p.address === "string") merged.address = p.address;
  if (!merged.city && typeof p.city === "string") merged.city = p.city;
  if (merged.isOnline === undefined && typeof p.isOnline === "boolean") merged.isOnline = p.isOnline;
  if (!merged.hostName && typeof p.hostName === "string") merged.hostName = p.hostName;
  if (!merged.description && typeof p.description === "string") merged.description = p.description;

  return merged;
}

// ---- entry point ----

export interface ParseResult {
  draft: EventDraft;
  missingFields: string[];
}

const BINARY_CONTENT_TYPES = ["image/", "video/", "audio/", "application/pdf", "application/octet-stream"];

export async function parseEventFromUrl(inputUrl: string): Promise<ParseResult> {
  const { finalUrl, body, contentType } = await safeFetch(inputUrl);

  if (BINARY_CONTENT_TYPES.some((t) => contentType.includes(t))) {
    throw new Error("That link points to a file, not a web page with event details");
  }

  let draft: EventDraft = { sourceUrl: finalUrl };

  const eventNode = findEventNode(body);
  if (eventNode) {
    draft = { ...draft, ...mapJsonLdToDraft(eventNode) };
  }

  const ogDraft = mapOgToDraft(extractMetaTags(body));
  draft = { ...ogDraft, ...draft }; // JSON-LD values win when both are present

  if (missingCoreFields(draft).length > 0) {
    const pageText = cleanPageText(body, 15_000);
    draft = await fillGapsWithClaude(pageText, draft);
  }

  const missingFields = [
    ...missingCoreFields(draft),
    ...(!draft.registrationUrl ? ["registrationUrl"] : []),
    ...(!draft.imageUrl ? ["imageUrl"] : []),
    ...(!draft.locationName && !draft.isOnline ? ["locationName"] : []),
  ];

  return { draft, missingFields };
}
