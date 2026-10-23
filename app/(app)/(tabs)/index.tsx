import { useCallback, useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getOrders } from "@/features/orders/repository"
import { getClients } from "@/features/clients/repository"
import type { Order } from "@/interfaces/Order"
import type { Client } from "@/interfaces/Client"
import { EmptyState, Screen, SectionHeader, StatCard, SyncPill } from "@/components/ui"
import { useSync } from "@/contexts/SyncContext"
import { ListIcon } from "@/icons/Icons"
import { daysUntil, formatIsoDate } from "@/libs/dates"
import { formatMoney } from "@/libs/money"

export default function TodayScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { syncStatus } = useSync()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [loadedOrders, loadedClients] = await Promise.all([getOrders(user.uid), getClients(user.uid)])
      setOrders(loadedOrders)
      setClients(loadedClients)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const overdue = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days !== null && days < 0 && order.status !== "delivered" && order.status !== "cancelled"
  })
  const dueToday = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days === 0 && order.status !== "delivered" && order.status !== "cancelled"
  })
  const dueThisWeek = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days !== null && days > 0 && days <= 7 && order.status !== "delivered" && order.status !== "cancelled"
  })
  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled")
  const revenue = orders.reduce((sum, order) => sum + (order.price ?? 0), 0)

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <View style={{ flexDirection: "row", gap: Theme.spacing.sm }}>
            <View style={{ flex: 1, height: 96, borderRadius: 12, backgroundColor: Theme.colors.background2 }} />
            <View style={{ flex: 1, height: 96, borderRadius: 12, backgroundColor: Theme.colors.background2 }} />
          </View>
          <View style={{ height: 72, borderRadius: 12, backgroundColor: Theme.colors.background2 }} />
        </View>
      </Screen>
    )
  }

  if (orders.length === 0 && clients.length === 0) {
    return (
      <Screen padding={0}>
        <EmptyState
          title={t("today_empty_title")}
          description={t("today_empty_desc")}
          icon={<ListIcon color={Theme.semantic.accent.primary} size={30} />}
          actionLabel={t("new_client")}
          onAction={() => router.push("/client/new")}
        />
      </Screen>
    )
  }

  const renderOrder = (order: Order) => (
    <View
      key={order.id}
      style={{
        borderRadius: Theme.radius.card,
        backgroundColor: Theme.semantic.bg.surface,
        borderWidth: 1,
        borderColor: Theme.semantic.border.subtle,
        padding: Theme.spacing.md,
        gap: Theme.spacing.xs,
        ...Theme.elevation.card,
      }}
    >
      <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.body }}>
        {order.title}
      </Text>
      <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
        {order.clientName} · {order.dueDate ? formatIsoDate(order.dueDate) : t("no_deadline")}
      </Text>
      <Text style={{ color: Theme.semantic.accent.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
        {formatMoney(order.price, order.currency as "USD" | "EUR" | "GBP")} · {t(order.status)}
      </Text>
    </View>
  )

  return (
    <Screen padding={0}>
      <FlatList
        contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.lg }}>
            <SyncPill status={syncStatus} />
            <View style={{ flexDirection: "row", gap: Theme.spacing.sm }}>
              <StatCard label={t("active_orders")} value={activeOrders.length} hint={t("orders_in_progress")} style={{ flex: 1 }} />
              <StatCard label={t("clients")} value={clients.length} hint={t("total_clients")} style={{ flex: 1 }} />
            </View>
            <StatCard label={t("booked_value")} value={formatMoney(revenue, "USD")} hint={t("all_orders")} />

            {overdue.length > 0 && (
              <View style={{ gap: Theme.spacing.sm }}>
                <SectionHeader title={t("overdue")} description={t("overdue_desc")} />
                {overdue.map(renderOrder)}
              </View>
            )}

            {dueToday.length > 0 && (
              <View style={{ gap: Theme.spacing.sm }}>
                <SectionHeader title={t("due_today")} description={t("due_today_desc")} />
                {dueToday.map(renderOrder)}
              </View>
            )}

            {dueThisWeek.length > 0 && (
              <View style={{ gap: Theme.spacing.sm }}>
                <SectionHeader title={t("due_this_week")} description={t("due_this_week_desc")} />
                {dueThisWeek.map(renderOrder)}
              </View>
            )}

            {activeOrders.length === 0 && (
              <EmptyState
                title={t("today_clear_title")}
                description={t("today_clear_desc")}
                icon={<ListIcon color={Theme.semantic.state.success} size={30} />}
              />
            )}
          </View>
        }
      />
    </Screen>
  )
}
