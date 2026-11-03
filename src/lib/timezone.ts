const PACIFIC_TZ = "America/Los_Angeles";

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUTC - date.getTime()) / 60000;
}

/** Converts a "YYYY-MM-DD" + "HH:mm" pair, interpreted as Pacific wall-clock time, to a UTC ISO string. */
export function pacificWallTimeToUtcIso(dateStr: string, timeStr: string): string {
  const guess = new Date(`${dateStr}T${timeStr}:00.000Z`);
  const offsetMin = getTimeZoneOffsetMinutes(guess, PACIFIC_TZ);
  return new Date(guess.getTime() - offsetMin * 60000).toISOString();
}

/** Splits a UTC ISO string into Pacific-local "YYYY-MM-DD" and "HH:mm" parts, for populating form inputs. */
export function utcIsoToPacificParts(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/** e.g. "Thu, Nov 13" */
export function formatPacificDateHeading(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(isoString));
}

/** e.g. "6:30 PM PST" */
export function formatPacificTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(isoString));
}

/** e.g. "Thursday, November 13, 2026" */
export function formatPacificFullDate(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoString));
}

/** A stable "YYYY-MM-DD" key (Pacific) used to group events by day. */
export function pacificDateKey(isoString: string): string {
  return utcIsoToPacificParts(isoString).date;
}
