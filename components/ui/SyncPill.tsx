import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useTranslation } from "react-i18next"

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
    synced: { color: Theme.semantic.state.success, bg: `${Theme.semantic.state.success}1F` },
    pending: { color: Theme.semantic.state.warning, bg: `${Theme.semantic.state.warning}24` },
    offline: { color: Theme.semantic.text.secondary, bg: Theme.semantic.bg.sunken },
    error: { color: Theme.semantic.state.danger, bg: `${Theme.semantic.state.danger}1F` },
  }[status]

  const text = label ?? t(`sync_${status}`)

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: palette.color }]} />
      <Text style={{ color: palette.color, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.caption }}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 22,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
