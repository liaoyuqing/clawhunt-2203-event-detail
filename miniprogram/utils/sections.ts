import type { EventDetail } from "./types";

export interface SectionFlags {
  gallery: boolean;
  guests: boolean;
  agenda: boolean;
  richText: boolean;
  recap: boolean;
  closedDoorHint: boolean;
}

export function visibleSections(event: EventDetail): SectionFlags {
  const ended = event.signupState === "ended";
  return {
    gallery: event.gallery.length > 0,
    guests: event.guests.length > 0,
    agenda: event.agenda.length > 0,
    richText: true,
    recap: ended && event.recap !== null,
    closedDoorHint: event.isClosedDoor,
  };
}

export const CLOSED_DOOR_HINT = "提交申请后由工作人员审核";

/** Agenda is rendered in ascending time order, stable for equal times. */
export function sortAgenda<T extends { time: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.time.localeCompare(b.time));
}
