import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"

export type SyncStatus = "synced" | "pending" | "offline" | "error"

export interface SyncPillProps {
  status: SyncStatus
  label?: string
  style?: StyleProp<ViewStyle>
}

export function SyncPill({ status, label, style }: SyncPillProps) {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  const palette = {
    synced: { color: Theme.semantic.state.success, border: Theme.semantic.state.success },
    pending: { color: Theme.semantic.state.warning, border: Theme.semantic.state.warning },
    offline: { color: Theme.semantic.text.secondary, border: Theme.semantic.border.strong },
    error: { color: Theme.semantic.state.danger, border: Theme.semantic.state.danger },
  }[status]

  const text = label ?? t(`sync_${status}`)

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: Theme.semantic.bg.surface, borderColor: palette.border },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.color }]} />
      <Text
        style={{
          color: palette.color,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.caption,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 26,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
