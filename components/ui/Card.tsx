import { Pressable, StyleSheet, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface CardProps {
  children: ReactNode
  padded?: boolean
  onPress?: () => void
  tone?: "surface" | "sunken" | "accent"
  /** Draws a brass rule along the left edge — useful for highlighted cards. */
  ruled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  testID?: string
}

export function Card({
  children,
  padded = true,
  onPress,
  tone = "surface",
  ruled = false,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const { Theme } = useAppTheme()

  const baseStyle = [
    styles.base,
    {
      backgroundColor:
        tone === "sunken"
          ? Theme.semantic.bg.sunken
          : tone === "accent"
            ? Theme.semantic.accent.soft
            : Theme.semantic.bg.surface,
      borderColor:
        tone === "accent" ? "transparent" : Theme.semantic.border.subtle,
      padding: padded ? Theme.spacing.lg : 0,
    },
    Theme.elevation.card,
    style,
  ]

  const content = (
    <>
      {ruled && (
        <View
          style={[
            styles.rule,
            { backgroundColor: Theme.semantic.accent.brass },
          ]}
        />
      )}
      {children}
    </>
  )

  if (!onPress) {
    return (
      <View style={baseStyle} testID={testID}>
        {content}
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
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  rule: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
})
