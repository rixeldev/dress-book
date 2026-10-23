import { Pressable, StyleSheet, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface CardProps {
  children: ReactNode
  padded?: boolean
  onPress?: () => void
  tone?: "surface" | "sunken"
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  testID?: string
}

export function Card({
  children,
  padded = true,
  onPress,
  tone = "surface",
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const { Theme } = useAppTheme()

  const baseStyle = [
    styles.base,
    {
      backgroundColor:
        tone === "surface" ? Theme.semantic.bg.surface : Theme.semantic.bg.sunken,
      borderColor: Theme.semantic.border.subtle,
      padding: padded ? Theme.spacing.md : 0,
    },
    Theme.elevation.card,
    style,
  ]

  if (!onPress) {
    return (
      <View style={baseStyle} testID={testID}>
        {children}
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [baseStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.9,
  },
})
