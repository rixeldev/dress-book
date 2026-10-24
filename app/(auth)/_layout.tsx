import { Redirect, Stack, useSegments } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function AuthLayout() {
  const { user, initializing } = useAuth()
  const { Theme } = useAppTheme()
  const segments = useSegments()

  if (initializing) return null

  const currentRoute = segments[segments.length - 1]

  if (user?.emailVerified) {
    return <Redirect href="/" />
  }

  if (user && currentRoute !== "verify-email") {
    return <Redirect href="/verify-email" />
  }

  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: Theme.semantic.bg.canvas },
      }}
    />
  )
}
