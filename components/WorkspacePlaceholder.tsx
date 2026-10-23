import { View } from "react-native"
import type { ReactNode } from "react"
import { useAppTheme } from "@/hooks/useAppTheme"
import { EmptyState, Screen } from "@/components/ui"

interface WorkspacePlaceholderProps {
  title: string
  description: string
  icon: ReactNode
}

export function WorkspacePlaceholder({ title, description, icon }: WorkspacePlaceholderProps) {
  const { Theme } = useAppTheme()

  return (
    <Screen padding={0}>
      <View style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}>
        <EmptyState title={title} description={description} icon={icon} />
      </View>
    </Screen>
  )
}
