import { useEffect, useMemo, useState } from "react"
import { Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router, Stack } from "expo-router"
import Fuse from "fuse.js"
import { useTranslation } from "react-i18next"
import { ListIcon, SearchIcon, UsersIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"
import { getClients } from "@/features/clients/repository"
import { getOrders } from "@/features/orders/repository"
import type { Client } from "@/interfaces/Client"
import type { Order } from "@/interfaces/Order"
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  ListRow,
  Screen,
  Skeleton,
  TextField,
} from "@/components/ui"

interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: "client" | "order"
  status?: string
}

export default function SearchScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { getItem, setItem } = useStorage()
  const [query, setQuery] = useState("")
  const [recent, setRecent] = useState<string[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getItem("recent_searches").then((raw) => {
      if (raw) setRecent(JSON.parse(raw))
    })
  }, [getItem])

  useEffect(() => {
    if (!user) return
    Promise.all([getClients(user.uid), getOrders(user.uid)])
      .then(([loadedClients, loadedOrders]) => {
        setClients(loadedClients)
        setOrders(loadedOrders)
      })
      .finally(() => setLoading(false))
  }, [user])

  const fuse = useMemo(() => {
    const items: SearchResult[] = [
      ...clients.map((client) => ({
        id: client.id,
        title: client.name,
        subtitle: client.phone ?? client.email ?? t("client_no_contact"),
        type: "client" as const,
      })),
      ...orders.map((order) => ({
        id: order.id,
        title: order.title,
        subtitle: `${order.clientName} · ${t(order.status)}`,
        type: "order" as const,
        status: order.status,
      })),
    ]

    return new Fuse(items, {
      keys: ["title", "subtitle"],
      threshold: 0.35,
      ignoreLocation: true,
    })
  }, [clients, orders, t])

  const results = query.trim() ? fuse.search(query).map((result) => result.item) : []

  const handleOpen = (result: SearchResult) => {
    if (query.trim()) {
      const next = [query.trim(), ...recent.filter((q) => q !== query.trim())].slice(0, 8)
      setRecent(next)
      setItem("recent_searches", JSON.stringify(next))
    }
    if (result.type === "client") router.push(`/client/${result.id}`)
    else router.push(`/order/${result.id}`)
  }

  return (
    <Screen padding={0}>
      <Stack.Screen options={{ headerTitle: t("search") }} />
      <View
        style={{
          paddingHorizontal: Theme.spacing.gutter,
          paddingTop: Theme.spacing.lg,
          flex: 1,
          gap: Theme.spacing.md,
        }}
      >
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={t("search_placeholder")}
          autoFocus
          autoCorrect={false}
          leftIcon={<SearchIcon size={18} color={Theme.semantic.text.secondary} />}
        />

        {loading ? (
          <View style={{ gap: Theme.spacing.sm }}>
            <Skeleton width="45%" height={20} />
            <Skeleton height={64} radius={18} />
            <Skeleton height={64} radius={18} />
          </View>
        ) : results.length === 0 ? (
          query.trim() || recent.length === 0 ? (
            <EmptyState
              icon={<SearchIcon color={Theme.semantic.accent.primary} size={30} />}
              title={query.trim() ? t("search_no_results") : t("search_start")}
              description={query.trim() ? t("search_no_results_desc") : t("search_start_desc")}
            />
          ) : (
            <View style={{ gap: Theme.spacing.sm }}>
              <Text
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onestBold,
                  fontSize: Theme.fontSizes.caption,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {t("recent_searches")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                {recent.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onPress={() => setQuery(item)}
                  />
                ))}
              </View>
            </View>
          )
        ) : (
          <FlashList
            data={results}
            keyExtractor={(result) => `${result.type}-${result.id}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.xs }} />}
            ListHeaderComponent={
              <View style={{ marginBottom: Theme.spacing.xs }}>
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onestBold,
                    fontSize: Theme.fontSizes.caption,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {t("search_results_count", { count: results.length })}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
                <ListRow
                  title={item.title}
                  description={item.subtitle}
                  divider={false}
                  chevron
                  onPress={() => handleOpen(item)}
                  leading={
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 12,
                        backgroundColor: Theme.semantic.accent.soft,
                      }}
                    >
                      {item.type === "client" ? (
                        <UsersIcon size={18} color={Theme.semantic.accent.primary} />
                      ) : (
                        <ListIcon size={18} color={Theme.semantic.accent.primary} />
                      )}
                    </View>
                  }
                  trailing={
                    <Badge
                      label={item.type === "client" ? t("clients") : t("orders")}
                      tone="neutral"
                    />
                  }
                />
              </Card>
            )}
          />
        )}
      </View>
    </Screen>
  )
}
