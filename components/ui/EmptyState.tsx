import { StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Button, type ButtonVariant } from "./Button"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  actionVariant?: ButtonVariant
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionVariant = "secondary",
  style,
  testID,
}: EmptyStateProps) {
  const { Theme } = useAppTheme()

  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon && (
        <View
          style={[
            styles.icon,
            {
              backgroundColor: Theme.semantic.bg.surface,
              borderColor: Theme.semantic.border.subtle,
            },
            Theme.elevation.card,
          ]}
        >
          {icon}
          <View
            style={[styles.iconDot, { backgroundColor: Theme.semantic.accent.brass }]}
          />
        </View>
      )}

      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.display,
          fontSize: Theme.fontSizes.h1,
          lineHeight: Theme.lineHeights.h1,
          letterSpacing: -0.4,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={{
            maxWidth: 320,
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.body,
            lineHeight: Theme.lineHeights.body,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={actionVariant}
          style={styles.action}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  icon: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 26,
    marginBottom: 8,
    transform: [{ rotate: "-3deg" }],
  },
  iconDot: {
    position: "absolute",
    right: -3,
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  action: {
    marginTop: 12,
  },
})
