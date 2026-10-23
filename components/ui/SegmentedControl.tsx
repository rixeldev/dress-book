import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface SegmentedControlOption<T extends string> {
  label: string
  value: T
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  style?: StyleProp<ViewStyle>
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { Theme } = useAppTheme()

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={style}>
      <View style={[styles.container, { backgroundColor: Theme.semantic.bg.sunken }]}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.segment,
                selected && { backgroundColor: Theme.semantic.accent.primary },
                pressed && !selected && styles.pressed,
              ]}
            >
              <Text
                style={{
                  color: selected ? Theme.semantic.text.inverse : Theme.semantic.text.primary,
                  fontFamily: selected ? Theme.fonts.onestBold : Theme.fonts.onest,
                  fontSize: Theme.fontSizes.label,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segment: {
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.7,
  },
})
