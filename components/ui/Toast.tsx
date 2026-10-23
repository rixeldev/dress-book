import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export type ToastVariant = "success" | "error" | "info"

export interface ToastProps {
  message: string
  variant?: ToastVariant
  style?: StyleProp<ViewStyle>
}

export function Toast({ message, variant = "info", style }: ToastProps) {
  const { Theme } = useAppTheme()

  const color =
    variant === "success"
      ? Theme.semantic.state.success
      : variant === "error"
        ? Theme.semantic.state.danger
        : Theme.semantic.accent.primary

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.toast,
        {
          backgroundColor: Theme.semantic.bg.surface,
          borderColor: color,
        },
        Theme.elevation.card,
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  toast: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
