import { Image, StyleSheet, View } from "react-native"
import { findCountry } from "@/libs/countries"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface FlagProps {
  /** ISO 3166-1 alpha-2 code, case-insensitive. */
  code: string
  size?: number
}

export function Flag({ code, size = 22 }: FlagProps) {
  const { Theme } = useAppTheme()
  const country = findCountry(code)

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size * 0.72,
          borderColor: Theme.semantic.border.subtle,
        },
      ]}
    >
      {country && (
        <Image
          source={country.flag}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
  },
})
