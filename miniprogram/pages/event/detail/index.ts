import { resolveAction, resolveLabel, isClickable, fallbackLabel } from "../../../utils/signup";
import { formatEventDate, quotaView, sharePayload, barMetrics } from "../../../utils/format";
import { normalizeRichText, splitRichSegments } from "../../../utils/rich-text";
import { visibleSections, sortAgenda, CLOSED_DOOR_HINT } from "../../../utils/sections";
import { resolveDeviceProfile, DEVICE_PROFILES } from "../../../utils/device";
import type { EventDetail } from "../../../utils/types";

import { findEvent } from "../../../mock/events";

function pickEvent(id: string, state: string | null): any {
  return findEvent(id, state);
}

Page({
  data: {
    event: { gallery: [], guests: [], agenda: [], recap: null, quota: { total: 0, signed: 0, waitlist: 0 } } as any,
    label: "",
    clickable: false,
    hint: "",
    paddingBottom: 6,
    contentPadding: 84,
    dateText: "",
    quota: { percent: 0, ratioText: "0/0", waitlistText: "候补 0 人" } as any,
    sections: { gallery: false, guests: false, agenda: false, richText: false, recap: false, closedDoorHint: false } as any,
    segments: [] as any[],
    agendaSorted: [] as any[],
    deviceName: "",
    deviceWidth: 0,
    homeIndicatorHeight: 0,
    showFrameLabel: false,
    closedDoorHint: CLOSED_DOOR_HINT,
  },

  onLoad(query: any) {
    const id = (query && query.id) || "1";
    const state = (query && query.state) || null;
    const query_device = (query && query.device) || null;
    const profile = resolveDeviceProfile(query_device);
    const raw = pickEvent(id, state);
    this.render(raw, profile, id, query_device);
  },

  render(raw: any, profile: any, requestedId: string, queryDevice: string | null) {
    const query_device = queryDevice;
    const event: EventDetail = {
      id: String(raw.id),
      title: raw.title,
      typeLabel: raw.type_label,
      isClosedDoor: raw.is_closed_door,
      signupState: raw.signup_state,
      signupStateLabel: raw.signup_state_label,
      signupOpenAt: raw.signup_open_at,
      gallery: raw.gallery,
      startAt: raw.start_at,
      endAt: raw.end_at,
      spaceName: raw.space_name,
      locationNote: raw.location_note,
      quota: { total: raw.quota.total, signed: raw.quota.signed, waitlist: raw.quota.waitlist },
      guests: raw.guests,
      agenda: raw.agenda,
      richTextHtml: "",
      waitlistPosition: raw.waitlist_position,
      ticketId: raw.ticket_id,
      recap: raw.recap,
    };
    const nodes = normalizeRichText(raw.rich_text_nodes);
    const segments = splitRichSegments(nodes);
    const clickable = isClickable(event.signupState);
    const label = resolveLabel(event);
    const view = quotaView(event.quota.total, event.quota.signed, event.quota.waitlist);
    const sections = visibleSections(event);
    const metrics = barMetrics({
      safeAreaBottom: profile.safeAreaBottom,
      viewportHeight: profile.height,
      contentLastBlockBottom: profile.height,
    });
    const dateText = formatEventDate(event.startAt, event.endAt);
    const agendaSorted = sortAgenda(event.agenda);
    const hint = event.isClosedDoor ? CLOSED_DOOR_HINT : "";

    this.setData({
      event,
      label,
      deviceWidth: profile.width,
      homeIndicatorHeight: profile.hasHomeIndicator ? profile.safeAreaBottom : 0,
      showFrameLabel: !!(query_device === profile.key),
      clickable,
      hint,
      paddingBottom: metrics.barPaddingBottom,
      contentPadding: metrics.contentPaddingBottom,
      dateText,
      quota: view,
      sections,
      segments,
      agendaSorted,
      deviceName: profile.name,
    });

    const ctx = {
      eventId: event.id,
      ticketId: event.ticketId,
      waitlistPosition: event.waitlistPosition,
      currentPath: "/pages/event/detail/index?id=" + requestedId,
    };
    const action = resolveAction(event.signupState, ctx);

    console.log(
      "[signup-bar] state=" + event.signupState +
      " label=" + label +
      " clickable=" + (clickable ? "yes" : "no") +
      " target=" + (action.type === "none" ? "-" : action.url)
    );
    console.log("[layout] device=" + profile.name + " barPaddingBottom=" + metrics.barPaddingBottom + " contentPaddingBottom=" + metrics.contentPaddingBottom);
    console.log("[date] text=" + dateText + " crossDay=" + (dateText.indexOf(" - ") !== -1));
    console.log("[rich-text] images=" + segments.filter((s) => s.type === "image").length);
  },

  onSignupTap() {
    if (!this.data.clickable) {
      console.log("[signup-bar] disabled tap ignored state=" + this.data.event.signupState);
      return;
    }
    const event = this.data.event;
    const action = resolveAction(event.signupState, {
      eventId: event.id,
      ticketId: event.ticketId,
      waitlistPosition: event.waitlistPosition,
      currentPath: "/pages/event/detail/index?id=" + event.id,
    });
    if (action.type === "navigate") {
      console.log("[navigate] from=event_detail to=" + action.url);
      wx.navigateTo({ url: action.url });
    }
  },

  onPreviewGallery(e: any) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const urls = this.data.event.gallery;
    console.log("[preview] index=" + index + " count=" + urls.length);
    wx.previewImage({ current: urls[index], urls });
  },

  onPreviewRich(e: any) {
    const src = e.currentTarget.dataset.src;
    console.log("[preview] rich-image src=" + src);
    wx.previewImage({ current: src, urls: [src] });
  },

  onShareAppMessage() {
    const payload = sharePayload(this.data.event);
    console.log("[share] title=" + payload.title + " path=" + payload.path + " image=" + payload.imageUrl);
    return payload;
  },
});
