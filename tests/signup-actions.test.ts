import { describe, expect, it } from "vitest";
import { resolveAction, isClickable } from "../miniprogram/utils/signup";
import type { SignupState } from "../miniprogram/utils/types";

const ctx = {
  eventId: "1",
  ticketId: "T20261218007",
  waitlistPosition: 3,
  currentPath: "/pages/event/detail/index?id=1",
};

const STATES: SignupState[] = ["can_signup","can_waitlist","reviewing","signed","waitlisted","need_auth","not_open","closed","full","ended"];

describe("resolveAction covers all ten signup states", () => {
  it("can_signup opens the signup form with the event id", () => {
    expect(resolveAction("can_signup", ctx)).toEqual({ type: "navigate", url: "/pages/signup/form/index?id=1" });
  });
  it("can_waitlist opens the signup form in waitlist mode", () => {
    expect(resolveAction("can_waitlist", ctx)).toEqual({ type: "navigate", url: "/pages/signup/form/index?id=1&mode=waitlist" });
  });
  it("reviewing has no navigation target", () => {
    expect(resolveAction("reviewing", ctx)).toEqual({ type: "none", url: "" });
  });
  it("signed opens the e-ticket page with the ticket id", () => {
    expect(resolveAction("signed", ctx)).toEqual({ type: "navigate", url: "/pages/ticket/detail/index?id=T20261218007" });
  });
  it("waitlisted opens my signups with the cancel hint", () => {
    expect(resolveAction("waitlisted", ctx)).toEqual({ type: "navigate", url: "/pages/signup/mine/index?cancel_hint=1&id=1" });
  });
  it("need_auth opens the auth page and encodes the redirect back", () => {
    expect(resolveAction("need_auth", ctx)).toEqual({
      type: "navigate",
      url: "/pages/auth/index?redirect=%2Fpages%2Fevent%2Fdetail%2Findex%3Fid%3D1",
    });
  });
  it("not_open has no navigation target", () => {
    expect(resolveAction("not_open", ctx)).toEqual({ type: "none", url: "" });
  });
  it("closed has no navigation target", () => {
    expect(resolveAction("closed", ctx)).toEqual({ type: "none", url: "" });
  });
  it("full has no navigation target", () => {
    expect(resolveAction("full", ctx)).toEqual({ type: "none", url: "" });
  });
  it("ended has no navigation target", () => {
    expect(resolveAction("ended", ctx)).toEqual({ type: "none", url: "" });
  });
});

describe("clickable states", () => {
  it("only the five interactive states accept a tap", () => {
    const clickable = STATES.filter((s) => isClickable(s));
    expect(clickable).toEqual(["can_signup", "can_waitlist", "signed", "waitlisted", "need_auth"]);
  });
  it("the five grey states reject a tap", () => {
    expect(STATES.filter((s) => !isClickable(s))).toEqual(["reviewing", "not_open", "closed", "full", "ended"]);
  });
  it("every grey state resolves to no navigation", () => {
    for (const state of ["reviewing", "not_open", "closed", "full", "ended"] as SignupState[]) {
      expect(resolveAction(state, ctx).type).toBe("none");
    }
  });
  it("signed falls back to the event id when the ticket id is absent", () => {
    const target = resolveAction("signed", { ...ctx, ticketId: null });
    expect(target.url).toBe("/pages/ticket/detail/index?id=1");
  });
});
