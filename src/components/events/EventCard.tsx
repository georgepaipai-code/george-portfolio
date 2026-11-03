import { Link } from "wouter";
import { MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPacificTime } from "@/lib/timezone";
import { recommendationLabel } from "@/lib/recommendation";
import type { EventRecord } from "@/types/event";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-4 rounded-lg border border-card-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
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

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">
          {formatPacificTime(event.start)}
        </div>
        <h3 className="truncate font-display text-base font-semibold text-foreground sm:text-lg">
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {event.hostName && <span className="truncate">{event.hostName}</span>}
          <span className="flex items-center gap-1 truncate">
            {event.isOnline ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {event.isOnline ? "Online" : event.locationName || event.city || "TBA"}
          </span>
        </div>
        {(event.recommendation || event.cohosted) && (
          <div className="flex gap-2 pt-1">
            {recommendationLabel(event.recommendation) && (
              <Badge variant="default" className="bg-primary/90">
                {recommendationLabel(event.recommendation)}
              </Badge>
            )}
            {event.cohosted && <Badge variant="secondary">Cohosted</Badge>}
          </div>
        )}
      </div>
    </Link>
  );
}
