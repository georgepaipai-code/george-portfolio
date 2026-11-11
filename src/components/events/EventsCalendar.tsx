import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pacificDateKey } from "@/lib/timezone";
import type { EventRecord } from "@/types/event";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface CalendarCell {
  day: number;
  dateKey: string;
}

export function EventsCalendar({
  events,
  onJumpToDate,
}: {
  events: EventRecord[];
  onJumpToDate: (dateKey: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const eventDateKeys = useMemo(() => {
    const set = new Set<string>();
    for (const event of events) set.add(pacificDateKey(event.start));
    return set;
  }, [events]);

  const cells = useMemo<(CalendarCell | null)[]>(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: (CalendarCell | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ day, dateKey: `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}` });
    }
    return result;
  }, [viewYear, viewMonth]);

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const monthLabel = MONTH_LABEL_FORMAT.format(new Date(viewYear, viewMonth, 1));

  return (
    <div className="rounded-lg border border-card-border bg-card p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="font-display text-xs font-semibold text-foreground">{monthLabel}</span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <div className="mt-0.5 grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} />;
          const hasEvent = eventDateKeys.has(cell.dateKey);
          return (
            <button
              key={cell.dateKey}
              type="button"
              disabled={!hasEvent}
              onClick={() => onJumpToDate(cell.dateKey)}
              className={cn(
                "aspect-square rounded-md text-[11px] transition-colors",
                hasEvent
                  ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/80"
                  : "cursor-default text-muted-foreground/40",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
