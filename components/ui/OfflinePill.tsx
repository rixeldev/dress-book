import { StyleSheet, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { OfflineIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export function OfflinePill() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { isOffline } = useNetworkStatus()
  const insets = useSafeAreaInsets()

  if (!isOffline) return null

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.pill,
        {
          top: insets.top + 8,
          backgroundColor: Theme.semantic.bg.surface,
          borderColor: Theme.semantic.state.warning,
        },
        Theme.elevation.floating,
      ]}
    >
      <OfflineIcon size={16} color={Theme.semantic.state.warning} />
      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.label,
        }}
      >
        {t("offline_sync_message")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
})
