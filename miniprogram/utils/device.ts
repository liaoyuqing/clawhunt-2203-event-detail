/** Device profiles used for the layout evidence shots. */
export interface DeviceProfile {
  key: string;
  name: string;
  width: number;
  height: number;
  safeAreaBottom: number;
  hasHomeIndicator: boolean;
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  se: { key: "se", name: "iPhone SE", width: 375, height: 667, safeAreaBottom: 0, hasHomeIndicator: false },
  promax: { key: "promax", name: "iPhone 15 Pro Max", width: 430, height: 932, safeAreaBottom: 34, hasHomeIndicator: true },
};

export const DEFAULT_DEVICE_KEY = "se";

export function resolveDeviceProfile(key?: string | null): DeviceProfile {
  if (key && DEVICE_PROFILES[key]) return DEVICE_PROFILES[key];
  return DEVICE_PROFILES[DEFAULT_DEVICE_KEY];
}
