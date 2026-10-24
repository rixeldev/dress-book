import { Link, Redirect, Stack, useSegments } from "expo-router"
import { Pressable, View } from "react-native"
import { useTranslation } from "react-i18next"
import { CogIcon, SearchIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { BrandMark } from "@/components/ui/BrandMark"

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
        animation: "slide_from_right",
        animationDuration: 240,
        contentStyle: { backgroundColor: Theme.semantic.bg.canvas },
        headerStyle: { backgroundColor: Theme.semantic.bg.canvas },
        headerShadowVisible: false,
        headerTintColor: Theme.semantic.text.primary,
        headerTitleAlign: "left",
        headerBackButtonDisplayMode: "minimal",
        headerTitle: "Dress Book",
        headerTitleStyle: {
          fontSize: Theme.fontSizes.h2,
          fontFamily: Theme.fonts.display,
          color: Theme.semantic.text.primary,
        },
        headerLeft: () => (
          <View style={{ marginEnd: 4 }}>
            <BrandMark size={26} />
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Link asChild href="/search">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("search")}
                hitSlop={10}
                style={{ padding: 8 }}
              >
                <SearchIcon color={Theme.semantic.text.primary} size={21} />
              </Pressable>
            </Link>
            <Link asChild href="/settings">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("settings")}
                hitSlop={10}
                style={{ padding: 8 }}
              >
                <CogIcon color={Theme.semantic.text.primary} size={21} />
              </Pressable>
            </Link>
          </View>
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
