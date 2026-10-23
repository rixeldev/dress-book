import { useCallback, useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getOrders } from "@/features/orders/repository"
import type { Order } from "@/interfaces/Order"
import { Button, EmptyState, ListRow, Screen, SectionHeader, Skeleton } from "@/components/ui"
import { ListIcon } from "@/icons/Icons"
import { router } from "expo-router"
import { formatMoney } from "@/libs/money"
import { formatIsoDate } from "@/libs/dates"

export default function OrdersScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
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
          <Skeleton width="42%" height={26} />
          <Skeleton height={92} radius={Theme.radius.card} />
          <Skeleton height={92} radius={Theme.radius.card} />
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
        <EmptyState
          icon={<ListIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("orders_empty_title")}
          description={t("orders_empty_desc")}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlatList
        contentContainerStyle={{ padding: Theme.spacing.md }}
        data={orders}
        keyExtractor={(order) => order.id}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm }}>
            <SectionHeader
              title={t("orders")}
              description={t("orders_count", { count: orders.length })}
            />
            <Button label={t("new_order")} onPress={() => router.push("/order/new")} variant="secondary" />
          </View>
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            description={
              item.dueDate
                ? `${t("due")} ${formatIsoDate(item.dueDate)} · ${formatMoney(item.price, item.currency as "USD" | "EUR" | "GBP")}`
                : `${t("no_deadline")} · ${formatMoney(item.price, item.currency as "USD" | "EUR" | "GBP")}`
            }
            trailing={
              <View
                style={{
                  borderRadius: Theme.radius.pill,
                  backgroundColor: Theme.colors.primary2,
                  paddingHorizontal: Theme.spacing.sm,
                  paddingVertical: Theme.spacing.xxs,
                }}
              >
                <Text
                  style={{
                    color: Theme.semantic.accent.primary,
                    fontFamily: Theme.fonts.onestBold,
                    fontSize: Theme.fontSizes.caption,
                  }}
                >
                  {t(item.status)}
                </Text>
              </View>
            }
          />
        )}
      />
    </Screen>
  )
}
