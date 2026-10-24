import { Pressable, StyleSheet, Text } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface FabProps {
  onPress: () => void
  icon?: ReactNode
  label?: string
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

export function Fab({ onPress, icon, label, accessibilityLabel, style }: FabProps) {
  const { Theme } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: Theme.semantic.accent.primary },
        Theme.elevation.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
      {label && (
        <Text style={{ color: Theme.semantic.text.inverse, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    minWidth: 58,
    minHeight: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.85,
  },
})
