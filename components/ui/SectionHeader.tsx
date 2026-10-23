import { Pressable, StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface SectionHeaderProps {
  title: string
  overline?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  style?: StyleProp<ViewStyle>
}

export function SectionHeader({
  title,
  overline,
  description,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  const { Theme } = useAppTheme()

  return (
    <View style={[styles.container, style]}>
      {overline && (
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.caption,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {overline}
        </Text>
      )}

      <View style={styles.titleRow}>
        <Text
          style={{
            flex: 1,
            color: Theme.semantic.text.primary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.h3,
          }}
        >
          {title}
        </Text>

        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              style={{
                color: Theme.semantic.accent.primary,
                fontFamily: Theme.fonts.onestBold,
                fontSize: Theme.fontSizes.label,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>

      {description && (
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.label,
            lineHeight: Theme.lineHeights.label,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
})
