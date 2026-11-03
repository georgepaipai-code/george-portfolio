export interface EventRecord {
  id: string;
  title: string;
  start: string; // ISO datetime, UTC
  end?: string; // ISO datetime, UTC
  timezone: string; // IANA tz, default America/Los_Angeles
  locationName?: string;
  address?: string;
  city?: string;
  isOnline: boolean;
  imageUrl?: string;
  hostName?: string;
  description?: string; // plain text
  registrationUrl: string;
  sourceUrl?: string;
  tags: string[];
  featured: boolean;
  cohosted: boolean;
  cohostLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventDraft = Partial<
  Omit<EventRecord, "id" | "createdAt" | "updatedAt" | "tags" | "isOnline" | "featured" | "cohosted">
> & {
  tags?: string[];
  isOnline?: boolean;
  featured?: boolean;
  cohosted?: boolean;
};

export interface ParseEventResponse {
  draft: EventDraft;
  missingFields: string[];
}
