import { describe, expect, it } from "vitest";
import { barMetrics, BAR_BASE_PADDING_PX, BAR_BUTTON_HEIGHT_PX } from "../miniprogram/utils/format";
import { DEVICE_PROFILES, resolveDeviceProfile } from "../miniprogram/utils/device";

describe("bottom bar safe area", () => {
  it("adds the safe-area inset to the bar padding", () => {
    const se = barMetrics({ safeAreaBottom: 0, viewportHeight: 667, contentLastBlockBottom: 667 });
    const promax = barMetrics({ safeAreaBottom: 34, viewportHeight: 932, contentLastBlockBottom: 932 });
    expect(se.barPaddingBottom).toBe(BAR_BASE_PADDING_PX);
    expect(promax.barPaddingBottom).toBe(BAR_BASE_PADDING_PX + 34);
  });
  it("reserves more content padding than the bar height", () => {
    const m = barMetrics({ safeAreaBottom: 34, viewportHeight: 932, contentLastBlockBottom: 932 });
    expect(m.contentPaddingBottom).toBeGreaterThan(m.barHeight);
  });
  it("keeps the button clear of the home indicator on the Pro Max", () => {
    const m = barMetrics({ safeAreaBottom: 34, viewportHeight: 932, contentLastBlockBottom: 800 });
    expect(m.underHomeIndicator).toBe(false);
    expect(m.viewportHeight - m.buttonBottom).toBeGreaterThanOrEqual(34);
  });
  it("keeps the button height fixed across devices", () => {
    const se = barMetrics({ safeAreaBottom: 0, viewportHeight: 667, contentLastBlockBottom: 600 });
    const promax = barMetrics({ safeAreaBottom: 34, viewportHeight: 932, contentLastBlockBottom: 860 });
    expect(se.buttonBottom - se.buttonTop).toBe(BAR_BUTTON_HEIGHT_PX);
    expect(promax.buttonBottom - promax.buttonTop).toBe(BAR_BUTTON_HEIGHT_PX);
  });
  it("flags overlap when content reaches the bar", () => {
    const m = barMetrics({ safeAreaBottom: 0, viewportHeight: 667, contentLastBlockBottom: 660 });
    expect(m.overlapsContent).toBe(true);
  });
  it("does not flag overlap when content stops above the bar", () => {
    const m = barMetrics({ safeAreaBottom: 34, viewportHeight: 932, contentLastBlockBottom: 800 });
    expect(m.overlapsContent).toBe(false);
  });
});

describe("device profiles", () => {
  it("iPhone SE has no home indicator inset", () => {
    expect(DEVICE_PROFILES.se.safeAreaBottom).toBe(0);
    expect(DEVICE_PROFILES.se.hasHomeIndicator).toBe(false);
  });
  it("iPhone 15 Pro Max reserves the home indicator inset", () => {
    expect(DEVICE_PROFILES.promax.safeAreaBottom).toBe(34);
    expect(DEVICE_PROFILES.promax.hasHomeIndicator).toBe(true);
  });
  it("unknown device keys fall back to the default profile", () => {
    expect(resolveDeviceProfile("unknown").key).toBe("se");
  });
});
