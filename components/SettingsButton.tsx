import { ReactElement } from "react"
import { StyleSheet, Text, View, Pressable } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

interface SettingsButtonProps {
  onPress: () => void
  title: string
  description?: string
  icon: ReactElement
  color?: string
}

export const SettingsButton = ({
  onPress,
  title,
  description,
  icon,
  color,
}: SettingsButtonProps) => {
  const { Theme } = useAppTheme()
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? Theme.colors.background2 : Theme.colors.transparent,
          opacity: pressed ? 0.6 : 1,
        },
        styles.pressable,
      ]}
      onPress={onPress}
    >
      <View>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: color ? color : Theme.colors.text }}>{title}</Text>
        {description && <Text style={{ color: Theme.colors.gray }}>{description}</Text>}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    alignItems: "center",
    paddingVertical: 16,
  },
})
