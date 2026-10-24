import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getFabrics, updateFabric } from "@/features/fabrics/repository"
import { fabricSchema } from "@/libs/schemas"
import {
  Button,
  Card,
  Chip,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  TextField,
} from "@/components/ui"

export default function EditFabricScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [name, setName] = useState("")
  const [supplier, setSupplier] = useState("")
  const [sku, setSku] = useState("")
  const [color, setColor] = useState("")
  const [composition, setComposition] = useState("")
  const [width, setWidth] = useState("")
  const [unit, setUnit] = useState<"m" | "yd">("m")
  const [quantity, setQuantity] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState("")
  const [cost, setCost] = useState("")
  const [location, setLocation] = useState("")
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
        setColor(fabric.color ?? "")
        setComposition(fabric.composition ?? "")
        setWidth(fabric.width === null ? "" : String(fabric.width))
        setUnit(fabric.unit)
        setQuantity(fabric.quantity === null ? "" : String(fabric.quantity))
        setLowStockThreshold(
          fabric.lowStockThreshold === null ? "" : String(fabric.lowStockThreshold),
        )
        setCost(fabric.cost === null ? "" : String(fabric.cost))
        setLocation(fabric.location ?? "")
      })
      .finally(() => setLoading(false))
  }, [user, params.id])

  if (!user) return null

  const handleSave = async () => {
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
      photoUrl: null,
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
          <ScreenHeader overline={t("library")} title={t("edit_fabric")} />

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
                <TextField label={t("sku")} value={sku} onChangeText={setSku} />
                <TextField label={t("color")} value={color} onChangeText={setColor} />
                <TextField
                  label={t("composition")}
                  value={composition}
                  onChangeText={setComposition}
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
                <View style={styles.pair}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("quantity")}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("low_stock_threshold")}
                      value={lowStockThreshold}
                      onChangeText={setLowStockThreshold}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <TextField
                  label={t("location")}
                  value={location}
                  onChangeText={setLocation}
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
            loading={saving}
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
})
