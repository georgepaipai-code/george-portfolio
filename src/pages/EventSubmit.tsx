import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function encodeForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export default function EventSubmit() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm({
          "form-name": "event-submission",
          name,
          email,
          eventLink,
          note,
          "bot-field": honeypot,
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting that. Mind trying again?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="mx-auto max-w-lg px-6 pb-24 pt-28 md:px-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-amber-400/70">Events</p>
        <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Submit an event</h1>
        <p className="mt-3 text-muted-foreground">
          Know about a great event for Bay Area founders? Send it over and I&apos;ll take a look.
        </p>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-card-border bg-card p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h2 className="font-display text-lg font-semibold">Thanks for the tip!</h2>
            <p className="text-muted-foreground">I&apos;ll check it out and add it if it&apos;s a fit.</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/events">Back to events</Link>
            </Button>
          </div>
        ) : (
          <form
            name="event-submission"
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLink">Event link</Label>
              <Input
                id="eventLink"
                type="url"
                required
                placeholder="https://..."
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Short note (optional)</Label>
              <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            {/* Honeypot - real fields for humans never touch this */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="bot-field">Leave this field blank</label>
              <input
                id="bot-field"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Submit event"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
