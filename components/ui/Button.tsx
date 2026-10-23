import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, TextStyle, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
  testID?: string
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  labelStyle,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { Theme } = useAppTheme()
  const isDisabled = disabled || loading

  const palette = {
    primary: {
      backgroundColor: Theme.semantic.accent.primary,
      color: Theme.semantic.text.inverse,
    },
    secondary: {
      backgroundColor: Theme.semantic.bg.sunken,
      color: Theme.semantic.text.primary,
      borderWidth: 1,
      borderColor: Theme.semantic.border.subtle,
    },
    ghost: {
      backgroundColor: "transparent",
      color: Theme.semantic.accent.primary,
    },
    danger: {
      backgroundColor: Theme.semantic.state.danger,
      color: Theme.semantic.text.inverse,
    },
  }[variant]

  const metrics = {
    sm: { minHeight: 36, paddingHorizontal: Theme.spacing.sm, gap: Theme.spacing.xxs },
    md: { minHeight: 44, paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.xs },
    lg: { minHeight: 52, paddingHorizontal: Theme.spacing.lg, gap: Theme.spacing.sm },
  }[size]

  const fontSize =
    size === "sm" ? Theme.fontSizes.label : size === "lg" ? Theme.fontSizes.body : Theme.fontSizes.body

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        metrics,
        palette,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.color} testID="button-loading" />
      ) : (
        icon && <View style={styles.icon}>{icon}</View>
      )}
      <Text
        style={[
          {
            color: palette.color,
            fontFamily: Theme.fonts.onestBold,
            fontSize,
          },
          styles.label,
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    letterSpacing: 0.2,
    textAlign: "center",
  },
})
