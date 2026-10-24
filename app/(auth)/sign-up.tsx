import { View } from "react-native"
import { LoginForm } from "@/components/auth/LoginForm"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function SignUpScreen() {
  const { Theme } = useAppTheme()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Theme.semantic.bg.canvas,
      }}
    >
      <LoginForm initialSignIn={false} />
    </View>
  )
}
