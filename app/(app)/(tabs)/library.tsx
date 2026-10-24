import { useCallback, useEffect, useState } from "react"
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getFabrics, deleteFabric } from "@/features/fabrics/repository"
import type { Fabric } from "@/interfaces/Fabric"
import {
  Badge,
  Card,
  EmptyState,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
} from "@/components/ui"
import { ImageIcon, PackageIcon, PlusIcon, TrashIcon } from "@/icons/Icons"

export default function LibraryScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setFabrics(await getFabrics(user.uid))
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

  const confirmDelete = (fabric: Fabric) => {
    Alert.alert(t("delete_fabric"), t("delete_fabric_desc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          if (!user) return
          await deleteFabric(user.uid, fabric.id)
          await load()
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="46%" height={38} />
          <Skeleton height={86} radius={20} />
          <Skeleton height={86} radius={20} />
        </View>
      </Screen>
    )
  }

  const designsShortcut = (
    <Card onPress={() => router.push("/designs")} style={styles.designsCard}>
      <View
        style={[
          styles.designsIcon,
          {
            backgroundColor: Theme.semantic.accent.soft,
          },
        ]}
      >
        <ImageIcon size={20} color={Theme.semantic.accent.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: Theme.semantic.text.primary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.body,
          }}
        >
          {t("designs")}
        </Text>
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.label,
          }}
        >
          {t("designs_empty_desc")}
        </Text>
      </View>
      <Text
        style={{
          color: Theme.semantic.accent.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.label,
        }}
      >
        {t("view_all")}
      </Text>
    </Card>
  )

  if (fabrics.length === 0) {
    return (
      <Screen padding={0}>
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
          <ScreenHeader
            overline={t("studio")}
            title={t("library")}
            description={t("library_empty_desc")}
            right={
              <IconButton
                icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                accessibilityLabel={t("new_fabric")}
                onPress={() => router.push("/fabric/new")}
                variant="primary"
              />
            }
          />
        </View>
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
          {designsShortcut}
        </View>
        <EmptyState
          icon={<PackageIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("library_empty_title")}
          description={t("library_empty_desc")}
          actionLabel={t("new_fabric")}
          onAction={() => router.push("/fabric/new")}
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
        data={fabrics}
        keyExtractor={(fabric) => fabric.id}
        ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.xs }} />}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
            <ScreenHeader
              overline={t("studio")}
              title={t("library")}
              description={t("fabrics_count", { count: fabrics.length })}
              right={
                <IconButton
                  icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                  accessibilityLabel={t("new_fabric")}
                  onPress={() => router.push("/fabric/new")}
                  variant="primary"
                />
              }
            />
            {designsShortcut}
            <SectionHeader title={t("fabrics")} />
          </View>
        }
        renderItem={({ item }) => {
          const lowStock =
            item.quantity !== null &&
            item.lowStockThreshold !== null &&
            item.quantity <= item.lowStockThreshold

          const meta = [item.supplier, item.color, item.composition].filter(Boolean).join(" · ")
          const quantity =
            item.quantity === null ? t("no_quantity") : `${item.quantity} ${item.unit}`

          return (
            <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
              <ListRow
                title={item.name}
                description={meta || t("no_supplier")}
                divider={false}
                onPress={() => router.push(`/fabric/edit?id=${item.id}`)}
                chevron
                leading={
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor:
                          item.color && item.color.startsWith("#")
                            ? item.color
                            : Theme.semantic.accent.soft,
                        borderColor: Theme.semantic.border.subtle,
                      },
                    ]}
                  >
                    {(!item.color || !item.color.startsWith("#")) && (
                      <PackageIcon size={16} color={Theme.semantic.accent.primary} />
                    )}
                  </View>
                }
                trailing={
                  <View style={styles.trailing}>
                    <Text
                      style={{
                        color: Theme.semantic.text.primary,
                        fontFamily: Theme.fonts.onestBold,
                        fontSize: Theme.fontSizes.label,
                      }}
                    >
                      {quantity}
                    </Text>
                    {lowStock && <Badge label={t("low_stock")} tone="warning" dot />}
                  </View>
                }
              />
              <View
                style={[
                  styles.rowActions,
                  { borderTopColor: Theme.semantic.border.subtle },
                ]}
              >
                <IconButton
                  icon={<TrashIcon size={18} color={Theme.semantic.state.danger} />}
                  onPress={() => confirmDelete(item)}
                  accessibilityLabel={t("delete_fabric")}
                  size="sm"
                />
                <Text
                  style={{
                    color: Theme.semantic.text.tertiary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.caption,
                  }}
                >
                  {t("tap_to_edit")}
                </Text>
              </View>
            </Card>
          )
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  designsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  designsIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  swatch: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
})
