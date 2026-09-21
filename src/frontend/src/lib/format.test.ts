import {
  checklistProgress,
  formatAbsoluteTime,
  formatRelativeTime,
  formatShortDate,
  timestampToDate,
  toPlainText,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

const NOW_NS = 1_700_000_000_000_000_000n; // 2023-11-14T22:13:20Z

describe("timestampToDate", () => {
  it("converts nanosecond bigints to a Date", () => {
    expect(timestampToDate(NOW_NS)?.getTime()).toBe(1_700_000_000_000);
  });

  it("returns null for null and undefined", () => {
    expect(timestampToDate(null)).toBeNull();
    expect(timestampToDate(undefined)).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  it("renders a relative label for a past timestamp", () => {
    const oneHourAgo = NOW_NS - 3_600_000_000_000n;
    expect(formatRelativeTime(oneHourAgo)).toMatch(/ago$/);
  });

  it("falls back to a placeholder for a missing timestamp", () => {
    expect(formatRelativeTime(null)).toBe("Unknown date");
  });
});

describe("formatAbsoluteTime", () => {
  it("returns a non-empty label for a valid timestamp", () => {
    expect(formatAbsoluteTime(NOW_NS)).not.toBe("Unknown date");
  });

  it("returns a placeholder for a missing timestamp", () => {
    expect(formatAbsoluteTime(undefined)).toBe("Unknown date");
  });
});

describe("formatShortDate", () => {
  it("returns a short date for a valid timestamp", () => {
    expect(formatShortDate(NOW_NS)).not.toBe("Unknown");
  });

  it("returns Unknown for a missing timestamp", () => {
    expect(formatShortDate(null)).toBe("Unknown");
  });
});

describe("toPlainText", () => {
  it("strips HTML tags and collapses whitespace", () => {
    expect(toPlainText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("decodes common entities", () => {
    expect(toPlainText("Tom &amp; Jerry")).toBe("Tom & Jerry");
  });

  it("truncates long bodies with an ellipsis", () => {
    const long = "a".repeat(200);
    const result = toPlainText(long, 10);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(11);
  });
});

describe("checklistProgress", () => {
  it("returns null for an empty checklist", () => {
    expect(checklistProgress([])).toBeNull();
  });

  it("counts completed items", () => {
    expect(
      checklistProgress([
        { completed: true },
        { completed: false },
        { completed: true },
      ]),
    ).toBe("2/3");
  });
});
