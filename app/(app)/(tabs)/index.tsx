import { useCallback, useEffect, useState } from "react"
import { Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { LinearGradient } from "expo-linear-gradient"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useAuth } from "@/contexts/AuthContext"
import { getOrders } from "@/features/orders/repository"
import { getClients } from "@/features/clients/repository"
import type { Order } from "@/interfaces/Order"
import type { Client } from "@/interfaces/Client"
import {
  Badge,
  EmptyState,
  IconButton,
  OrderCard,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  SyncPill,
} from "@/components/ui"
import { useSync } from "@/contexts/SyncContext"
import { CalendarIcon, SearchIcon } from "@/icons/Icons"
import { daysUntil } from "@/libs/dates"
import { formatMoney } from "@/libs/money"

export default function TodayScreen() {
  const { t, i18n } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const { syncStatus } = useSync()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [loadedOrders, loadedClients] = await Promise.all([
        getOrders(user.uid),
        getClients(user.uid),
      ])
      setOrders(loadedOrders)
      setClients(loadedClients)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const isOpen = (order: Order) => order.status !== "delivered" && order.status !== "cancelled"
  const overdue = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days !== null && days < 0 && isOpen(order)
  })
  const dueToday = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days === 0 && isOpen(order)
  })
  const dueThisWeek = orders.filter((order) => {
    const days = daysUntil(order.dueDate)
    return days !== null && days > 0 && days <= 7 && isOpen(order)
  })
  const activeOrders = orders.filter(isOpen)
  const revenue = orders.reduce((sum, order) => sum + (order.price ?? 0), 0)

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const header = (
    <ScreenHeader
      overline={today}
      title={t("today")}
      description={
        activeOrders.length > 0
          ? t("active_orders") + " · " + activeOrders.length
          : t("today_clear_desc")
      }
      right={
        <>
          <IconButton
            icon={<SearchIcon size={20} color={Theme.semantic.text.primary} />}
            accessibilityLabel={t("search")}
            onPress={() => router.push("/search")}
            variant="surface"
          />
          <IconButton
            icon={<CalendarIcon size={20} color={Theme.semantic.text.primary} />}
            accessibilityLabel={t("calendar")}
            onPress={() => router.push("/calendar")}
            variant="surface"
          />
        </>
      }
    />
  )

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="55%" height={38} />
          <Skeleton height={158} radius={24} />
          <Skeleton height={96} radius={20} />
          <Skeleton height={96} radius={20} />
        </View>
      </Screen>
    )
  }

  if (orders.length === 0 && clients.length === 0) {
    return (
      <Screen padding={0}>
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
          {header}
        </View>
        <EmptyState
          title={t("today_empty_title")}
          description={t("today_empty_desc")}
          actionLabel={t("new_client")}
          onAction={() => router.push("/client/new")}
          actionVariant="primary"
        />
      </Screen>
    )
  }

  const section = (title: string, description: string, list: Order[]) =>
    list.length > 0 ? (
      <View style={{ gap: Theme.spacing.sm }}>
        <SectionHeader title={title} description={description} />
        {list.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => router.push(`/order/${order.id}`)}
          />
        ))}
      </View>
    ) : null

  return (
    <Screen padding={0}>
      <FlashList
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 140,
          gap: Theme.spacing.lg,
        }}
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.lg }}>
            {header}

            <LinearGradient
              colors={Theme.gradient.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroTop}>
                <Text style={[styles.heroLabel, { fontFamily: Theme.fonts.onestBold }]}>
                  {t("booked_value")}
                </Text>
                <Badge label={`${activeOrders.length} ${t("in_progress")}`} tone="neutral" />
              </View>
              <Text style={[styles.heroValue, { fontFamily: Theme.fonts.display }]}>
                {formatMoney(revenue, currency)}
              </Text>
              <View style={[styles.heroFooter, { borderTopColor: "#FFFFFF33" }]}>
                <View style={styles.heroMetric}>
                  <Text style={[styles.heroMetricValue, { fontFamily: Theme.fonts.display }]}>
                    {activeOrders.length}
                  </Text>
                  <Text style={[styles.heroMetricLabel, { fontFamily: Theme.fonts.onest }]}>
                    {t("active_orders")}
                  </Text>
                </View>
                <View style={[styles.heroDivider, { backgroundColor: "#FFFFFF33" }]} />
                <View style={styles.heroMetric}>
                  <Text style={[styles.heroMetricValue, { fontFamily: Theme.fonts.display }]}>
                    {clients.length}
                  </Text>
                  <Text style={[styles.heroMetricLabel, { fontFamily: Theme.fonts.onest }]}>
                    {t("clients")}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <SyncPill status={syncStatus} />
              </View>
            </LinearGradient>

            {section(t("overdue"), t("overdue_desc"), overdue)}
            {section(t("due_today"), t("due_today_desc"), dueToday)}
            {section(t("due_this_week"), t("due_this_week_desc"), dueThisWeek)}

            {activeOrders.length === 0 && (
              <EmptyState
                title={t("today_clear_title")}
                description={t("today_clear_desc")}
                actionLabel={t("new_order")}
                onAction={() => router.push("/order/new")}
              />
            )}

            <Text
              onPress={() => router.push("/orders")}
              style={{
                color: Theme.semantic.accent.primary,
                fontFamily: Theme.fonts.onestBold,
                fontSize: Theme.fontSizes.label,
                textAlign: "center",
                paddingVertical: Theme.spacing.sm,
              }}
            >
              {t("all_orders")}
            </Text>
          </View>
        }
      />
    </Screen>
  )
}

const styles = {
  hero: {
    borderRadius: 26,
    padding: 22,
    gap: 6,
  },
  heroTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  heroLabel: {
    color: "#FFFFFFB3",
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase" as const,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -0.8,
  },
  heroFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 12,
  },
  heroMetric: {
    gap: 0,
  },
  heroMetricValue: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  heroMetricLabel: {
    color: "#FFFFFFB3",
    fontSize: 11,
  },
  heroDivider: {
    width: 1,
    alignSelf: "stretch" as const,
    marginVertical: 2,
  },
}
