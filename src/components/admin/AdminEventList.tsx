import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPacificDateHeading, formatPacificTime } from "@/lib/timezone";
import { recommendationLabel } from "@/lib/recommendation";
import type { EventRecord } from "@/types/event";

function Row({
  event,
  onEdit,
  onDeleteRequest,
}: {
  event: EventRecord;
  onEdit: (event: EventRecord) => void;
  onDeleteRequest: (event: EventRecord) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-medium text-foreground">{event.title}</h3>
          {recommendationLabel(event.recommendation) && (
            <Badge className="bg-primary/90">{recommendationLabel(event.recommendation)}</Badge>
          )}
          {event.cohosted && <Badge variant="secondary">Cohosted</Badge>}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatPacificDateHeading(event.start)} · {formatPacificTime(event.start)}
        </p>
      </div>
      <div className="flex gap-2 sm:flex-shrink-0">
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onEdit(event)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={() => onDeleteRequest(event)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export function AdminEventList({
  upcoming,
  past,
  onEdit,
  onDeleteRequest,
}: {
  upcoming: EventRecord[];
  past: EventRecord[];
  onEdit: (event: EventRecord) => void;
  onDeleteRequest: (event: EventRecord) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <Row key={event.id} event={event} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Past ({past.length})
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past events.</p>
        ) : (
          <div className="space-y-3">
            {past.map((event) => (
              <Row key={event.id} event={event} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
