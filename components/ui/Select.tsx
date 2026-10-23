import { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Card } from "./Card"

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  style?: StyleProp<ViewStyle>
}

export function Select({ label, value, options, onChange, placeholder, error, style }: SelectProps) {
  const { Theme } = useAppTheme()
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: Theme.semantic.bg.sunken,
            borderColor: error ? Theme.semantic.state.danger : Theme.semantic.border.subtle,
          },
        ]}
      >
        <Text
          style={{
            color: selected ? Theme.semantic.text.primary : Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.body,
          }}
        >
          {selected?.label ?? placeholder ?? "Select"}
        </Text>
      </Pressable>
      {error && (
        <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.caption }}>
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Card style={styles.sheet} padded={false}>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text
                    style={{
                      color: option.value === value ? Theme.semantic.accent.primary : Theme.semantic.text.primary,
                      fontFamily: option.value === value ? Theme.fonts.onestBold : Theme.fonts.onest,
                      fontSize: Theme.fontSizes.body,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    maxHeight: "70%",
    borderRadius: 16,
    padding: 8,
  },
  option: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
})
