import { useEffect, useState } from "react"
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getFabrics, updateFabric } from "@/features/fabrics/repository"
import { fabricSchema } from "@/libs/schemas"
import * as ImagePicker from "expo-image-picker"
import { ref, uploadBytesResumable, getDownloadURL } from "@react-native-firebase/storage"
import { storage } from "@/db/firebaseConfig"
import {
  Button,
  Card,
  Chip,
  IconButton,
  Screen,
  SectionHeader,
  Select,
  Skeleton,
  TextField,
} from "@/components/ui"

const COMPOSITION_OPTIONS = [
  { value: "Cotton", key: "cotton" },
  { value: "Polyester", key: "polyester" },
  { value: "Wool", key: "wool" },
  { value: "Linen", key: "linen" },
  { value: "Cotton/Polyester blend", key: "cotton_polyester_blend" },
  { value: "Wool blend", key: "wool_blend" },
  { value: "Mixed blend", key: "mixed_blend" },
]

const COLOR_SWATCHES = [
  "#F5EFE6",
  "#D9C7A8",
  "#B98A4B",
  "#6E2A38",
  "#2F6B4F",
  "#1E1719",
  "#A3322C",
  "#4A6FA5",
  "#7B6B60",
  "#FFFFFF",
  "#000000",
  "#C98A2E",
]

export default function EditFabricScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [name, setName] = useState("")
  const [supplier, setSupplier] = useState("")
  const [sku, setSku] = useState("")
  const [color, setColor] = useState(COLOR_SWATCHES[0])
  const [composition, setComposition] = useState(COMPOSITION_OPTIONS[0].value)
  const [width, setWidth] = useState("")
  const [unit, setUnit] = useState<"m" | "yd">("m")
  const [quantity, setQuantity] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState("")
  const [cost, setCost] = useState("")
  const [location, setLocation] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoLocal, setPhotoLocal] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || !params.id) return
    getFabrics(user.uid)
      .then((fabrics) => {
        const fabric = fabrics.find((item) => item.id === params.id)
        if (!fabric) return
        setName(fabric.name)
        setSupplier(fabric.supplier ?? "")
        setSku(fabric.sku ?? "")
        setColor(fabric.color ?? COLOR_SWATCHES[0])
        setComposition(fabric.composition ?? COMPOSITION_OPTIONS[0].value)
        setWidth(fabric.width === null ? "" : String(fabric.width))
        setUnit(fabric.unit)
        setQuantity(fabric.quantity === null ? "" : String(fabric.quantity))
        setLowStockThreshold(
          fabric.lowStockThreshold === null ? "" : String(fabric.lowStockThreshold),
        )
        setCost(fabric.cost === null ? "" : String(fabric.cost))
        setLocation(fabric.location ?? "")
        setPhotoUrl(fabric.photoUrl ?? null)
      })
      .finally(() => setLoading(false))
  }, [user, params.id])

  if (!user) return null

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })
    if (result.canceled) return
    setPhotoLocal(result.assets[0].uri)
  }

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    if (!user) return null
    setUploading(true)
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      const storageRef = ref(storage, `Fabrics/${user.uid}/${Date.now()}`)
      const task = uploadBytesResumable(storageRef, blob)
      await new Promise<void>((resolve, reject) => {
        task.on("state_changed", null, reject, () => resolve())
      })
      const url = await getDownloadURL(task.snapshot!.ref)
      setPhotoUrl(url)
      return url
    } catch (error) {
      console.log("Fabric photo upload failed", error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    let finalPhotoUrl = photoUrl
    if (photoLocal && !photoUrl) {
      finalPhotoUrl = await uploadPhoto(photoLocal)
    } else if (photoLocal) {
      finalPhotoUrl = await uploadPhoto(photoLocal)
    }

    const result = fabricSchema.safeParse({
      name,
      supplier: supplier || null,
      sku: sku || null,
      color: color || null,
      composition: composition || null,
      width: width ? Number(width) : null,
      unit,
      quantity: quantity ? Number(quantity) : null,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : null,
      cost: cost ? Number(cost) : null,
      location: location || null,
      photoUrl: finalPhotoUrl,
    })

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        nextErrors[issue.path.join(".") || "form"] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setErrors({})
    try {
      await updateFabric(user.uid, params.id, {
        name: result.data.name,
        supplier: result.data.supplier ?? null,
        sku: result.data.sku ?? null,
        color: result.data.color ?? null,
        composition: result.data.composition ?? null,
        width: result.data.width ?? null,
        unit: result.data.unit,
        quantity: result.data.quantity ?? null,
        lowStockThreshold: result.data.lowStockThreshold ?? null,
        cost: result.data.cost ?? null,
        location: result.data.location ?? null,
        photoUrl: result.data.photoUrl ?? null,
      })
      router.back()
    } catch (error) {
      console.log("Failed to update fabric", error)
      setErrors({ form: t("fabric_save_error") })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerTitle: t("edit_fabric") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="50%" height={38} />
          <Skeleton height={64} radius={18} />
        </View>
      </Screen>
    )
  }

  const previewUri = photoLocal || photoUrl

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("edit_fabric"),
          headerLeft: () => (
            <IconButton
              icon={<BackIcon color={Theme.semantic.text.primary} size={24} />}
              onPress={() => router.back()}
              accessibilityLabel={t("back")}
            />
          ),
          headerRight: () => null,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: Theme.spacing.gutter,
            paddingBottom: 40,
            gap: Theme.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("identity")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("fabric_name")}
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                />
                <TextField label={t("supplier")} value={supplier} onChangeText={setSupplier} />
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>{t("sku")}</Text>
                  <Text style={styles.readonlyValue}>{sku}</Text>
                </View>
                <Select
                  label={t("composition")}
                  value={composition}
                  options={COMPOSITION_OPTIONS.map((option) => ({
                    label: t(`fabric_composition_${option.key}`),
                    value: option.value,
                  }))}
                  onChange={setComposition}
                />
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("color")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <View style={styles.swatchGrid}>
                  {COLOR_SWATCHES.map((swatch) => (
                    <Pressable
                      key={swatch}
                      onPress={() => setColor(swatch)}
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: swatch,
                          borderColor:
                            color === swatch
                              ? Theme.semantic.accent.primary
                              : Theme.semantic.border.subtle,
                          borderWidth: color === swatch ? 2.5 : 1,
                        },
                      ]}
                    />
                  ))}
                </View>
                <TextField
                  label={t("custom_color_hex")}
                  value={color}
                  onChangeText={setColor}
                  autoCapitalize="characters"
                />
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("specs")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <View style={styles.pair}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("width")}
                      value={width}
                      onChangeText={setWidth}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ gap: 6 }}>
                      <Text
                        style={{
                          color: Theme.semantic.text.secondary,
                          fontFamily: Theme.fonts.onestBold,
                          fontSize: Theme.fontSizes.caption,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("unit")}
                      </Text>
                      <View style={{ flexDirection: "row", gap: Theme.spacing.xs }}>
                        {(["m", "yd"] as const).map((option) => (
                          <Chip
                            key={option}
                            label={option}
                            selected={unit === option}
                            onPress={() => setUnit(option)}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                <TextField
                  label={t("cost")}
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="decimal-pad"
                />
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("inventory")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("quantity")}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
                <TextField
                  label={t("low_stock_threshold")}
                  value={lowStockThreshold}
                  onChangeText={setLowStockThreshold}
                  keyboardType="decimal-pad"
                />
                <TextField
                  label={t("location")}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("photo")} />
            <Card>
              <View style={{ gap: Theme.spacing.md, alignItems: "center" }}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.photoPreview} />
                ) : (
                  <View
                    style={[
                      styles.photoPlaceholder,
                      { backgroundColor: Theme.semantic.bg.sunken },
                    ]}
                  >
                    <Text
                      style={{
                        color: Theme.semantic.text.tertiary,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.label,
                      }}
                    >
                      {t("no_photo")}
                    </Text>
                  </View>
                )}
                <Button
                  label={uploading ? t("uploading") : t("change_photo")}
                  onPress={pickPhoto}
                  variant="secondary"
                  loading={uploading}
                  fullWidth
                />
              </View>
            </Card>
          </View>

          {errors.form && (
            <Text
              style={{
                color: Theme.semantic.state.danger,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.fontSizes.label,
              }}
            >
              {errors.form}
            </Text>
          )}

          <Button
            label={t("save_fabric")}
            onPress={handleSave}
            loading={saving || uploading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  pair: {
    flexDirection: "row",
    gap: 12,
  },
  readonlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  readonlyLabel: {
    color: "#7B6B60",
    fontFamily: "OnestBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  readonlyValue: {
    color: "#191411",
    fontFamily: "OnestBold",
    fontSize: 14,
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
})
