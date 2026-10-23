import { Link, Redirect, Stack, useSegments } from "expo-router"
import { Image, Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { CogIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useOnboarding } from "@/contexts/OnboardingContext"

export default function AppLayout() {
  const { user, initializing } = useAuth()
  const { Theme } = useAppTheme()
  const { t } = useTranslation()
  const { complete: onboardingComplete } = useOnboarding()
  const segments = useSegments()

  if (initializing) return null
  if (!user) return <Redirect href="/sign-in" />
  if (!user.emailVerified) return <Redirect href="/verify-email" />
  if (onboardingComplete === null) return null

  const currentRoute = segments[segments.length - 1]
  if (!onboardingComplete && currentRoute !== "onboarding") return <Redirect href="/onboarding" />
  if (onboardingComplete && currentRoute === "onboarding") return <Redirect href="/" />

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        animationMatchesGesture: true,
        animation: "default",
        animationDuration: 100,
        contentStyle: { backgroundColor: Theme.colors.background },
        headerStyle: { backgroundColor: Theme.colors.background },
        headerTintColor: Theme.colors.accent,
        headerTitle: "Dress Book",
        headerTitleStyle: {
          fontSize: Theme.fontSizes.h1,
          fontFamily: Theme.fonts.display,
        },
        headerLeft: () => (
          <Image
            source={require("@/assets/icons/ic_brand.png")}
            style={{ width: 30, height: 30, resizeMode: "contain", marginEnd: 6 }}
          />
        ),
        headerRight: () => (
          <Link asChild href="/settings">
            <Pressable accessibilityRole="button" accessibilityLabel={t("settings")} hitSlop={10}>
              <CogIcon color={Theme.colors.text} />
            </Pressable>
          </Link>
        ),
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="details" options={{ headerShown: false }} />
    </Stack>
  )
}
