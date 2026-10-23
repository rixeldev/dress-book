import React, { Component, ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => {
  const { Theme } = useAppTheme()
  const { t } = useTranslation()

  return (
    <View style={[styles.container, { backgroundColor: Theme.colors.background }]}>
      <Text style={[styles.title, { color: Theme.colors.text, fontFamily: Theme.fonts.onestBold }]}>
        {t("error_boundary_title")}
      </Text>
      <Text
        style={[styles.description, { color: Theme.colors.gray, fontFamily: Theme.fonts.onest }]}
      >
        {t("error_boundary_desc")}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t("try_again")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: Theme.colors.accent, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: Theme.colors.background, fontFamily: Theme.fonts.onestBold },
          ]}
        >
          {t("try_again")}
        </Text>
      </Pressable>
    </View>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled app error:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
  },
})
