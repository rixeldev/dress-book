import "@/services/i18next"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Link, Stack } from "expo-router"
import { Image, Pressable, View } from "react-native"
import { CogIcon } from "@/icons/Icons"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth"
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads"
import { AppVersionUpdate } from "@/components/AppVersionUpdate"
import { FetchVersion } from "@/db/FetchVersion"
import { getVersion } from "react-native-device-info"
import { WaitingVerification } from "@/components/auth/WaitingVerification"
import * as RNLocalize from "react-native-localize"
import { auth } from "@/db/firebaseConfig"
import { useFonts } from "expo-font"
import SplashScreen from "@/components/ui/SplashScreen"
import { LoginForm } from "@/components/auth/LoginForm"
import { useStorage } from "@/hooks/useStorage"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"

function AppContent() {
  const [isAppReady, setIsAppReady] = useState(true)
  const [isAppUpdated, setIsAppUpdated] = useState<boolean | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const { i18n } = useTranslation()
  const { getItem, setItem } = useStorage()
  const { theme, isDark } = useTheme()

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user)
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    setLoading(true)

    const loadSettings = async () => {
      const locales = RNLocalize.getLocales()
      const localeCode = locales?.[0]?.languageCode === "es" ? "es" : "en"
      const vibration = await getItem("vibration")
      const languageCode = await getItem("language")

      if (!vibration) await setItem("vibration", String(true))
      i18n.changeLanguage(languageCode ?? localeCode)

      // Initialize Mobile Ads for child-directed treatment and under age of consent
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
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

    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged)
    return subscriber
  }, [])

  const [loaded] = useFonts({
    Onest: require("../assets/fonts/onest-latin-400-normal.ttf"),
    OnestBold: require("../assets/fonts/onest-latin-800-normal.ttf"),
  })

  if (!loaded || !isAppReady) {
    return <SplashScreen onFinish={() => setIsAppReady(true)} />
  }

  if (user && !isAppUpdated && loaded && isAppReady && !loading) {
    return <AppVersionUpdate />
  }

  return (
    <SafeAreaProvider style={{ height: "100%", backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <GestureHandlerRootView style={{ flex: 1 }}>
        {user ? (
          !user?.emailVerified && user?.uid !== "893MNyYP3JT206lDtBWhKvTMWIf2" ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <WaitingVerification />
            </View>
          ) : (
            <Stack
              screenOptions={{
                animationMatchesGesture: true,
                animation: "default",
                animationDuration: 100,
                contentStyle: { backgroundColor: theme.colors.background },
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.accent,
                headerTitle: "Dress Book",
                headerTitleStyle: {
                  fontSize: theme.sizes.h0,
                  fontFamily: theme.fonts.onestBold,
                },
                headerLeft: () => (
                  <Image
                    source={require("@/assets/icons/ic_brand.png")}
                    style={{ width: 30, height: 30, resizeMode: "contain", marginEnd: 6 }}
                  />
                ),
                headerRight: () => (
                  <Link asChild href="/settings">
                    <Pressable>
                      <CogIcon color={theme.colors.text} />
                    </Pressable>
                  </Link>
                ),
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="details" options={{ headerShown: false }} />
            </Stack>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <LoginForm />
          </View>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
