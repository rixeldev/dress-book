import "@/services/i18next"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads"
import { AppVersionUpdate } from "@/components/AppVersionUpdate"
import { FetchVersion } from "@/db/FetchVersion"
import { getVersion } from "react-native-device-info"
import * as RNLocalize from "react-native-localize"
import { useFonts } from "expo-font"
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces/600SemiBold"
import SplashScreen from "@/components/ui/SplashScreen"
import { useStorage } from "@/hooks/useStorage"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { OnboardingProvider } from "@/contexts/OnboardingContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function RootNavigator() {
  const [isAppUpdated, setIsAppUpdated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const { i18n } = useTranslation()
  const { getItem, setItem } = useStorage()
  const { theme, isDark } = useTheme()
  const { user, initializing } = useAuth()

  useEffect(() => {
    setLoading(true)

    const loadSettings = async () => {
      const locales = RNLocalize.getLocales()
      const localeCode = locales?.[0]?.languageCode === "es" ? "es" : "en"
      const vibration = await getItem("vibration")
      const languageCode = await getItem("language")

      if (!vibration) await setItem("vibration", String(true))
      i18n.changeLanguage(languageCode ?? localeCode)

      // Dress Book is a professional tool for adults, not a child-directed app.
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
      })

      await mobileAds().initialize()

      try {
        const currentVersion = getVersion()
        await FetchVersion().then((version) => {
          if (version?.version && currentVersion < version?.version) {
            setIsAppUpdated(false)
          } else {
            setIsAppUpdated(true)
          }

          setLoading(false)
        })
      } catch (error: any) {
        console.log("Error fetching version: ", error)
        setIsAppUpdated(true)
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const [loaded] = useFonts({
    Onest: require("../assets/fonts/onest-latin-400-normal.ttf"),
    OnestBold: require("../assets/fonts/onest-latin-800-normal.ttf"),
    FrauncesSemiBold: Fraunces_600SemiBold,
  })

  const isBooting = !loaded || initializing || loading
  const needsUpdate = Boolean(user) && isAppUpdated === false

  return (
    <SafeAreaProvider style={{ height: "100%", backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        {isBooting ? (
          <SplashScreen onFinish={() => {}} />
        ) : needsUpdate ? (
          <AppVersionUpdate />
        ) : (
          <Stack
            initialRouteName={user?.emailVerified ? "(app)" : "(auth)"}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
