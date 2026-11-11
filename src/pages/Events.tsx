import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { NewsletterBox } from "@/components/events/NewsletterBox";
import { FilterChips, type FilterValue } from "@/components/events/FilterChips";
import { EventCard } from "@/components/events/EventCard";
import { PastEventCard } from "@/components/events/PastEventCard";
import { DateGroupHeader } from "@/components/events/DateGroupHeader";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventsSkeleton } from "@/components/events/EventsSkeleton";
import { EmptyState } from "@/components/events/EmptyState";
import { getUpcomingEvents, getPastEvents } from "@/lib/events-api";
import { formatPacificDateHeading, pacificDateKey } from "@/lib/timezone";
import type { EventRecord } from "@/types/event";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_STEP = 5;

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
  const [filter, setFilter] = useState<FilterValue>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [pendingScrollKey, setPendingScrollKey] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: getUpcomingEvents,
  });

  const { data: pastEvents } = useQuery({
    queryKey: ["events", "past"],
    queryFn: getPastEvents,
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
    if (filter === "recommend") return events.filter((e) => e.recommendation === "recommend");
    if (filter === "highlyRecommend") return events.filter((e) => e.recommendation === "highlyRecommend");
    if (filter === "cohosted") return events.filter((e) => e.cohosted);
    const tag = filter.slice("tag:".length);
    return events.filter((e) => e.tags.includes(tag));
  }, [events, filter]);

  // The visible-count limit resets whenever the filter changes.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const groups = useMemo(() => groupByDate(visible), [visible]);

  // Once enough events are revealed to include the target date, scroll to it.
  useEffect(() => {
    if (!pendingScrollKey) return;
    const el = document.getElementById(`date-${pendingScrollKey}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScrollKey(null);
    }
  }, [pendingScrollKey, groups]);

  function handleJumpToDate(dateKey: string) {
    const index = filtered.findIndex((e) => pacificDateKey(e.start) === dateKey);
    if (index === -1) return;
    setVisibleCount((v) => Math.max(v, index + 1));
    setPendingScrollKey(dateKey);
  }

  const recentPastEvents = (pastEvents ?? []).slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 md:px-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-amber-400/70">Events</p>
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          George Pai&apos;s Bay Area Founder Events
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Handpicked events for Bay Area founders, from pre-seed through Series B. Includes events I
          host and cosponsor, plus the best meetups, workshops, and demo days I&apos;d send a founder
          friend to.
        </p>

        <div className="mt-10 lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
          <div className="min-w-0">
            <FilterChips tags={tags} active={filter} onChange={setFilter} />

            <div className="mt-6 space-y-8">
              {isLoading ? (
                <EventsSkeleton />
              ) : groups.length === 0 ? (
                <EmptyState message="No upcoming events yet. Subscribe to hear about the next one." />
              ) : (
                groups.map((group) => (
                  <div key={group.key} id={`date-${group.key}`}>
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

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => setVisibleCount((v) => v + LOAD_MORE_STEP)}>
                  See more
                </Button>
              </div>
            )}

            {recentPastEvents.length > 0 && (
              <section className="mt-16">
                <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-foreground">
                  Past Events
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recentPastEvents.map((event) => (
                    <div key={event.id} className="w-36 flex-shrink-0 sm:w-44">
                      <PastEventCard event={event} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-16">
              <NewsletterBox />
            </div>

            <div className="mt-16 border-t border-card-border pt-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Hosting something founders should know about? Send it my way and I&apos;ll review it for
                the list.
              </p>
              <Button asChild variant="outline">
                <Link href="/events/submit">Submit an event</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 lg:order-last lg:mt-0">
            <div className="lg:sticky lg:top-28">
              <EventsCalendar events={filtered} onJumpToDate={handleJumpToDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
