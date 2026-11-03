import type { EventDraft } from "../../../src/types/event";

export class ValidationError extends Error {}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function asOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new ValidationError(`"${field}" must be a string`);
  return value;
}

function asOptionalUrl(value: unknown, field: string): string | undefined {
  const str = asOptionalString(value, field);
  if (str === undefined) return undefined;
  if (!isHttpUrl(str)) throw new ValidationError(`"${field}" must be a valid http:// or https:// URL`);
  return str;
}

function asOptionalIsoDate(value: unknown, field: string): string | undefined {
  const str = asOptionalString(value, field);
  if (str === undefined) return undefined;
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) throw new ValidationError(`"${field}" must be a valid ISO datetime`);
  return date.toISOString();
}

function asOptionalBool(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "boolean") throw new ValidationError(`"${field}" must be a boolean`);
  return value;
}

function asOptionalTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new ValidationError(`"tags" must be an array of strings`);
  }
  return value.map((t) => t.trim()).filter(Boolean);
}

/**
 * Validates and normalizes an incoming event payload.
 * On create (`requireCore: true`) title/start/registrationUrl are mandatory.
 * On update, every field is optional and only present keys are validated.
 */
export function validateEventInput(body: unknown, requireCore: boolean): EventDraft {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const title = asOptionalString(b.title, "title");
  const start = asOptionalIsoDate(b.start, "start");
  const registrationUrl = asOptionalUrl(b.registrationUrl, "registrationUrl");

  if (requireCore) {
    if (!title) throw new ValidationError('"title" is required');
    if (!start) throw new ValidationError('"start" is required and must be a valid ISO datetime');
    if (!registrationUrl) throw new ValidationError('"registrationUrl" is required and must be http(s)');
  }

  const draft: EventDraft = {};
  if (title !== undefined) draft.title = title;
  if (start !== undefined) draft.start = start;
  if (registrationUrl !== undefined) draft.registrationUrl = registrationUrl;

  const end = asOptionalIsoDate(b.end, "end");
  if (end !== undefined) draft.end = end;

  const timezone = asOptionalString(b.timezone, "timezone");
  draft.timezone = timezone ?? "America/Los_Angeles";

  const locationName = asOptionalString(b.locationName, "locationName");
  if (locationName !== undefined) draft.locationName = locationName;

  const address = asOptionalString(b.address, "address");
  if (address !== undefined) draft.address = address;

  const city = asOptionalString(b.city, "city");
  if (city !== undefined) draft.city = city;

  draft.isOnline = asOptionalBool(b.isOnline, "isOnline", false);

  const imageUrl = asOptionalUrl(b.imageUrl, "imageUrl");
  if (imageUrl !== undefined) draft.imageUrl = imageUrl;

  const hostName = asOptionalString(b.hostName, "hostName");
  if (hostName !== undefined) draft.hostName = hostName;

  const description = asOptionalString(b.description, "description");
  if (description !== undefined) draft.description = description;

  const sourceUrl = asOptionalUrl(b.sourceUrl, "sourceUrl");
  if (sourceUrl !== undefined) draft.sourceUrl = sourceUrl;

  draft.tags = asOptionalTags(b.tags);
  draft.featured = asOptionalBool(b.featured, "featured", false);
  draft.cohosted = asOptionalBool(b.cohosted, "cohosted", false);

  const cohostLabel = asOptionalString(b.cohostLabel, "cohostLabel");
  if (cohostLabel !== undefined) draft.cohostLabel = cohostLabel;

  return draft;
}
