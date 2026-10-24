import { useCallback, useEffect, useState } from "react"
import { RefreshControl, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClients } from "@/features/clients/repository"
import type { Client } from "@/interfaces/Client"
import {
  Card,
  EmptyState,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  Skeleton,
  SyncPill,
} from "@/components/ui"
import { useSync } from "@/contexts/SyncContext"
import { PlusIcon, UsersIcon } from "@/icons/Icons"

export default function ClientsScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { syncStatus } = useSync()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFailed(false)
    try {
      setClients(await getClients(user.uid))
    } catch (error) {
      console.log("Failed to load clients", error)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="52%" height={38} />
          <Skeleton height={84} radius={20} />
          <Skeleton height={84} radius={20} />
        </View>
      </Screen>
    )
  }

  if (failed) {
    return (
      <Screen padding={0}>
        <EmptyState
          icon={<UsersIcon color={Theme.semantic.state.danger} size={30} />}
          title={t("clients_load_error_title")}
          description={t("clients_load_error_desc")}
          actionLabel={t("try_again")}
          onAction={load}
        />
      </Screen>
    )
  }

  if (clients.length === 0) {
    return (
      <Screen padding={0}>
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
          <ScreenHeader overline={t("studio")} title={t("clients")} />
        </View>
        <EmptyState
          icon={<UsersIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("clients_empty_title")}
          description={t("clients_empty_desc")}
          actionLabel={t("new_client")}
          onAction={() => router.push("/client/new")}
          actionVariant="primary"
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlashList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.semantic.accent.primary}
            colors={[Theme.semantic.accent.primary]}
          />
        }
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 140,
        }}
        data={clients}
        keyExtractor={(client) => client.id}
        ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.xs }} />}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
            <ScreenHeader
              overline={t("studio")}
              title={t("clients")}
              description={t("clients_count", { count: clients.length })}
              right={
                <IconButton
                  icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                  accessibilityLabel={t("new_client")}
                  onPress={() => router.push("/client/new")}
                  variant="primary"
                />
              }
            />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <SyncPill status={syncStatus} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
            <ListRow
              title={item.name}
              description={item.phone ?? item.email ?? t("client_no_contact")}
              divider={false}
              chevron
              onPress={() => router.push(`/client/${item.id}`)}
              leading={
                <View
                  style={{
                    width: 42,
                    height: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    backgroundColor: Theme.semantic.accent.soft,
                  }}
                >
                  <Text
                    style={{
                      color: Theme.semantic.accent.primary,
                      fontFamily: Theme.fonts.display,
                      fontSize: 18,
                    }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              }
            />
          </Card>
        )}
      />
    </Screen>
  )
}
