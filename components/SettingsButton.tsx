import { ReactElement } from "react"
import { StyleSheet } from "react-native"
import { ListRow } from "@/components/ui/ListRow"

interface SettingsButtonProps {
  onPress: () => void
  title: string
  description?: string
  icon: ReactElement
  color?: string
}

export const SettingsButton = ({
  onPress,
  title,
  description,
  icon,
  color,
}: SettingsButtonProps) => {
  return (
    <ListRow
      title={title}
      description={description}
      leading={icon}
      onPress={onPress}
      titleColor={color}
      style={styles.row}
    />
  )
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
})
