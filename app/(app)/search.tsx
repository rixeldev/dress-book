import { useEffect, useMemo, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import Fuse from "fuse.js"
import { useTranslation } from "react-i18next"
import { BackIcon, SearchIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClients } from "@/features/clients/repository"
import { getOrders } from "@/features/orders/repository"
import type { Client } from "@/interfaces/Client"
import type { Order } from "@/interfaces/Order"
import { EmptyState, Screen, SectionHeader } from "@/components/ui"
import { TextField } from "@/components/ui/TextField"

interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: "client" | "order"
}

export default function SearchScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
        subtitle: `${order.clientName} · ${order.status}`,
        type: "order" as const,
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
    if (result.type === "client") router.push(`/client/${result.id}`)
    else router.push(`/order/${result.id}`)
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("search"),
          headerLeft: () => <BackIcon color={Theme.colors.text} size={24} onPress={() => router.back()} />,
        }}
      />
      <View style={{ padding: Theme.spacing.lg, gap: Theme.spacing.md, flex: 1 }}>
        <TextField
          label={t("search")}
          value={query}
          onChangeText={setQuery}
          placeholder={t("search_placeholder")}
          autoFocus
        />
        {loading ? (
          <View style={{ gap: Theme.spacing.sm }}>
            <View style={{ height: 18, width: "45%", borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
            <View style={{ height: 56, borderRadius: 12, backgroundColor: Theme.colors.background2 }} />
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon color={Theme.semantic.accent.primary} size={30} />}
            title={query.trim() ? t("search_no_results") : t("search_start")}
            description={query.trim() ? t("search_no_results_desc") : t("search_start_desc")}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(result) => `${result.type}-${result.id}`}
            ListHeaderComponent={<SectionHeader title={t("search_results")} description={t("search_results_count", { count: results.length })} />}
            renderItem={({ item }) => (
              <View style={{ marginTop: Theme.spacing.sm }}>
                <View
                  style={{
                    borderRadius: Theme.radius.card,
                    backgroundColor: Theme.semantic.bg.surface,
                    borderWidth: 1,
                    borderColor: Theme.semantic.border.subtle,
                    padding: Theme.spacing.md,
                  }}
                >
                  <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.body }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
                    {item.subtitle}
                  </Text>
                  <Text
                    onPress={() => handleOpen(item)}
                    style={{ color: Theme.semantic.accent.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label, marginTop: Theme.spacing.xs }}
                  >
                    {t("open")}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  )
}
