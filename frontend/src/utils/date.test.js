import { expect, test } from "vitest";
import { formatDuration, toDateTimeLocal } from "./date.js";

test("formatDuration shows hours and minutes", () => {
  expect(formatDuration("2026-01-01T09:00:00Z", "2026-01-01T17:30:00Z")).toBe(
    "8h 30m",
  );
  expect(formatDuration("2026-01-01T09:00:00Z", "2026-01-01T09:45:00Z")).toBe(
    "45m",
  );
});

test("toDateTimeLocal formats a date for a datetime-local input", () => {
  expect(toDateTimeLocal(new Date(2026, 0, 5, 9, 7))).toBe("2026-01-05T09:07");
});
