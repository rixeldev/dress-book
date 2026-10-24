import { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getOrders } from "@/features/orders/repository"
import type { Order } from "@/interfaces/Order"
import {
  Button,
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

export default function OrdersScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { syncStatus } = useSync()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFailed(false)
    try {
      setOrders(await getOrders(user.uid))
    } catch (error) {
      console.log("Failed to load orders", error)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

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

  const active = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled")
  const closed = orders.filter((order) => order.status === "delivered" || order.status === "cancelled")

  return (
    <Screen padding={0}>
      <FlashList
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 140,
          gap: Theme.spacing.sm,
        }}
        data={[...active, ...closed]}
        keyExtractor={(order) => order.id}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.xs }}>
            <ScreenHeader
              overline={t("studio")}
              title={t("orders")}
              description={t("orders_count", { count: orders.length })}
              right={
                <IconButton
                  icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                  accessibilityLabel={t("new_order")}
                  onPress={() => router.push("/order/new")}
                  variant="primary"
                />
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
            <SectionHeader
              title={t("active_orders")}
              description={t("orders_in_progress")}
              actionLabel={t("new_order")}
              onAction={() => router.push("/order/new")}
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const showClosedHeader = index === active.length && closed.length > 0
          return (
            <View style={{ gap: Theme.spacing.sm }}>
              {showClosedHeader && (
                <SectionHeader
                  title={t("completed")}
                  description={t("all_orders")}
                  style={{ marginTop: Theme.spacing.sm }}
                />
              )}
              <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />
            </View>
          )
        }}
        ListFooterComponent={
          active.length === 0 ? (
            <Text
              style={{
                color: Theme.semantic.text.secondary,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.fontSizes.label,
                textAlign: "center",
                paddingVertical: Theme.spacing.lg,
              }}
            >
              {t("order_empty_desc")}
            </Text>
          ) : null
        }
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
})
