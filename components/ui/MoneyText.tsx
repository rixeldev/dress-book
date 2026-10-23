import { Text } from "react-native"
import type { StyleProp, TextStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { formatMoney, type CurrencyCode } from "@/libs/money"

export interface MoneyTextProps {
  amount: number | null | undefined
  currency: CurrencyCode | string
  size?: "sm" | "md" | "lg"
  style?: StyleProp<TextStyle>
}

export function MoneyText({ amount, currency, size = "md", style }: MoneyTextProps) {
  const { Theme } = useAppTheme()

  const fontSize =
    size === "sm" ? Theme.fontSizes.label : size === "lg" ? Theme.fontSizes.h2 : Theme.fontSizes.body

  return (
    <Text
      style={[
        {
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize,
        },
        style,
      ]}
    >
      {formatMoney(amount ?? null, currency as CurrencyCode)}
    </Text>
  )
}

// no local styles needed
