import { describe, expect, it } from "vitest";
import { visibleSections, sortAgenda, CLOSED_DOOR_HINT } from "../miniprogram/utils/sections";
import type { EventDetail } from "../miniprogram/utils/types";

function makeEvent(patch: Partial<EventDetail> = {}): EventDetail {
  const base: EventDetail = {
    id: "1",
    title: "第十二期会员产业链接交流会",
    typeLabel: "闭门会",
    isClosedDoor: true,
    signupState: "ended",
    signupStateLabel: "活动已结束",
    signupOpenAt: null,
    gallery: ["/assets/gallery-1.png"],
    startAt: "2026-12-18T14:00:00+08:00",
    endAt: "2026-12-19T17:30:00+08:00",
    spaceName: "云栖会员空间",
    locationNote: "园区北门入场",
    quota: { total: 45, signed: 45, waitlist: 0 },
    guests: [{ avatar: "/assets/avatar-1.png", name: "林知远", title: "产业研究负责人" }],
    agenda: [{ time: "14:00", title: "签到", speaker: "主持人" }],
    richTextHtml: "",
    waitlistPosition: null,
    ticketId: null,
    recap: { summary: "本期共 45 位会员到场", photos: ["/assets/gallery-1.png"] },
  };
  return { ...base, ...patch };
}

describe("ended events show the recap block", () => {
  it("an ended event with recap data renders the recap section", () => {
    expect(visibleSections(makeEvent()).recap).toBe(true);
  });
  it("an ended event without recap data hides the section", () => {
    expect(visibleSections(makeEvent({ recap: null })).recap).toBe(false);
  });
  it("a non-ended event never renders the recap section", () => {
    expect(visibleSections(makeEvent({ signupState: "can_signup" })).recap).toBe(false);
  });
  it("the closed-door hint is fixed text", () => {
    expect(CLOSED_DOOR_HINT).toBe("提交申请后由工作人员审核");
  });
  it("only a closed-door event carries the review hint", () => {
    expect(visibleSections(makeEvent()).closedDoorHint).toBe(true);
    expect(visibleSections(makeEvent({ isClosedDoor: false })).closedDoorHint).toBe(false);
  });
});

describe("agenda ordering", () => {
  it("sorts the agenda by ascending time", () => {
    const sorted = sortAgenda([
      { time: "16:00", title: "圆桌", speaker: "陈可" },
      { time: "14:00", title: "签到", speaker: "主持人" },
      { time: "14:30", title: "主题分享", speaker: "林知远" },
    ]);
    expect(sorted.map((i) => i.time)).toEqual(["14:00", "14:30", "16:00"]);
  });
  it("keeps the source array untouched", () => {
    const source = [{ time: "16:00", title: "b", speaker: "s" }, { time: "09:00", title: "a", speaker: "s" }];
    sortAgenda(source);
    expect(source[0].time).toBe("16:00");
  });
});
