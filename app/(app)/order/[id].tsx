import { useCallback, useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getOrder, updateOrderStatus, deleteOrder, duplicateOrder } from "@/features/orders/repository"
import { getActivity, addActivity } from "@/features/orders/activity"
import type { ActivityEntry } from "@/features/orders/activity"
import type { Order, OrderStatus } from "@/interfaces/Order"
import { Button, Card, Chip, MoneyText, Screen, SectionHeader } from "@/components/ui"
import { formatIsoDate } from "@/libs/dates"
import { formatMoney } from "@/libs/money"

const statuses: OrderStatus[] = ["consultation", "measurements", "cutting", "sewing", "fitting", "delivered", "cancelled"]

export default function OrderDetailScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [, setSaving] = useState(false)

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
    if (!user || !order) return
    setSaving(true)
    try {
      await updateOrderStatus(user.uid, order.id, status)
      await addActivity(user.uid, order.id, {
        type: "status_changed",
        message: `${order.status} → ${status}`,
        from: order.status,
        to: status,
        actorUid: user.uid,
      })
      setOrder({ ...order, status, deliveredAt: status === "delivered" ? new Date().toISOString() : null })
      setActivity(await getActivity(user.uid, order.id))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Card>
            <View style={{ gap: Theme.spacing.sm }}>
              <View style={{ width: "60%", height: 24, borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
              <View style={{ width: "40%", height: 16, borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
            </View>
          </Card>
        </View>
      </Screen>
    )
  }

  if (!order) {
    return (
      <Screen padding={0}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Theme.spacing.xl }}>
          <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>{t("order_not_found")}</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: order.title,
          headerLeft: () => <BackIcon color={Theme.colors.text} size={24} onPress={() => router.back()} />,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}>
        <Card>
          <View style={{ gap: Theme.spacing.sm }}>
            <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.display, fontSize: Theme.fontSizes.h1 }}>
              {order.title}
            </Text>
            <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>{order.clientName}</Text>
            {order.dueDate && (
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onest }}>
                {t("due")} {formatIsoDate(order.dueDate)}
              </Text>
            )}
            <MoneyText amount={order.price} currency={order.currency} size="lg" />
            {order.deposit !== null && (
              <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>
                {t("deposit")}: {formatMoney(order.deposit, order.currency as "USD" | "EUR" | "GBP")} · {t("balance")}: {formatMoney((order.price ?? 0) - (order.deposit ?? 0), order.currency as "USD" | "EUR" | "GBP")}
              </Text>
            )}
            {order.notes && (
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onest, lineHeight: Theme.lineHeights.body }}>
                {order.notes}
              </Text>
            )}
          </View>
        </Card>

        <Card>
          <SectionHeader title={t("status")} description={t("order_status_desc")} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs, marginTop: Theme.spacing.sm }}>
            {statuses.map((status) => (
              <Chip
                key={status}
                label={t(status)}
                selected={order.status === status}
                onPress={() => changeStatus(status)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <SectionHeader title={t("activity")} description={t("activity_desc")} />
          <View style={{ gap: Theme.spacing.sm, marginTop: Theme.spacing.sm }}>
            {activity.length === 0 ? (
              <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>
                {t("no_activity")}
              </Text>
            ) : (
              activity.map((entry) => (
                <View key={entry.id} style={{ gap: 2 }}>
                  <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                    {entry.message}
                  </Text>
                  <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.caption }}>
                    {entry.createdAt}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Card>

        <Button
          label={t("duplicate_order")}
          onPress={async () => {
            if (!user) return
            const duplicated = await duplicateOrder(user.uid, order)
            router.replace(`/order/${duplicated.id}`)
          }}
          variant="secondary"
          fullWidth
        />
        <Button
          label={t("delete_order")}
          onPress={async () => {
            if (!user) return
            await deleteOrder(user.uid, order.id)
            router.replace("/orders")
          }}
          variant="danger"
          fullWidth
        />
      </ScrollView>
    </Screen>
  )
}

// Money formatting is handled by libs/money.
