import { useCallback, useEffect, useState } from "react"
import { Alert, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getFabrics, deleteFabric } from "@/features/fabrics/repository"
import type { Fabric } from "@/interfaces/Fabric"
import { Badge, Button, EmptyState, ListRow, Screen, SectionHeader, Skeleton } from "@/components/ui"
import { PackageIcon } from "@/icons/Icons"

export default function LibraryScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setFabrics(await getFabrics(user.uid))
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

  if (fabrics.length === 0) {
    return (
      <Screen padding={0}>
        <EmptyState
          icon={<PackageIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("library_empty_title")}
          description={t("library_empty_desc")}
          actionLabel={t("new_fabric")}
          onAction={() => router.push("/fabric/new")}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlashList
        contentContainerStyle={{ padding: Theme.spacing.md }}
        data={fabrics}
        keyExtractor={(fabric) => fabric.id}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm }}>
            <SectionHeader title={t("library")} description={t("fabrics_count", { count: fabrics.length })} />
            <Button label={t("new_fabric")} onPress={() => router.push("/fabric/new")} variant="secondary" />
          </View>
        }
        renderItem={({ item }) => {
          const lowStock =
            item.quantity !== null &&
            item.lowStockThreshold !== null &&
            item.quantity <= item.lowStockThreshold
          return (
            <>
              <ListRow
                title={item.name}
                description={`${item.supplier ?? t("no_supplier")} · ${item.quantity ?? "—"} ${item.unit}`}
                trailing={
                  lowStock ? <Badge label={t("low_stock")} tone="warning" dot /> : undefined
                }
                onPress={() => router.push(`/fabric/edit?id=${item.id}`)}
              />
              <Button
                label={t("delete")}
                onPress={() => {
                  Alert.alert(t("delete_fabric"), t("delete_fabric_desc"), [
                    { text: t("cancel"), style: "cancel" },
                    {
                      text: t("delete"),
                      style: "destructive",
                      onPress: async () => {
                        if (!user) return
                        await deleteFabric(user.uid, item.id)
                        await load()
                      },
                    },
                  ])
                }}
                variant="ghost"
              />
            </>
          )
        }}
      />
    </Screen>
  )
}
