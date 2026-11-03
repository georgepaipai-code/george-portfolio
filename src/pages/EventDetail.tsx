import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, MapPin, Globe, CalendarPlus, Link as LinkIcon, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getEventById, ApiError } from "@/lib/events-api";
import { formatPacificFullDate, formatPacificTime } from "@/lib/timezone";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/ics";

function useDocumentMeta(title: string | undefined, description: string | undefined, image: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    document.title = `${title} | George Pai's Bay Area Founder Events`;

    const tags: { selector: string; attr: string; name: string; value: string }[] = [
      { selector: 'meta[property="og:title"]', attr: "property", name: "og:title", value: title },
      { selector: 'meta[property="og:description"]', attr: "property", name: "og:description", value: description ?? "" },
      { selector: 'meta[property="og:image"]', attr: "property", name: "og:image", value: image ?? "" },
    ];

    const created: HTMLMetaElement[] = [];
    for (const tag of tags) {
      let el = document.head.querySelector<HTMLMetaElement>(tag.selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(tag.attr, tag.name);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", tag.value);
    }

    return () => {
      document.title = previousTitle;
      for (const el of created) el.remove();
    };
  }, [title, description, image]);
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
    retry: false,
  });

  useDocumentMeta(event?.title, event?.description, event?.imageUrl);

  const notFound = error instanceof ApiError;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 pt-28 md:px-8">
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 pt-32 text-center md:px-8">
          <h1 className="font-display text-2xl font-bold">We couldn&apos;t find that event</h1>
          <p className="text-muted-foreground">
            It may have been removed, or the link might be off. Check the full list instead.
          </p>
          <Button asChild>
            <Link href="/events">Browse all events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const mapsUrl = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`
    : undefined;

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8">
        {event.imageUrl && (
          <div className="mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
            <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          {event.featured && <Badge className="bg-primary/90">George&apos;s Pick</Badge>}
          {event.cohosted && <Badge variant="secondary">{event.cohostLabel || "Cohosted"}</Badge>}
          {event.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{event.title}</h1>

        <div className="mt-4 space-y-2 text-muted-foreground">
          <p className="font-medium text-foreground">
            {formatPacificFullDate(event.start)} · {formatPacificTime(event.start)}
          </p>
          <p className="flex items-center gap-2">
            {event.isOnline ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            {event.isOnline ? "Online" : event.locationName || event.city || "Location TBA"}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open in Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
          {event.hostName && (
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" /> Hosted by {event.hostName}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <a href={event.registrationUrl} target="_blank" rel="noreferrer">
              Register <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={handleCopyLink}>
            <LinkIcon className="mr-1 h-4 w-4" /> Copy link
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
          >
            <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
          </a>
          <button
            type="button"
            onClick={() => downloadIcsFile(event)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
          >
            <CalendarPlus className="h-4 w-4" /> Download .ics
          </button>
        </div>

        {event.description && (
          <div className="mt-10 border-t border-card-border pt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">About this event</h2>
            <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
