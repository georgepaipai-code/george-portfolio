import { formatPacificDateHeading, formatPacificTime } from "@/lib/timezone";
import type { EventRecord } from "@/types/event";

export type NewsletterRangeDays = 7 | 14 | 30;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function locationLabel(event: EventRecord): string {
  return event.isOnline ? "Online" : event.locationName || event.city || "TBA";
}

function oneLineSummary(description?: string): string {
  if (!description) return "";
  const firstLine = description.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.length > 140 ? `${firstLine.slice(0, 137)}...` : firstLine;
}

export function selectNewsletterEvents(upcoming: EventRecord[], rangeDays: NewsletterRangeDays): EventRecord[] {
  const cutoff = Date.now() + rangeDays * 24 * 60 * 60 * 1000;
  const inRange = upcoming.filter((e) => new Date(e.start).getTime() <= cutoff);
  const byStart = (a: EventRecord, b: EventRecord) => new Date(a.start).getTime() - new Date(b.start).getTime();
  const picks = inRange.filter((e) => e.featured).sort(byStart);
  const rest = inRange.filter((e) => !e.featured).sort(byStart);
  return [...picks, ...rest];
}

function eventUrl(id: string): string {
  return `${window.location.origin}/events/${id}`;
}

function eventsIndexUrl(): string {
  return `${window.location.origin}/events`;
}

export function buildNewsletterHtml(events: EventRecord[], introLine: string): string {
  const parts: string[] = [`<p>${escapeHtml(introLine)}</p>`];

  for (const event of events) {
    const summary = oneLineSummary(event.description);
    const metaLine = [
      `${formatPacificDateHeading(event.start)} · ${formatPacificTime(event.start)}`,
      locationLabel(event),
      event.hostName,
    ]
      .filter(Boolean)
      .join(" — ");

    parts.push(
      [
        `<p><strong><a href="${eventUrl(event.id)}">${escapeHtml(event.title)}</a></strong><br/>`,
        `${escapeHtml(metaLine)}`,
        summary ? `<br/>${escapeHtml(summary)}` : "",
        `</p>`,
      ].join(""),
    );
  }

  parts.push(`<p><a href="${eventsIndexUrl()}">See all events →</a></p>`);
  return parts.join("\n");
}

export function buildNewsletterPlainText(events: EventRecord[], introLine: string): string {
  const parts: string[] = [introLine];

  for (const event of events) {
    const summary = oneLineSummary(event.description);
    const metaLine = [
      `${formatPacificDateHeading(event.start)} · ${formatPacificTime(event.start)}`,
      locationLabel(event),
      event.hostName,
    ]
      .filter(Boolean)
      .join(" — ");

    parts.push([event.title, metaLine, summary, eventUrl(event.id)].filter(Boolean).join("\n"));
  }

  parts.push(`See all events: ${eventsIndexUrl()}`);
  return parts.join("\n\n");
}

export async function copyRichAndPlainText(html: string, plain: string): Promise<void> {
  const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
  if (navigator.clipboard && ClipboardItemCtor) {
    const item = new ClipboardItemCtor({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return;
  }
  await navigator.clipboard.writeText(plain);
}
