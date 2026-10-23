import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { IconButton } from "./IconButton"

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  style?: StyleProp<ViewStyle>
}

export function Stepper({ value, onChange, min = 0, max = 100, step = 1, label, style }: StepperProps) {
  const { Theme } = useAppTheme()

  const decrease = () => onChange(Math.max(min, value - step))
  const increase = () => onChange(Math.min(max, value + step))

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
          {label}
        </Text>
      )}
      <View style={styles.controls}>
        <IconButton icon={<Text style={{ fontSize: 18, color: Theme.semantic.text.primary }}>−</Text>} onPress={decrease} accessibilityLabel="Decrease" />
        <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.h3, minWidth: 36, textAlign: "center" }}>
          {value}
        </Text>
        <IconButton icon={<Text style={{ fontSize: 18, color: Theme.semantic.text.primary }}>+</Text>} onPress={increase} accessibilityLabel="Increase" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})
