import { describe, expect, it } from "vitest";
import { quotaView } from "../miniprogram/utils/format";

describe("quota progress", () => {
  it("reports the signed over total ratio", () => {
    const v = quotaView(40, 18, 2);
    expect(v.ratioText).toBe("18/40");
    expect(v.percent).toBe(45);
    expect(v.waitlistText).toBe("候补 2 人");
  });
  it("zero signups with a zero total stays at zero percent", () => {
    const v = quotaView(0, 0, 0);
    expect(v.percent).toBe(0);
    expect(v.ratioText).toBe("0/0");
    expect(v.full).toBe(false);
  });
  it("a full event is capped at 100 percent", () => {
    const v = quotaView(12, 12, 6);
    expect(v.percent).toBe(100);
    expect(v.full).toBe(true);
  });
  it("an over-booked event is capped and flagged as overflow", () => {
    const v = quotaView(10, 13, 0);
    expect(v.percent).toBe(100);
    expect(v.overflow).toBe(true);
  });
  it("a partial fill keeps one decimal place of precision", () => {
    const v = quotaView(30, 7, 0);
    expect(v.percent).toBe(23.3);
  });
});
