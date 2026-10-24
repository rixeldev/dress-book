import { memo } from "react"
import { StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Card } from "./Card"
import { Badge, type BadgeTone } from "./Badge"
import { daysUntil } from "@/libs/dates"
import { formatMoney } from "@/libs/money"
import type { Order } from "@/interfaces/Order"

export interface OrderCardProps {
  order: Pick<
    Order,
    "title" | "clientName" | "status" | "dueDate" | "price" | "currency" | "priority"
  >
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}

const statusTone: Record<string, BadgeTone> = {
  delivered: "success",
  cancelled: "neutral",
  fitting: "accent",
  sewing: "accent",
  cutting: "warning",
  measurements: "warning",
  consultation: "neutral",
}

export const OrderCard = memo(function OrderCard({ order, onPress, style, testID }: OrderCardProps) {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  const days = daysUntil(order.dueDate)
  const isOpen = order.status !== "delivered" && order.status !== "cancelled"

  const dueLabel =
    days === null
      ? t("no_deadline")
      : days < 0
        ? t("overdue_by_days", { count: Math.abs(days) })
        : days === 0
          ? t("due_today_short")
          : t("due_in_days", { count: days })

  const dueColor =
    days !== null && days < 0 && isOpen
      ? Theme.semantic.state.danger
      : days !== null && days <= 3 && isOpen
        ? Theme.semantic.state.warning
        : Theme.semantic.text.secondary

  return (
    <Card onPress={onPress} style={[styles.card, style]} testID={testID} accessibilityLabel={order.title}>
      <View style={styles.topRow}>
        <Badge label={t(order.status)} tone={statusTone[order.status] ?? "neutral"} dot />
        {order.priority === "high" && isOpen && (
          <Badge label={t("priority")} tone="danger" />
        )}
      </View>

      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.h3,
        }}
        numberOfLines={1}
      >
        {order.title}
      </Text>

      <View style={styles.bottomRow}>
        <Text
          style={{
            flex: 1,
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.label,
          }}
          numberOfLines={1}
        >
          {order.clientName}
        </Text>
        <Text
          style={{
            color: Theme.semantic.text.primary,
            fontFamily: Theme.fonts.display,
            fontSize: Theme.fontSizes.h3,
          }}
        >
          {formatMoney(order.price, order.currency)}
        </Text>
      </View>

      <View style={[styles.dueRow, { borderTopColor: Theme.semantic.border.subtle }]}>
        <Text
          style={{
            color: dueColor,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.caption,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {dueLabel}
        </Text>
      </View>
    </Card>
  )
})

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  dueRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 2,
  },
})
