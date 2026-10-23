import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { TextField } from "./TextField"


export interface MeasurementRowProps {
  label: string
  value?: number | null
  unit: string
  onChangeText?: (value: string) => void
  editable?: boolean
  hint?: string
  error?: string
  style?: StyleProp<ViewStyle>
}

export function MeasurementRow({
  label,
  value,
  unit,
  onChangeText,
  editable = true,
  hint,
  error,
  style,
}: MeasurementRowProps) {
  const { Theme } = useAppTheme()

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, { color: Theme.semantic.text.primary }]}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextField
          value={value === null || value === undefined ? "" : String(value)}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          editable={editable}
          hint={hint}
          error={error}
          inputStyle={{ textAlign: "right" }}
        />
        <Text style={[styles.unit, { color: Theme.semantic.text.secondary }]}>{unit}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 48,
  },
  label: {
    flex: 1,
    fontFamily: "Onest",
    fontSize: 15,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unit: {
    width: 32,
    textAlign: "right",
    fontFamily: "Onest",
    fontSize: 13,
  },
})
