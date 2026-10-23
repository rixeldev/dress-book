import { useCallback, useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClients } from "@/features/clients/repository"
import type { Client } from "@/interfaces/Client"
import { EmptyState, ListRow, Screen, SectionHeader, Skeleton } from "@/components/ui"
import { UsersIcon } from "@/icons/Icons"

export default function ClientsScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

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

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="42%" height={26} />
          <Skeleton height={72} radius={Theme.radius.card} />
          <Skeleton height={72} radius={Theme.radius.card} />
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
        <EmptyState
          icon={<UsersIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("clients_empty_title")}
          description={t("clients_empty_desc")}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlatList
        contentContainerStyle={{ padding: Theme.spacing.md }}
        data={clients}
        keyExtractor={(client) => client.id}
        ListHeaderComponent={
          <SectionHeader
            title={t("clients")}
            description={t("clients_count", { count: clients.length })}
            style={{ marginBottom: Theme.spacing.sm }}
          />
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            description={item.phone ?? item.email ?? t("client_no_contact")}
            leading={
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: Theme.radius.pill,
                  backgroundColor: Theme.colors.primary2,
                }}
              >
                <Text
                  style={{
                    color: Theme.semantic.accent.primary,
                    fontFamily: Theme.fonts.onestBold,
                    fontSize: Theme.fontSizes.label,
                  }}
                >
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            }
          />
        )}
      />
    </Screen>
  )
}
