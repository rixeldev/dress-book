import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClients } from "@/features/clients/repository"
import { createOrder } from "@/features/orders/repository"
import type { Client } from "@/interfaces/Client"
import { orderSchema } from "@/libs/schemas"
import { Button, Card, Chip, Screen, TextField } from "@/components/ui"

export default function NewOrderScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"Clothes" | "Curtains" | "Others">("Clothes")
  const [status, setStatus] = useState<"consultation" | "measurements" | "cutting" | "sewing" | "fitting" | "delivered" | "cancelled">("consultation")
  const [dueDate, setDueDate] = useState("")
  const [price, setPrice] = useState("")
  const [deposit, setDeposit] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    getClients(user.uid).then(setClients).catch(() => setClients([]))
  }, [user])

  if (!user) return null

  const selectedClient = clients.find((client) => client.id === clientId)

  const handleSave = async () => {
    const result = orderSchema.safeParse({
      clientId,
      clientName: selectedClient?.name ?? "",
      title,
      type,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      price: price ? Number(price) : null,
      deposit: deposit ? Number(deposit) : null,
      currency,
      notes: notes || null,
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
      await createOrder(user.uid, {
        clientId: result.data.clientId,
        clientName: result.data.clientName,
        title: result.data.title,
        type: result.data.type,
        status: result.data.status,
        dueDate: result.data.dueDate ?? null,
        startDate: null,
        priority: result.data.priority,
        price: result.data.price ?? null,
        deposit: result.data.deposit ?? null,
        currency: result.data.currency,
        measurementId: null,
        fabricIds: [],
        referenceImageUrls: [],
        notes: result.data.notes ?? null,
      })
      router.replace("/orders")
    } catch (error) {
      console.log("Failed to create order", error)
      setErrors({ form: t("order_save_error") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("new_order"),
          headerLeft: () => <BackIcon color={Theme.colors.text} size={24} onPress={() => router.back()} />,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}
      >
        <ScrollView
          contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <View style={{ gap: Theme.spacing.md }}>
              <View style={{ gap: Theme.spacing.xs }}>
                <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                  {t("client")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                  {clients.map((client) => (
                    <Chip
                      key={client.id}
                      label={client.name}
                      selected={clientId === client.id}
                      onPress={() => setClientId(client.id)}
                    />
                  ))}
                </View>
                {errors.clientId && <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest }}>{errors.clientId}</Text>}
              </View>

              <TextField label={t("title")} value={title} onChangeText={setTitle} error={errors.title} />

              <View style={{ gap: Theme.spacing.xs }}>
                <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                  {t("type")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                  {(["Clothes", "Curtains", "Others"] as const).map((option) => (
                    <Chip key={option} label={t(option.toLowerCase())} selected={type === option} onPress={() => setType(option)} />
                  ))}
                </View>
              </View>

              <View style={{ gap: Theme.spacing.xs }}>
                <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                  {t("status")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                  {(["consultation", "measurements", "cutting", "sewing", "fitting", "delivered", "cancelled"] as const).map((option) => (
                    <Chip key={option} label={t(option)} selected={status === option} onPress={() => setStatus(option)} />
                  ))}
                </View>
              </View>

              <TextField label={t("due_date")} value={dueDate} onChangeText={setDueDate} placeholder="2026-05-01" hint={t("due_date_hint")} error={errors.dueDate} />
              <View style={{ flexDirection: "row", gap: Theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <TextField label={t("price")} value={price} onChangeText={setPrice} keyboardType="decimal-pad" error={errors.price} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label={t("deposit")} value={deposit} onChangeText={setDeposit} keyboardType="decimal-pad" error={errors.deposit} />
                </View>
              </View>
              <TextField label={t("currency")} value={currency} onChangeText={setCurrency} autoCapitalize="characters" error={errors.currency} />

              <View style={{ gap: Theme.spacing.xs }}>
                <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                  {t("priority")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                  {(["low", "normal", "high"] as const).map((option) => (
                    <Chip key={option} label={t(option)} selected={priority === option} onPress={() => setPriority(option)} />
                  ))}
                </View>
              </View>

              <TextField label={t("notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={4} error={errors.notes} />

              {errors.form && (
                <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest }}>{errors.form}</Text>
              )}
            </View>
          </Card>
          <Button label={t("save_order")} onPress={handleSave} loading={saving} fullWidth size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
