import { ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { ListRow } from "@/components/ui/ListRow"
import { useAppTheme } from "@/hooks/useAppTheme"

interface SettingsButtonProps {
  onPress: () => void
  title: string
  description?: string
  icon: ReactNode
  color?: string
}

export const SettingsButton = ({
  onPress,
  title,
  description,
  icon,
  color,
}: SettingsButtonProps) => {
  const { Theme } = useAppTheme()

  return (
    <ListRow
      title={title}
      description={description}
      onPress={onPress}
      titleColor={color}
      chevron
      style={styles.row}
      leading={
        <View
          style={[
            styles.icon,
            {
              backgroundColor: Theme.semantic.bg.sunken,
              borderColor: Theme.semantic.border.subtle,
            },
          ]}
        >
          {icon}
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
})
