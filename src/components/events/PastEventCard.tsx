import { Link } from "wouter";
import { Globe } from "lucide-react";
import { formatPacificDateHeading } from "@/lib/timezone";
import type { EventRecord } from "@/types/event";

export function PastEventCard({ event }: { event: EventRecord }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-lg border border-card-border bg-card transition-colors hover:border-primary/40"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Globe className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-display text-sm font-semibold text-foreground">{event.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatPacificDateHeading(event.start)}</p>
      </div>
    </Link>
  );
}
