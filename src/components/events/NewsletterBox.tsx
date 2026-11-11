import { useRef } from "react";
import { useBeehiivScript } from "@/hooks/useBeehiivScript";

export function NewsletterBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  useBeehiivScript(containerRef);

  return (
    <div className="rounded-xl border border-card-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Get new events in your inbox</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Don&apos;t miss out on the next event — subscribe to my twice-a-month curated events
        newsletter. Subscribers also get periodic free passes to events and conferences, and
        invites to George Pai&apos;s signature parties. IYKYK.
      </p>
      <div ref={containerRef} className="mt-4" />
    </div>
  );
}
