import { useCallback, useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon, ClockIcon, CopyIcon, TrashIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import {
  getOrder,
  updateOrderStatus,
  deleteOrder,
  duplicateOrder,
} from "@/features/orders/repository"
import { getActivity, addActivity } from "@/features/orders/activity"
import type { ActivityEntry } from "@/features/orders/activity"
import type { Order, OrderStatus } from "@/interfaces/Order"
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  MoneyText,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  type BadgeTone,
} from "@/components/ui"
import { daysUntil, formatIsoDate, formatIsoTime } from "@/libs/dates"
import { calculateBalance, formatMoney } from "@/libs/money"

const statuses: OrderStatus[] = [
  "consultation",
  "measurements",
  "cutting",
  "sewing",
  "fitting",
  "delivered",
  "cancelled",
]

const statusTone: Record<OrderStatus, BadgeTone> = {
  consultation: "neutral",
  measurements: "warning",
  cutting: "warning",
  sewing: "accent",
  fitting: "accent",
  delivered: "success",
  cancelled: "neutral",
}

export default function OrderDetailScreen() {
  const { t, i18n } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!user || !params.id) return
    setLoading(true)
    try {
      const [loadedOrder, loadedActivity] = await Promise.all([
        getOrder(user.uid, params.id),
        getActivity(user.uid, params.id),
      ])
      setOrder(loadedOrder)
      setActivity(loadedActivity)
    } finally {
      setLoading(false)
    }
  }, [user, params.id])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (status: OrderStatus) => {
    if (!user || !order || status === order.status) return
    setSaving(true)
    try {
      await updateOrderStatus(user.uid, order.id, status)
      await addActivity(user.uid, order.id, {
        type: "status_changed",
        message: `${t(order.status)} → ${t(status)}`,
        from: order.status,
        to: status,
        actorUid: user.uid,
      })
      setOrder({
        ...order,
        status,
        deliveredAt: status === "delivered" ? new Date().toISOString() : null,
      })
      setActivity(await getActivity(user.uid, order.id))
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async () => {
    if (!user || !order) return
    const duplicated = await duplicateOrder(user.uid, order)
    router.replace(`/order/${duplicated.id}`)
  }

  const handleDelete = () => {
    if (!user || !order) return
    Alert.alert(t("delete_order"), t("delete_order_desc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteOrder(user.uid, order.id)
          router.replace("/orders")
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerTitle: t("order") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="60%" height={38} />
          <Skeleton height={130} radius={20} />
          <Skeleton height={100} radius={20} />
        </View>
      </Screen>
    )
  }

  if (!order) {
    return (
      <Screen padding={0}>
        <Stack.Screen options={{ headerTitle: t("order") }} />
        <EmptyState
          title={t("order_not_found")}
          actionLabel={t("back")}
          onAction={() => router.replace("/orders")}
        />
      </Screen>
    )
  }

  const days = daysUntil(order.dueDate)
  const balance = calculateBalance(order.price, order.deposit)

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("order"),
          headerLeft: () => (
            <IconButton
              icon={<BackIcon color={Theme.semantic.text.primary} size={24} />}
              onPress={() => router.back()}
              accessibilityLabel={t("back")}
            />
          ),
          headerRight: () => null,
        }}
      />
      <ScrollView
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 48,
          gap: Theme.spacing.lg,
        }}
      >
        <ScreenHeader
          overline={order.clientName}
          title={order.title}
          right={<Badge label={t(order.status)} tone={statusTone[order.status]} dot />}
        />

        <Card style={{ gap: Theme.spacing.sm }}>
          <View style={styles.moneyRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.overline, { color: Theme.semantic.text.secondary }]}>
                {t("price")}
              </Text>
              <MoneyText amount={order.price} currency={order.currency} size="lg" />
            </View>
            {order.deposit !== null && (
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.overline, { color: Theme.semantic.text.secondary }]}>
                  {t("deposit")}
                </Text>
                <MoneyText amount={order.deposit} currency={order.currency} />
              </View>
            )}
            {balance !== null && (
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.overline, { color: Theme.semantic.text.secondary }]}>
                  {t("balance")}
                </Text>
                <Text
                  style={{
                    color:
                      balance > 0
                        ? Theme.semantic.state.warning
                        : Theme.semantic.state.success,
                    fontFamily: Theme.fonts.onestBold,
                    fontSize: Theme.fontSizes.body,
                  }}
                >
                  {formatMoney(balance, order.currency)}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[styles.metaWrap, { borderTopColor: Theme.semantic.border.subtle }]}
          >
            <View style={styles.metaItem}>
              <ClockIcon size={14} color={Theme.semantic.text.secondary} />
              <Text
                style={[styles.metaText, { color: Theme.semantic.text.secondary }]}
              >
                {order.dueDate ? formatIsoDate(order.dueDate, i18n.language) : t("no_deadline")}
              </Text>
            </View>
            {days !== null &&
              order.status !== "delivered" &&
              order.status !== "cancelled" && (
                <Badge
                  label={
                    days < 0
                      ? t("overdue_by_days", { count: Math.abs(days) })
                      : days === 0
                        ? t("due_today_short")
                        : t("due_in_days", { count: days })
                  }
                  tone={days < 0 ? "danger" : days <= 3 ? "warning" : "neutral"}
                />
              )}
            <Badge label={t(order.type.toLowerCase())} tone="neutral" />
          </View>
        </Card>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("status")} description={t("order_status_desc")} />
          <Card>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  label={t(status)}
                  selected={order.status === status}
                  disabled={saving}
                  onPress={() => changeStatus(status)}
                />
              ))}
            </View>
          </Card>
        </View>

        {order.notes ? (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("notes")} />
            <Card>
              <Text
                style={{
                  color: Theme.semantic.text.primary,
                  fontFamily: Theme.fonts.onest,
                  fontSize: Theme.fontSizes.body,
                  lineHeight: Theme.lineHeights.body,
                }}
              >
                {order.notes}
              </Text>
            </Card>
          </View>
        ) : null}

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("activity")} description={t("activity_desc")} />
          <Card>
            {activity.length === 0 ? (
              <Text
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onest,
                  fontSize: Theme.fontSizes.label,
                }}
              >
                {t("no_activity")}
              </Text>
            ) : (
              <View style={{ gap: Theme.spacing.sm }}>
                {activity.map((entry, index) => (
                  <View key={entry.id} style={styles.activityRow}>
                    <View style={styles.activityTrack}>
                      <View
                        style={[
                          styles.activityDot,
                          { backgroundColor: Theme.semantic.accent.brass },
                        ]}
                      />
                      {index < activity.length - 1 && (
                        <View
                          style={[
                            styles.activityLine,
                            { backgroundColor: Theme.semantic.border.subtle },
                          ]}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          color: Theme.semantic.text.primary,
                          fontFamily: Theme.fonts.onestBold,
                          fontSize: Theme.fontSizes.label,
                        }}
                      >
                        {entry.message}
                      </Text>
                      <Text
                        style={{
                          color: Theme.semantic.text.tertiary,
                          fontFamily: Theme.fonts.onest,
                          fontSize: Theme.fontSizes.caption,
                        }}
                      >
                        {formatIsoDate(entry.createdAt, i18n.language)} ·{" "}
                        {formatIsoTime(entry.createdAt, i18n.language)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          <Button
            label={t("duplicate_order")}
            onPress={handleDuplicate}
            variant="secondary"
            fullWidth
            icon={<CopyIcon size={18} color={Theme.semantic.text.primary} />}
          />
          <Button
            label={t("delete_order")}
            onPress={handleDelete}
            variant="ghost"
            fullWidth
            icon={<TrashIcon size={18} color={Theme.semantic.state.danger} />}
            labelStyle={{ color: Theme.semantic.state.danger }}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  moneyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  overline: {
    fontFamily: "OnestBold",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metaWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Onest",
    fontSize: 13,
  },
  activityRow: {
    flexDirection: "row",
    gap: 10,
  },
  activityTrack: {
    alignItems: "center",
    width: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  activityLine: {
    flex: 1,
    width: 1,
    marginTop: 3,
  },
})
