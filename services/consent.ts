import { AdsConsent, AdsConsentStatus } from "react-native-google-mobile-ads"

export async function requestConsent(): Promise<AdsConsentStatus> {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate()
    if (consentInfo.isConsentFormAvailable) {
      await AdsConsent.loadAndShowConsentFormIfRequired()
    }
    const updated = await AdsConsent.getConsentInfo()
    return updated.status ?? AdsConsentStatus.OBTAINED
  } catch (error) {
    console.log("Consent request failed", error)
    return AdsConsentStatus.OBTAINED
  }
}

export async function showPrivacyOptions(): Promise<void> {
  try {
    await AdsConsent.showPrivacyOptionsForm()
  } catch (error) {
    console.log("Privacy options form failed", error)
  }
}

export function isConsentObtained(status: AdsConsentStatus): boolean {
  return status === AdsConsentStatus.OBTAINED || status === AdsConsentStatus.NOT_REQUIRED
}
