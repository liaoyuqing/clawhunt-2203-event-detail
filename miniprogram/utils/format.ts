import { parseDate } from "./signup";

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function formatClock(d: Date): string {
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
}

/** Multi-day events print both dates; same-day events print one date plus the time range. */
export function formatEventDate(startAt: string, endAt: string): string {
  const start = parseDate(startAt);
  const end = parseDate(endAt);
  if (!start || !end) return "";
  const startDay = start.getMonth() + 1 + " 月 " + start.getDate() + " 日";
  const endDay = end.getMonth() + 1 + " 月 " + end.getDate() + " 日";
  const crossDay = start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth() || start.getDate() !== end.getDate();
  if (crossDay) {
    return startDay + " - " + endDay;
  }
  return startDay + " " + formatClock(start) + "-" + formatClock(end);
}

export interface QuotaView {
  percent: number;
  ratioText: string;
  waitlistText: string;
  overflow: boolean;
  full: boolean;
}

export function quotaView(total: number, signed: number, waitlist: number): QuotaView {
  const safeTotal = total > 0 ? total : 0;
  const safeSigned = signed > 0 ? signed : 0;
  const percent = safeTotal === 0 ? 0 : Math.round((safeSigned / safeTotal) * 1000) / 10;
  const capped = percent > 100 ? 100 : percent;
  return {
    percent: capped,
    ratioText: safeSigned + "/" + safeTotal,
    waitlistText: "候补 " + (waitlist > 0 ? waitlist : 0) + " 人",
    overflow: safeSigned > safeTotal,
    full: safeTotal > 0 && safeSigned >= safeTotal,
  };
}

export interface SharePayload {
  title: string;
  path: string;
  imageUrl: string;
}

export function sharePayload(event: {
  id: string;
  title: string;
  gallery: string[];
}): SharePayload {
  return {
    title: event.title,
    path: "/pages/event/detail/index?id=" + event.id,
    imageUrl: event.gallery.length > 0 ? event.gallery[0] : "",
  };
}

/** Bottom bar geometry, in px, derived from the device safe area. */
export interface BarInput {
  safeAreaBottom: number;
  viewportHeight: number;
  contentLastBlockBottom: number;
}

export const BAR_BASE_PADDING_PX = 6;
export const BAR_BUTTON_HEIGHT_PX = 44;
export const BAR_TOP_PAD_PX = 6;

export function barMetrics(input: BarInput): {
  barPaddingBottom: number;
  barHeight: number;
  viewportHeight: number;
  contentPaddingBottom: number;
  buttonTop: number;
  buttonBottom: number;
  contentVisibleBottom: number;
  overlapsContent: boolean;
  underHomeIndicator: boolean;
} {
  const inset = input.safeAreaBottom > 0 ? input.safeAreaBottom : 0;
  const barPaddingBottom = BAR_BASE_PADDING_PX + inset;
  const barHeight = BAR_TOP_PAD_PX + BAR_BUTTON_HEIGHT_PX + barPaddingBottom;
  const contentPaddingBottom = barHeight + 8;
  const buttonTop = input.viewportHeight - barHeight + BAR_TOP_PAD_PX;
  const buttonBottom = buttonTop + BAR_BUTTON_HEIGHT_PX;
  const contentVisibleBottom = input.contentLastBlockBottom + contentPaddingBottom;
  return {
    barPaddingBottom,
    barHeight,
    viewportHeight: input.viewportHeight,
    contentPaddingBottom,
    buttonTop,
    buttonBottom,
    contentVisibleBottom,
    overlapsContent: input.contentLastBlockBottom > input.viewportHeight - barHeight,
    underHomeIndicator: input.viewportHeight - buttonBottom < inset,
  };
}
