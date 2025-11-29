import React, { useState, useRef, useEffect, useMemo } from "react"
import { Animated, TextInput, StyleSheet, KeyboardTypeOptions } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

interface FocusInputProps {
  placeholder: string
  type?: KeyboardTypeOptions
  onChange?: (text: string) => void
  capitalize?: "none" | "sentences" | "words" | "characters"
  value?: string
  editable?: boolean
  returnKeyType?: any
  onSubmitEditing?: () => void
}

export const FocusInput = ({
  type = "default",
  placeholder,
  onChange,
  capitalize,
  value,
  editable = true,
  onSubmitEditing,
  ...props
}: FocusInputProps) => {
  const { Theme } = useAppTheme()
  const styles = useMemo(() => createStyles(Theme), [Theme])
  const [isFocused, setIsFocused] = useState(false)
  const borderAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderAnim])

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", Theme.colors.accent],
  })

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 0],
    outputRange: [1, 1],
  })

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          borderColor,
          borderWidth,
        },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.gray}
        keyboardType={type}
        cursorColor={Theme.colors.accent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={onChange}
        autoCapitalize={capitalize}
        value={value}
        editable={editable}
        style={[styles.input, !editable && { color: Theme.colors.gray }]}
        onSubmitEditing={onSubmitEditing}
        {...props}
      />
    </Animated.View>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    inputContainer: {
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
    },
    input: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      color: Theme.colors.text,
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h4,
    },
  })
