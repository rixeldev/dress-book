import { Pressable, StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface ChipProps {
  label: string
  onPress: () => void
  selected?: boolean
  icon?: ReactNode
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  testID?: string
}

export function Chip({
  label,
  onPress,
  selected = false,
  icon,
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}: ChipProps) {
  const { Theme } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? Theme.semantic.accent.primary
            : Theme.semantic.bg.sunken,
          borderColor: selected
            ? Theme.semantic.accent.primary
            : Theme.semantic.border.subtle,
          opacity: disabled ? 0.45 : 1,
        },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={{
          color: selected ? Theme.semantic.text.inverse : Theme.semantic.text.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.label,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
})
