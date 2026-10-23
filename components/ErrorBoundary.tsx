import React, { Component, ReactNode } from "react"
import crashlytics from "@react-native-firebase/crashlytics"
import { StyleSheet, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Button } from "@/components/ui/Button"

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
      <Button label={t("try_again")} onPress={onRetry} style={styles.button} />
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
    try {
      crashlytics().recordError(error)
      crashlytics().log(info.componentStack ?? "")
    } catch {
      // Crashlytics is unavailable in some environments.
    }
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
  },
})
