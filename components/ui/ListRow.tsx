import { Pressable, StyleSheet, Text, View } from "react-native"
import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { ChevronRightIcon } from "@/icons/Icons"

export interface ListRowProps {
  title: string
  description?: string
  leading?: ReactNode
  trailing?: ReactNode
  onPress?: () => void
  destructive?: boolean
  titleColor?: string
  disabled?: boolean
  divider?: boolean
  chevron?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  testID?: string
}

export function ListRow({
  title,
  description,
  leading,
  trailing,
  onPress,
  destructive = false,
  titleColor,
  disabled = false,
  divider = true,
  chevron = false,
  style,
  accessibilityLabel,
  testID,
}: ListRowProps) {
  const { Theme } = useAppTheme()

  const content = (
    <>
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.copy}>
        <Text
          style={{
            color:
              titleColor ??
              (destructive ? Theme.semantic.state.danger : Theme.semantic.text.primary),
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.body,
          }}
          numberOfLines={1}
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
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
      {chevron && (
        <View style={styles.chevron}>
          <ChevronRightIcon size={18} color={Theme.semantic.text.tertiary} />
        </View>
      )}
    </>
  )

  const rowStyle = [
    styles.row,
    {
      borderBottomColor: Theme.semantic.border.subtle,
      borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
      opacity: disabled ? 0.45 : 1,
    },
    style,
  ]

  if (!onPress) {
    return (
      <View style={rowStyle} testID={testID}>
        {content}
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        rowStyle,
        pressed && !disabled && { backgroundColor: Theme.semantic.bg.sunken },
      ]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  leading: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    marginLeft: -4,
  },
})
