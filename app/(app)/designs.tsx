import { useCallback, useEffect, useState } from "react"
import { Text, View } from "react-native"
import { Image } from "expo-image"
import { FlashList } from "@shopify/flash-list"

import * as ImagePicker from "expo-image-picker"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getDesigns, deleteDesign } from "@/features/designs/repository"
import type { Design } from "@/interfaces/Design"
import { Button, EmptyState, Screen, SectionHeader, Skeleton } from "@/components/ui"
import { PackageIcon } from "@/icons/Icons"

export default function DesignsScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setDesigns(await getDesigns(user.uid))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    if (!user) return
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (result.canceled) return

    const uris = result.assets.map((asset) => asset.uri)
    await (async () => {
      const { createDesign } = await import("@/features/designs/repository")
      await createDesign(user.uid, {
        title: t("design_untitled"),
        tags: [],
        notes: null,
        orderId: null,
        imageUris: uris,
      })
      await load()
    })()
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="42%" height={26} />
          <Skeleton height={120} radius={Theme.radius.card} />
          <Skeleton height={120} radius={Theme.radius.card} />
        </View>
      </Screen>
    )
  }

  if (designs.length === 0) {
    return (
      <Screen padding={0}>
        <EmptyState
          icon={<PackageIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("designs_empty_title")}
          description={t("designs_empty_desc")}
          actionLabel={t("add_design")}
          onAction={handleAdd}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlashList
        contentContainerStyle={{ padding: Theme.spacing.md }}
        data={designs}
        keyExtractor={(design) => design.id}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm }}>
            <SectionHeader title={t("designs")} description={t("designs_count", { count: designs.length })} />
            <Button label={t("add_design")} onPress={handleAdd} variant="secondary" />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              borderRadius: Theme.radius.card,
              backgroundColor: Theme.semantic.bg.surface,
              borderWidth: 1,
              borderColor: Theme.semantic.border.subtle,
              overflow: "hidden",
              marginBottom: Theme.spacing.sm,
            }}
          >
            {item.imageUrls[0] && (
              <Image source={{ uri: item.imageUrls[0] }} style={{ width: "100%", height: 180 }} contentFit="cover" cachePolicy="memory-disk" />
            )}
            <View style={{ padding: Theme.spacing.md, gap: 4 }}>
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.body }}>
                {item.title}
              </Text>
              <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
                {item.tags.join(", ") || t("no_tags")}
              </Text>
              <Button
                label={t("delete")}
                onPress={async () => {
                  if (!user) return
                  await deleteDesign(user.uid, item)
                  await load()
                }}
                variant="ghost"
              />
            </View>
          </View>
        )}
      />
    </Screen>
  )
}
