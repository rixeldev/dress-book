import { useAppTheme } from "@/hooks/useAppTheme"
import { ActivityIndicator, View } from "react-native"

export const Loading = () => {
  const { Theme } = useAppTheme()
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator
        size="large"
        color={Theme.colors.accent}
        style={{ width: 38, height: 38, alignSelf: "center" }}
      />
    </View>
  )
}
