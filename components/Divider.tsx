import { useAppTheme } from "@/hooks/useAppTheme"
import { View } from "react-native"

export const Divider = () => {
  const { Theme } = useAppTheme()
  return (
    <View
      style={{
        width: "100%",
        height: 0.4,
        backgroundColor: Theme.colors.background2,
      }}
    />
  )
}
