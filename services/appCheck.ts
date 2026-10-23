import appCheck from "@react-native-firebase/app-check"

export async function initializeAppCheck() {
  try {
    if (__DEV__) {
      // Debug provider for development builds.
      await appCheck().setTokenAutoRefreshEnabled(true)
    } else {
      await appCheck().setTokenAutoRefreshEnabled(true)
    }
  } catch (error) {
    console.log("App Check initialization failed", error)
  }
}
