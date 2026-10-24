import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshControl, StyleSheet, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useOrganization, useEffectiveOwnerId } from "@/contexts/OrganizationContext"
import { getOrders } from "@/features/orders/repository"
import type { Order } from "@/interfaces/Order"
import {
  Button,
  Chip,
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
import { ListIcon, PlusIcon } from "@/icons/Icons"
import { router } from "expo-router"

type StatusFilter = "all" | "active" | "completed"
type SortKey = "due" | "created" | "priority"

const priorityRank: Record<Order["priority"], number> = { high: 0, normal: 1, low: 2 }

export default function OrdersScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const org = useOrganization()
  const ownerId = useEffectiveOwnerId()
  const { syncStatus } = useSync()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortKey>("due")

  const load = useCallback(async () => {
    if (!ownerId) return
    setFailed(false)
    try {
      setOrders(await getOrders(ownerId))
    } catch (error) {
      console.log("Failed to load orders", error)
      setFailed(true)
    }
  }, [ownerId])

  useEffect(() => {
    if (!ownerId) return
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [ownerId, load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const activeCount = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  ).length
  const completedCount = orders.length - activeCount

  const filtered = useMemo(() => {
    let list = [...orders]
    if (statusFilter === "active") {
      list = list.filter((order) => order.status !== "delivered" && order.status !== "cancelled")
    } else if (statusFilter === "completed") {
      list = list.filter((order) => order.status === "delivered" || order.status === "cancelled")
    }

    list.sort((a, b) => {
      if (sortBy === "due") {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      }
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return priorityRank[a.priority] - priorityRank[b.priority]
    })

    return list
  }, [orders, statusFilter, sortBy])

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="52%" height={38} />
          <Skeleton height={110} radius={20} />
          <Skeleton height={110} radius={20} />
        </View>
      </Screen>
    )
  }

  if (failed) {
    return (
      <Screen padding={0}>
        <EmptyState
          icon={<ListIcon color={Theme.semantic.state.danger} size={30} />}
          title={t("orders_load_error_title")}
          description={t("orders_load_error_desc")}
          actionLabel={t("try_again")}
          onAction={load}
        />
      </Screen>
    )
  }

  if (orders.length === 0) {
    return (
      <Screen padding={0}>
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
          <ScreenHeader overline={t("studio")} title={t("orders")} />
        </View>
        <EmptyState
          icon={<ListIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("orders_empty_title")}
          description={t("orders_empty_desc")}
          actionLabel={t("new_order")}
          onAction={() => router.push("/order/new")}
          actionVariant="primary"
        />
        <View style={{ padding: Theme.spacing.gutter }}>
          <Button
            label={t("calendar")}
            onPress={() => router.push("/calendar")}
            variant="secondary"
            fullWidth
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlashList
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 140,
        }}
        data={filtered}
        keyExtractor={(order) => order.id}
        ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.semantic.accent.primary}
            colors={[Theme.semantic.accent.primary]}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.sm }}>
            <ScreenHeader
              overline={t("studio")}
              title={t("orders")}
              description={t("orders_count", { count: orders.length })}
              right={
                org.readOnly ? null : (
                  <IconButton
                    icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                    accessibilityLabel={t("new_order")}
                    onPress={() => router.push("/order/new")}
                    variant="primary"
                  />
                )
              }
            />
            <View style={styles.toolbar}>
              <SyncPill status={syncStatus} />
              <Button
                label={t("calendar")}
                onPress={() => router.push("/calendar")}
                size="sm"
                variant="secondary"
              />
            </View>

            <View style={{ gap: Theme.spacing.xs }}>
              <Text
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onestBold,
                  fontSize: Theme.fontSizes.caption,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {t("filter")}
              </Text>
              <View style={styles.chipRow}>
                {(["all", "active", "completed"] as const).map((option) => (
                  <Chip
                    key={option}
                    label={
                      option === "all"
                        ? t("all")
                        : option === "active"
                          ? `${t("active")} (${activeCount})`
                          : `${t("completed")} (${completedCount})`
                    }
                    selected={statusFilter === option}
                    onPress={() => setStatusFilter(option)}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: Theme.spacing.xs }}>
              <Text
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onestBold,
                  fontSize: Theme.fontSizes.caption,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {t("sort_by")}
              </Text>
              <View style={styles.chipRow}>
                {(["due", "created", "priority"] as const).map((option) => (
                  <Chip
                    key={option}
                    label={t(`sort_${option}`)}
                    selected={sortBy === option}
                    onPress={() => setSortBy(option)}
                  />
                ))}
              </View>
            </View>

            <SectionHeader
              title={t("active_orders")}
              description={t("orders_in_progress")}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<ListIcon color={Theme.semantic.accent.primary} size={30} />}
            title={t("no_orders_for_filter")}
            description={t("try_different_filter")}
            actionLabel={t("new_order")}
            onAction={() => router.push("/order/new")}
            actionVariant="primary"
          />
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
})
