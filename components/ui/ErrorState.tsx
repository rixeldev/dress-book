import { StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Button } from "./Button"

export interface ErrorStateProps {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  style?: StyleProp<ViewStyle>
}

export function ErrorState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}: ErrorStateProps) {
  const { Theme } = useAppTheme()

  return (
    <View style={[styles.container, style]} accessibilityLiveRegion="polite">
      {icon && (
        <View
          style={[
            styles.icon,
            {
              backgroundColor: `${Theme.semantic.state.danger}1A`,
              borderColor: Theme.semantic.state.danger,
            },
          ]}
        >
          {icon}
        </View>
      )}
      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.display,
          fontSize: Theme.fontSizes.h1,
          lineHeight: Theme.lineHeights.h1,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
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
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
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
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 999,
    marginBottom: 4,
  },
  action: {
    marginTop: 8,
  },
})
