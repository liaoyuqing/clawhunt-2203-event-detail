import type { EventDetail, SignupState } from "./types";

/** Bottom bar text used only when the API does not send signup_state_label. */
export const FALLBACK_LABELS: Record<SignupState, string> = {
  can_signup: "立即报名",
  can_waitlist: "加入候补",
  reviewing: "审核中",
  signed: "查看电子票",
  waitlisted: "候补第 {n} 位",
  need_auth: "认证后报名",
  not_open: "{m} 月 {d} 日开放报名",
  closed: "报名已关闭",
  full: "名额已满",
  ended: "活动已结束",
};

const CLICKABLE: SignupState[] = ["can_signup", "can_waitlist", "signed", "waitlisted", "need_auth"];

export interface ActionTarget {
  type: "navigate" | "none";
  url: string;
}

export interface ActionContext {
  eventId: string;
  ticketId: string | null;
  waitlistPosition: number | null;
  currentPath: string;
}

export function isClickable(state: SignupState): boolean {
  return CLICKABLE.indexOf(state) !== -1;
}

/** Fill the fallback template for states whose text embeds a number or a date. */
export function fallbackLabel(state: SignupState, event: Pick<EventDetail, "waitlistPosition" | "signupOpenAt">): string {
  const template = FALLBACK_LABELS[state];
  if (state === "waitlisted") {
    const n = event.waitlistPosition && event.waitlistPosition > 0 ? event.waitlistPosition : 1;
    return template.replace("{n}", String(n));
  }
  if (state === "not_open") {
    const openAt = parseDate(event.signupOpenAt);
    if (!openAt) return template;
    return template.replace("{m}", String(openAt.getMonth() + 1)).replace("{d}", String(openAt.getDate()));
  }
  return template;
}

/** The API label always wins; the local map only fills a missing or blank value. */
export function resolveLabel(event: Pick<EventDetail, "signupState" | "signupStateLabel" | "waitlistPosition" | "signupOpenAt">): string {
  const fromApi = (event.signupStateLabel || "").trim();
  if (fromApi.length > 0) return fromApi;
  return fallbackLabel(event.signupState, event);
}

/** state -> navigation target. Pure so the unit tests can assert the whole table. */
export function resolveAction(state: SignupState, ctx: ActionContext): ActionTarget {
  if (!isClickable(state)) return { type: "none", url: "" };
  if (state === "can_signup") return { type: "navigate", url: "/pages/signup/form/index?id=" + ctx.eventId };
  if (state === "can_waitlist") return { type: "navigate", url: "/pages/signup/form/index?id=" + ctx.eventId + "&mode=waitlist" };
  if (state === "signed") return { type: "navigate", url: "/pages/ticket/detail/index?id=" + (ctx.ticketId || ctx.eventId) };
  if (state === "waitlisted") return { type: "navigate", url: "/pages/signup/mine/index?cancel_hint=1&id=" + ctx.eventId };
  if (state === "need_auth") return { type: "navigate", url: "/pages/auth/index?redirect=" + encodeURIComponent(ctx.currentPath) };
  return { type: "none", url: "" };
}

export function parseDate(value: string | null): Date | null {
  if (!value) return null;
  // Keep the ISO form (yyyy-MM-ddTHH:mm:ss+HH:mm) which every runtime parses.
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  const fallback = new Date(value.replace(/-/g, "/").replace("T", " ").replace(/Z$/, ""));
  return isNaN(fallback.getTime()) ? null : fallback;
}
