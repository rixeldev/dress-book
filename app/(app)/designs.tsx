import { useCallback, useEffect, useState } from "react"
import { Alert, Image, Pressable, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Stack } from "expo-router"

import * as ImagePicker from "expo-image-picker"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getDesigns, deleteDesign } from "@/features/designs/repository"
import type { Design } from "@/interfaces/Design"
import {
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  Skeleton,
} from "@/components/ui"
import { ImageIcon, PlusIcon, TrashIcon } from "@/icons/Icons"

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
    const { createDesign } = await import("@/features/designs/repository")
    await createDesign(user.uid, {
      title: t("design_untitled"),
      tags: [],
      notes: null,
      orderId: null,
      imageUris: uris,
    })
    await load()
  }

  const confirmDelete = (design: Design) => {
    Alert.alert(t("delete_design"), t("delete_design_desc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          if (!user) return
          await deleteDesign(user.uid, design)
          await load()
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerTitle: t("designs") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="46%" height={38} />
          <Skeleton height={180} radius={20} />
          <Skeleton height={180} radius={20} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <Stack.Screen options={{ headerTitle: t("designs") }} />
      <FlashList
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 120,
        }}
        data={designs}
        numColumns={2}
        keyExtractor={(design) => design.id}
        ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.sm }} />}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
            <ScreenHeader
              overline={t("studio")}
              title={t("designs")}
              description={t("designs_count", { count: designs.length })}
              right={
                <IconButton
                  icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                  accessibilityLabel={t("add_design")}
                  onPress={handleAdd}
                  variant="primary"
                />
              }
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<ImageIcon color={Theme.semantic.accent.primary} size={30} />}
            title={t("designs_empty_title")}
            description={t("designs_empty_desc")}
            actionLabel={t("add_design")}
            onAction={handleAdd}
            actionVariant="primary"
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.tile,
              {
                backgroundColor: Theme.semantic.bg.surface,
                borderColor: Theme.semantic.border.subtle,
              },
              Theme.elevation.card,
            ]}
          >
            <Pressable
              onPress={() => confirmDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={t("delete_design")}
              hitSlop={8}
              style={[
                styles.deleteButton,
                {
                  backgroundColor: Theme.semantic.bg.surface,
                  borderColor: Theme.semantic.border.subtle,
                },
              ]}
            >
              <TrashIcon size={14} color={Theme.semantic.state.danger} />
            </Pressable>

            {item.imageUrls[0] ? (
              <Image
                source={{ uri: item.imageUrls[0] }}
                style={{ width: "100%" as any, height: 170 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.tilePlaceholder,
                  { backgroundColor: Theme.semantic.bg.sunken },
                ]}
              >
                <ImageIcon size={26} color={Theme.semantic.text.tertiary} />
              </View>
            )}

            <View style={styles.tileCopy}>
              <Text
                numberOfLines={1}
                style={{
                  color: Theme.semantic.text.primary,
                  fontFamily: Theme.fonts.onestBold,
                  fontSize: Theme.fontSizes.label,
                }}
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onest,
                  fontSize: Theme.fontSizes.caption,
                }}
              >
                {item.tags.join(", ") || t("no_tags")}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  )
}

const styles = {
  tile: {
    flex: 1,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderRadius: 20,
  },
  tileImage: {
    width: "100%" as any,
    height: 170,
  },
  tilePlaceholder: {
    alignSelf: "stretch" as const,
    height: 170,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  tileCopy: {
    gap: 2,
    padding: 12,
  },
  deleteButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    zIndex: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 999,
  },
}
