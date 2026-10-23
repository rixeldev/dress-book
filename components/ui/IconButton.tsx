import { Pressable, StyleSheet } from "react-native"
import type { ReactNode } from "react"
import type { Insets, StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export type IconButtonVariant = "ghost" | "surface" | "primary"
export type IconButtonSize = "sm" | "md" | "lg"

export interface IconButtonProps {
  icon: ReactNode
  onPress: () => void
  accessibilityLabel: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  hitSlop?: Insets | number
  testID?: string
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = "ghost",
  size = "md",
  disabled = false,
  style,
  hitSlop = 8,
  testID,
}: IconButtonProps) {
  const { Theme } = useAppTheme()

  const palette = {
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderColor: "transparent",
    },
    surface: {
      backgroundColor: Theme.semantic.bg.surface,
      borderWidth: 1,
      borderColor: Theme.semantic.border.subtle,
    },
    primary: {
      backgroundColor: Theme.semantic.accent.primary,
      borderWidth: 0,
      borderColor: "transparent",
    },
  }[variant]

  const dimensions = {
    sm: 36,
    md: 44,
    lg: 52,
  }[size]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        { width: dimensions, height: dimensions },
        palette,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
})
