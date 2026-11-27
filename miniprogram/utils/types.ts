/** Domain types for the event detail page. */
export type SignupState =
  | "can_signup"
  | "can_waitlist"
  | "reviewing"
  | "signed"
  | "waitlisted"
  | "need_auth"
  | "not_open"
  | "closed"
  | "full"
  | "ended";

export interface EventGuest {
  avatar: string;
  name: string;
  title: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker: string;
}

export interface EventRecap {
  summary: string;
  photos: string[];
}

export interface EventQuota {
  total: number;
  signed: number;
  waitlist: number;
}

export interface EventDetail {
  id: string;
  title: string;
  typeLabel: string;
  isClosedDoor: boolean;
  signupState: SignupState;
  signupStateLabel: string;
  signupOpenAt: string | null;
  gallery: string[];
  startAt: string;
  endAt: string;
  spaceName: string;
  locationNote: string;
  quota: EventQuota;
  guests: EventGuest[];
  agenda: AgendaItem[];
  richTextHtml: string;
  waitlistPosition: number | null;
  ticketId: string | null;
  recap: EventRecap | null;
}

export interface RichNode {
  name: string;
  attrs: Record<string, string>;
  children?: RichNode[];
  text?: string;
}

export interface SafeArea {
  top: number;
  bottom: number;
  height: number;
}

export interface BarMetrics {
  barPaddingBottom: number;
  contentPaddingBottom: number;
  buttonHeight: number;
  buttonTop: number;
  buttonBottom: number;
  viewportHeight: number;
  contentLastBlockBottom: number;
}
