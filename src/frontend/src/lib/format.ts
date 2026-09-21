import {
  format,
  formatDistanceToNowStrict,
  isThisYear,
  isToday,
} from "date-fns";

/**
 * Motoko `Time.now()` values are nanosecond bigints. Convert through this
 * helper before any JavaScript `Date` operation.
 */
export function timestampToDate(
  timestamp: bigint | number | null | undefined,
): Date | null {
  if (timestamp === null || timestamp === undefined) return null;
  const nanos =
    typeof timestamp === "bigint" ? timestamp : BigInt(Math.trunc(timestamp));
  const date = new Date(Number(nanos / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Relative label such as "16 min ago" for note cards. */
export function formatRelativeTime(
  timestamp: bigint | number | null | undefined,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown date";
  return `${formatDistanceToNowStrict(date)} ago`;
}

/** Absolute label used in tooltips and detail views. */
export function formatAbsoluteTime(
  timestamp: bigint | number | null | undefined,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown date";
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
  if (isThisYear(date)) return format(date, "MMM d, h:mm a");
  return format(date, "MMM d, yyyy");
}

/** Short date used for "created" metadata. */
export function formatShortDate(
  timestamp: bigint | number | null | undefined,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown";
  return isThisYear(date) ? format(date, "MMM d") : format(date, "MMM d, yyyy");
}

/** Strip HTML from a rich-text body to build a card preview. */
export function toPlainText(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Count of completed checklist items, e.g. "2/5". */
export function checklistProgress(
  items: { completed: boolean }[],
): string | null {
  if (items.length === 0) return null;
  const done = items.filter((item) => item.completed).length;
  return `${done}/${items.length}`;
}
