import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { PlatformPressable } from "@react-navigation/elements"
import { useAppTheme } from "@/hooks/useAppTheme"

interface Props {
  onPress: () => void
  onLongPress: () => void
  isFocused: boolean
  label: string
  icon: ReactNode
}

export function TabBarButton({ onPress, onLongPress, isFocused, label, icon }: Props) {
  const { Theme } = useAppTheme()

  return (
    <PlatformPressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.item}
    >
      <View
        style={[
          styles.iconWrap,
          isFocused && { backgroundColor: Theme.semantic.accent.soft },
        ]}
      >
        {icon}
      </View>
      <Text
        numberOfLines={1}
        style={{
          color: isFocused ? Theme.semantic.accent.primary : Theme.semantic.text.secondary,
          fontSize: Theme.fontSizes.caption,
          fontFamily: isFocused ? Theme.fonts.onestBold : Theme.fonts.onest,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </PlatformPressable>
  )
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconWrap: {
    minWidth: 40,
    height: 28,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
})
