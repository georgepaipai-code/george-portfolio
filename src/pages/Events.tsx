import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { NewsletterBox } from "@/components/events/NewsletterBox";
import { FilterChips, type FilterValue } from "@/components/events/FilterChips";
import { EventCard } from "@/components/events/EventCard";
import { DateGroupHeader } from "@/components/events/DateGroupHeader";
import { EventsSkeleton } from "@/components/events/EventsSkeleton";
import { EmptyState } from "@/components/events/EmptyState";
import { getUpcomingEvents, getPastEvents } from "@/lib/events-api";
import { formatPacificDateHeading, pacificDateKey } from "@/lib/timezone";
import type { EventRecord } from "@/types/event";

function groupByDate(events: EventRecord[]): { key: string; label: string; events: EventRecord[] }[] {
  const groups = new Map<string, EventRecord[]>();
  for (const event of events) {
    const key = pacificDateKey(event.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries()).map(([key, groupEvents]) => ({
    key,
    label: formatPacificDateHeading(groupEvents[0].start),
    events: groupEvents,
  }));
}

export default function Events() {
  const [showPast, setShowPast] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", showPast],
    queryFn: () => (showPast ? getPastEvents() : getUpcomingEvents()),
  });

  const tags = useMemo(() => {
    if (!events) return [];
    const set = new Set<string>();
    for (const event of events) for (const tag of event.tags) set.add(tag);
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    if (!events) return [];
    if (filter === "all") return events;
    if (filter === "picks") return events.filter((e) => e.featured);
    if (filter === "cohosted") return events.filter((e) => e.cohosted);
    const tag = filter.slice("tag:".length);
    return events.filter((e) => e.tags.includes(tag));
  }, [events, filter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-amber-400/70">Events</p>
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          George Pai&apos;s Bay Area Founder Events
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Handpicked events for Bay Area founders, from pre-seed through Series B. Includes events I
          host and cosponsor, plus the best meetups, workshops, and demo days I&apos;d send a founder
          friend to.
        </p>

        <div className="mt-8">
          <NewsletterBox />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterChips tags={tags} active={filter} onChange={setFilter} />
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/events/submit">Submit an event</Link>
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {showPast ? "← Back to upcoming events" : "Past events →"}
          </button>
        </div>

        <div className="mt-6 space-y-8">
          {isLoading ? (
            <EventsSkeleton />
          ) : groups.length === 0 ? (
            <EmptyState
              message={
                showPast
                  ? "No past events to show."
                  : "No upcoming events yet. Subscribe to hear about the next one."
              }
            />
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <DateGroupHeader label={group.label} />
                <div className="mt-3 space-y-3">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
