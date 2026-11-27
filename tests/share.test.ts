import { describe, expect, it } from "vitest";
import { sharePayload } from "../miniprogram/utils/format";

describe("onShareAppMessage payload", () => {
  it("uses the event title and the first gallery image", () => {
    const p = sharePayload({
      id: "1",
      title: "第十二期会员产业链接交流会",
      gallery: ["/assets/gallery-1.png", "/assets/gallery-2.png"],
    });
    expect(p.title).toBe("第十二期会员产业链接交流会");
    expect(p.imageUrl).toBe("/assets/gallery-1.png");
  });
  it("builds the path with the event id", () => {
    const p = sharePayload({ id: "7", title: "t", gallery: ["/assets/gallery-1.png"] });
    expect(p.path).toBe("/pages/event/detail/index?id=7");
  });
  it("an event without a gallery shares an empty image", () => {
    const p = sharePayload({ id: "9", title: "t", gallery: [] });
    expect(p.imageUrl).toBe("");
  });
});
