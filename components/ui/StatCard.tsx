import { StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  tone?: "surface" | "sunken"
  style?: StyleProp<ViewStyle>
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend = "neutral",
  tone = "surface",
  style,
}: StatCardProps) {
  const { Theme } = useAppTheme()

  const trendColor =
    trend === "up"
      ? Theme.semantic.state.success
      : trend === "down"
        ? Theme.semantic.state.danger
        : Theme.semantic.text.secondary

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            tone === "surface" ? Theme.semantic.bg.surface : Theme.semantic.bg.sunken,
          borderColor: Theme.semantic.border.subtle,
        },
        Theme.elevation.card,
        style,
      ]}
    >
      <View style={styles.header}>
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.caption,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
          numberOfLines={2}
        >
          {label}
        </Text>
        {icon}
      </View>
      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.display,
          fontSize: Theme.fontSizes.display,
          lineHeight: Theme.lineHeights.display,
          letterSpacing: -0.5,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {hint && (
        <Text
          style={{
            color: trendColor,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.label,
          }}
          numberOfLines={1}
        >
          {hint}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
})
