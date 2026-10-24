import { getRemoteConfig, fetchAndActivate, getValue, setDefaults } from "@react-native-firebase/remote-config"

const defaults = {
  ads_enabled: true,
  interstitial_cooldown_min: 10,
  native_ad_every_n: 5,
  paywall_enabled: false,
  free_client_limit: 5,
  free_order_limit: 10,
}

export async function initRemoteConfig(): Promise<void> {
  try {
    const rc = getRemoteConfig()
    await setDefaults(rc, defaults)
    await fetchAndActivate(rc)
  } catch (error) {
    console.log("Remote config init failed", error)
  }
}

export function getRemoteBoolean(key: string): boolean {
  try {
    const rc = getRemoteConfig()
    return getValue(rc, key).asBoolean()
  } catch {
    return Boolean((defaults as Record<string, unknown>)[key])
  }
}

export function getRemoteNumber(key: string): number {
  try {
    const rc = getRemoteConfig()
    return getValue(rc, key).asNumber()
  } catch {
    return Number((defaults as Record<string, unknown>)[key] ?? 0)
  }
}
