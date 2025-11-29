import { useEffect, useRef, useCallback } from "react"
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads"
import { adInterstitialId } from "@/db/firebaseConfig"
import NetInfo from "@react-native-community/netinfo"

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : adInterstitialId

export const useInterstitialAd = () => {
  const interstitialRef = useRef<InterstitialAd | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      keywords: ["games", "gaming", "technology", "software", "mobile development"],
    })
    interstitialRef.current = interstitial

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true
    })

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false
      interstitial.load()
    })

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error("Interstitial ad error:", error)
      loadedRef.current = false
    })

    interstitial.load()

    return () => {
      unsubscribeLoaded()
      unsubscribeClosed()
      unsubscribeError()
    }
  }, [])

  const showAdIfEligible = useCallback(async (): Promise<void> => {
    const randomNum = Math.floor(Math.random() * 11) // 0 to 10
    if (randomNum < 5) return

    const netInfo = await NetInfo.fetch()
    if (!netInfo.isConnected) return

    // Wait for ad to load (max 3 seconds)
    const maxWait = 3000
    const interval = 100
    let waited = 0

    while (waited < maxWait) {
      const interstitial = interstitialRef.current
      if (interstitial && interstitial.loaded) {
        interstitial.show()
        return
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
      waited += interval
    }
  }, [])

  return { showAdIfEligible }
}
