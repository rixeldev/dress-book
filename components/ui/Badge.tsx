import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger"

export interface BadgeProps {
  label: string
  tone?: BadgeTone
  dot?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
}

const withAlpha = (color: string, alpha: string) =>
  color.length === 7 ? `${color}${alpha}` : color

export function Badge({ label, tone = "neutral", dot = false, style, testID }: BadgeProps) {
  const { Theme } = useAppTheme()

  const palette = {
    neutral: {
      backgroundColor: "transparent",
      borderColor: Theme.semantic.border.strong,
      color: Theme.semantic.text.secondary,
    },
    accent: {
      backgroundColor: Theme.semantic.accent.soft,
      borderColor: "transparent",
      color: Theme.semantic.accent.primary,
    },
    success: {
      backgroundColor: withAlpha(Theme.semantic.state.success, "1A"),
      borderColor: "transparent",
      color: Theme.semantic.state.success,
    },
    warning: {
      backgroundColor: withAlpha(Theme.semantic.state.warning, "22"),
      borderColor: "transparent",
      color: Theme.semantic.state.warning,
    },
    danger: {
      backgroundColor: withAlpha(Theme.semantic.state.danger, "1A"),
      borderColor: "transparent",
      color: Theme.semantic.state.danger,
    },
  }[tone]

  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: palette.color }]} />}
      <Text
        style={{
          color: palette.color,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.caption,
          letterSpacing: 0.7,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 24,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
})
