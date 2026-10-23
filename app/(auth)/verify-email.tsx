import { Redirect } from "expo-router"
import { WaitingVerification } from "@/components/auth/WaitingVerification"
import { useAuth } from "@/contexts/AuthContext"

export default function VerifyEmailScreen() {
  const { user } = useAuth()

  if (!user) {
    return <Redirect href="/sign-in" />
  }

  return <WaitingVerification />
}
