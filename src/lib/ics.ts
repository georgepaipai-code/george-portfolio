import type { EventRecord } from "@/types/event";

function toIcsDate(isoString: string): string {
  return new Date(isoString).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function defaultEnd(event: EventRecord): string {
  if (event.end) return event.end;
  return new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
}

function locationText(event: EventRecord): string {
  if (event.isOnline) return "Online";
  return [event.locationName, event.address].filter(Boolean).join(", ");
}

export function buildGoogleCalendarUrl(event: EventRecord): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toIcsDate(event.start)}/${toIcsDate(defaultEnd(event))}`,
    details: [event.description, event.registrationUrl].filter(Boolean).join("\n\n"),
    location: locationText(event),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildIcsContent(event: EventRecord): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//georgep.ai//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@georgep.ai`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(defaultEnd(event))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(locationText(event))}`,
    `DESCRIPTION:${escapeIcsText([event.description, event.registrationUrl].filter(Boolean).join("\n\n"))}`,
    `URL:${event.registrationUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcsFile(event: EventRecord): void {
  const content = buildIcsContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
