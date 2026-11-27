import { describe, expect, it } from "vitest";
import { formatEventDate, formatClock } from "../miniprogram/utils/format";

describe("event date formatting", () => {
  it("multi-day events print both dates", () => {
    expect(formatEventDate("2026-12-18T14:00:00+08:00", "2026-12-19T17:30:00+08:00")).toBe("12 月 18 日 - 12 月 19 日");
  });
  it("same-day events print one date plus the time range", () => {
    expect(formatEventDate("2026-12-18T14:00:00+08:00", "2026-12-18T17:30:00+08:00")).toBe("12 月 18 日 14:00-17:30");
  });
  it("a month boundary still counts as multi-day", () => {
    expect(formatEventDate("2026-12-31T20:00:00+08:00", "2027-01-01T01:00:00+08:00")).toBe("12 月 31 日 - 1 月 1 日");
  });
  it("multi-day output matches the documented pattern", () => {
    const text = formatEventDate("2026-11-02T09:00:00+08:00", "2026-11-03T18:00:00+08:00");
    expect(text).toMatch(/^\d+ 月 \d+ 日 - \d+ 月 \d+ 日$/);
  });
  it("same-day output never contains the dash separator", () => {
    expect(formatEventDate("2026-11-02T09:00:00+08:00", "2026-11-02T18:00:00+08:00")).not.toContain(" - ");
  });
  it("an unparseable range renders as an empty string", () => {
    expect(formatEventDate("not-a-date", "also-not")).toBe("");
  });
  it("clock values are zero padded", () => {
    expect(formatClock(new Date("2026-12-18T09:05:00+08:00"))).toBe("09:05");
  });
});
