import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { adminParseLink, ApiError } from "@/lib/events-api";
import type { EventDraft } from "@/types/event";

export function ParseLinkPanel({
  onParsed,
}: {
  onParsed: (draft: EventDraft, missingFields: string[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReadLink() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await adminParseLink(url.trim());
      onParsed(result.draft, result.missingFields);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't read that link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="https://lu.ma/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button type="button" onClick={handleReadLink} disabled={loading || !url.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Read link"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Paste an event link and I&apos;ll try to fill in the form below. Fields marked &quot;Check
        this&quot; need a once-over.
      </p>
    </div>
  );
}
