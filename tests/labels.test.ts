import { describe, expect, it } from "vitest";
import { resolveLabel, fallbackLabel, FALLBACK_LABELS } from "../miniprogram/utils/signup";
import type { SignupState } from "../miniprogram/utils/types";

function event(state: SignupState, label: string, extra: any = {}) {
  return {
    signupState: state,
    signupStateLabel: label,
    waitlistPosition: extra.waitlistPosition ?? null,
    signupOpenAt: extra.signupOpenAt ?? null,
  };
}

describe("the API label always wins over the local fallback", () => {
  it("a custom API label is rendered verbatim", () => {
    expect(resolveLabel(event("can_signup", "立即报名A"))).toBe("立即报名A");
  });
  it("an API label different from the local map is still used", () => {
    expect(resolveLabel(event("full", "本场已约满"))).toBe("本场已约满");
  });
  it("a blank API label falls back to the local map", () => {
    expect(resolveLabel(event("reviewing", "   "))).toBe("审核中");
  });
  it("a missing API label falls back to the local map", () => {
    expect(resolveLabel(event("closed", ""))).toBe("报名已关闭");
  });
});

describe("fallback labels per state", () => {
  it("waitlisted embeds the waitlist position", () => {
    expect(fallbackLabel("waitlisted", { waitlistPosition: 3, signupOpenAt: null })).toBe("候补第 3 位");
  });
  it("waitlisted without a position reads as position 1", () => {
    expect(fallbackLabel("waitlisted", { waitlistPosition: null, signupOpenAt: null })).toBe("候补第 1 位");
  });
  it("not_open prints the month and day of the opening time", () => {
    expect(fallbackLabel("not_open", { waitlistPosition: null, signupOpenAt: "2026-12-05T10:00:00+08:00" })).toBe("12 月 5 日开放报名");
  });
  it("not_open matches the month-day pattern", () => {
    const text = fallbackLabel("not_open", { waitlistPosition: null, signupOpenAt: "2027-01-09T10:00:00+08:00" });
    expect(text).toMatch(/^\d+ 月 \d+ 日开放报名$/);
  });
  it("every state has a non-empty fallback label", () => {
    for (const state of Object.keys(FALLBACK_LABELS) as SignupState[]) {
      expect(FALLBACK_LABELS[state].length).toBeGreaterThan(0);
    }
  });
});
