import { useState } from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  disabled?: boolean
}

export function TextField({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  disabled = false,
  multiline = false,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  ...inputProps
}: TextFieldProps) {
  const { Theme } = useAppTheme()
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? Theme.semantic.state.danger
    : focused
      ? Theme.semantic.accent.primary
      : Theme.semantic.border.subtle

  const handleFocus: TextInputProps["onFocus"] = (event) => {
    setFocused(true)
    onFocus?.(event)
  }

  const handleBlur: TextInputProps["onBlur"] = (event) => {
    setFocused(false)
    onBlur?.(event)
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.label,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputShell,
          {
            minHeight: multiline ? 112 : 48,
            alignItems: multiline ? "flex-start" : "center",
            paddingVertical: multiline ? Theme.spacing.sm : 0,
            backgroundColor: Theme.semantic.bg.sunken,
            borderColor,
          },
          focused && styles.focused,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          {...inputProps}
          multiline={multiline}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint ?? hint}
          placeholderTextColor={Theme.semantic.text.secondary}
          selectionColor={Theme.semantic.accent.primary}
          style={[
            styles.input,
            {
              color: Theme.semantic.text.primary,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.fontSizes.body,
              lineHeight: Theme.lineHeights.body,
              minHeight: multiline ? 88 : 24,
              paddingVertical: multiline ? 0 : 12,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>

      {(error || hint) && (
        <Text
          accessibilityLiveRegion={error ? "polite" : "none"}
          style={{
            color: error ? Theme.semantic.state.danger : Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.caption,
            lineHeight: Theme.lineHeights.caption,
          }}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  )
}

export function TextArea(props: TextFieldProps) {
  return <TextField {...props} multiline numberOfLines={props.numberOfLines ?? 4} />
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: "100%",
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  focused: {
    borderWidth: 2,
    paddingHorizontal: 13,
  },
  disabled: {
    opacity: 0.55,
  },
})
