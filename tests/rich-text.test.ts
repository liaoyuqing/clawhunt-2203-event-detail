import { describe, expect, it } from "vitest";
import { normalizeRichText, splitRichSegments, collectImageSources, fitImage, IMAGE_FIT_STYLE } from "../miniprogram/utils/rich-text";
import type { RichNode } from "../miniprogram/utils/types";

function paragraph(text: string): RichNode {
  return { name: "p", attrs: { style: "margin:0" }, children: [{ name: "text", attrs: {}, text }] };
}

function wideImage(): RichNode {
  return { name: "img", attrs: { src: "/assets/wide-2000.png", style: "width:2000px" } };
}

describe("rich text image width", () => {
  it("adds max-width to an image without any width constraint", () => {
    const out = normalizeRichText([{ name: "img", attrs: { src: "/a.png" } }]);
    expect(out[0].attrs.style).toContain("max-width:100%");
  });
  it("adds max-width to an image that only declares a height", () => {
    const out = normalizeRichText([{ name: "img", attrs: { src: "/a.png", style: "height:300px" } }]);
    expect(out[0].attrs.style).toContain("max-width:100%");
    expect(out[0].attrs.style).toContain("height:300px");
  });
  it("adds height auto to an image that only declares a width", () => {
    const out = normalizeRichText([wideImage()]);
    expect(out[0].attrs.style).toContain("height:auto");
  });
  it("keeps a style that already declares both rules", () => {
    const out = normalizeRichText([{ name: "img", attrs: { src: "/a.png", style: IMAGE_FIT_STYLE } }]);
    expect(out[0].attrs.style).toBe(IMAGE_FIT_STYLE);
  });
  it("every image node ends up with a fit style", () => {
    const out = normalizeRichText([paragraph("p"), wideImage(), wideImage()]);
    const imgs = out.filter((n) => n.name === "img");
    expect(imgs.length).toBe(2);
    for (const img of imgs) expect(img.attrs.style).toMatch(/max-width\s*:\s*100%/);
  });
  it("splits images out of the rich segments", () => {
    const segments = splitRichSegments([paragraph("a"), wideImage(), paragraph("b")]);
    expect(segments.map((s) => s.type)).toEqual(["rich", "image", "rich"]);
  });
  it("collects every image source", () => {
    expect(collectImageSources([paragraph("a"), wideImage()])).toEqual(["/assets/wide-2000.png"]);
  });
});

describe("image geometry", () => {
  it("scales a 2000px wide image down to the viewport width", () => {
    const fitted = fitImage(2000, 600, 375);
    expect(fitted.width).toBe(375);
  });
  it("keeps the aspect ratio of a scaled image within 1px", () => {
    const fitted = fitImage(2000, 600, 375);
    expect(Math.abs(fitted.height - (600 * 375) / 2000)).toBeLessThan(1);
  });
  it("never upscales a narrow image", () => {
    const fitted = fitImage(300, 200, 430);
    expect(fitted.width).toBe(300);
  });
  it("fits the wide image on both device widths", () => {
    for (const viewport of [375, 430]) {
      const fitted = fitImage(2000, 600, viewport);
      expect(fitted.width).toBeLessThanOrEqual(viewport);
    }
  });
});
