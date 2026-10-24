import { StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface ScreenHeaderProps {
  title: string
  overline?: string
  description?: string
  right?: ReactNode
  style?: StyleProp<ViewStyle>
}

export function ScreenHeader({ title, overline, description, right, style }: ScreenHeaderProps) {
  const { Theme } = useAppTheme()

  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        {overline && (
          <View style={styles.overlineRow}>
            <View style={[styles.overlineRule, { backgroundColor: Theme.semantic.accent.brass }]} />
            <Text
              style={{
                color: Theme.semantic.text.secondary,
                fontFamily: Theme.fonts.onestBold,
                fontSize: Theme.fontSizes.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {overline}
            </Text>
          </View>
        )}
        <Text
          accessibilityRole="header"
          style={{
            color: Theme.semantic.text.primary,
            fontFamily: Theme.fonts.display,
            fontSize: Theme.fontSizes.display,
            lineHeight: Theme.lineHeights.display,
            letterSpacing: -0.6,
          }}
        >
          {title}
        </Text>
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
      {right && <View style={styles.right}>{right}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  overlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overlineRule: {
    width: 18,
    height: 2,
    borderRadius: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
})
