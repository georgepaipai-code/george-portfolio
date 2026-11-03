import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  buildNewsletterHtml,
  buildNewsletterPlainText,
  copyRichAndPlainText,
  selectNewsletterEvents,
  type NewsletterRangeDays,
} from "@/lib/newsletter";
import type { EventRecord } from "@/types/event";

const RANGE_OPTIONS: NewsletterRangeDays[] = [7, 14, 30];
const DEFAULT_INTRO = "Here's what's coming up for Bay Area founders:";

export function CopyNewsletterPanel({ upcomingEvents }: { upcomingEvents: EventRecord[] }) {
  const { toast } = useToast();
  const [range, setRange] = useState<NewsletterRangeDays>(14);
  const [introLine, setIntroLine] = useState(DEFAULT_INTRO);

  const selected = useMemo(() => selectNewsletterEvents(upcomingEvents, range), [upcomingEvents, range]);
  const plainText = useMemo(() => buildNewsletterPlainText(selected, introLine), [selected, introLine]);
  const html = useMemo(() => buildNewsletterHtml(selected, introLine), [selected, introLine]);

  async function handleCopy() {
    try {
      await copyRichAndPlainText(html, plainText);
      toast({ title: "Newsletter text copied", description: "Paste it into Beehiiv." });
    } catch {
      toast({ title: "Couldn't copy to clipboard", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-card-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="mr-2">Events in the next</Label>
        {RANGE_OPTIONS.map((days) => (
          <Button
            key={days}
            type="button"
            size="sm"
            variant={range === days ? "default" : "outline"}
            onClick={() => setRange(days)}
          >
            {days} days
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="introLine">Intro line</Label>
        <Textarea id="introLine" rows={2} value={introLine} onChange={(e) => setIntroLine(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Preview ({selected.length} event{selected.length === 1 ? "" : "s"})</Label>
        <div className="max-h-64 overflow-y-auto rounded-md border border-card-border bg-background p-3 text-sm text-muted-foreground">
          {selected.length === 0 ? (
            <p>No upcoming events in this range.</p>
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{plainText}</pre>
          )}
        </div>
      </div>

      <Button type="button" onClick={handleCopy} disabled={selected.length === 0} className="w-full">
        Copy newsletter
      </Button>
    </div>
  );
}
