import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon, UsersIcon } from "@/icons/Icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { getClients } from "@/features/clients/repository"
import { createOrder } from "@/features/orders/repository"
import { scheduleOrderDueReminder } from "@/services/notifications"
import { useStorage } from "@/hooks/useStorage"
import type { Client } from "@/interfaces/Client"
import { orderSchema } from "@/libs/schemas"
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Flag,
  IconButton,
  Screen,
  SectionHeader,
  TextField,
} from "@/components/ui"

export default function NewOrderScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { getItem } = useStorage()
  const { country, currency } = useCurrency()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"Clothes" | "Curtains" | "Others">("Clothes")
  const [status, setStatus] = useState<
    "consultation" | "measurements" | "cutting" | "sewing" | "fitting" | "delivered" | "cancelled"
  >("consultation")
  const [dueDate, setDueDate] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [price, setPrice] = useState("")
  const [deposit, setDeposit] = useState("")
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    getClients(user.uid)
      .then(setClients)
      .catch(() => setClients([]))
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
      const order = await createOrder(user.uid, {
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

      const notificationsEnabled = await getItem("notifications")
      if (notificationsEnabled !== "false" && order.dueDate) {
        await scheduleOrderDueReminder({
          orderId: order.id,
          title: order.title,
          dueDate: order.dueDate,
        })
      }

      router.replace("/orders")
    } catch (error) {
      console.log("Failed to create order", error)
      setErrors({ form: t("order_save_error") })
    } finally {
      setSaving(false)
    }
  }

  const header = (
    <Stack.Screen
      options={{
        headerTitle: t("new_order"),
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
  )

  if (clients.length === 0) {
    return (
      <Screen padding={0}>
        {header}
        <View style={{ paddingHorizontal: Theme.spacing.gutter, paddingTop: Theme.spacing.lg }}>
        </View>
        <EmptyState
          icon={<UsersIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("clients_empty_title")}
          description={t("order_needs_client_desc")}
          actionLabel={t("new_client")}
          onAction={() => router.push("/client/new")}
          actionVariant="primary"
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      {header}
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
            <SectionHeader title={t("client")} />
            <Card>
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
              {errors.clientId && (
                <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest }}>
                  {errors.clientId}
                </Text>
              )}
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("order_details")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("title")}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t("order_title_placeholder")}
                  error={errors.title}
                />

                <ChoiceGroup
                  label={t("type")}
                  options={(["Clothes", "Curtains", "Others"] as const).map((option) => ({
                    value: option,
                    label: t(option.toLowerCase()),
                  }))}
                  selected={type}
                  onSelect={setType}
                />

                <ChoiceGroup
                  label={t("status")}
                  options={(
                    [
                      "consultation",
                      "measurements",
                      "cutting",
                      "sewing",
                      "fitting",
                      "delivered",
                      "cancelled",
                    ] as const
                  ).map((option) => ({ value: option, label: t(option) }))}
                  selected={status}
                  onSelect={setStatus}
                />

                <ChoiceGroup
                  label={t("priority")}
                  options={(["low", "normal", "high"] as const).map((option) => ({
                    value: option,
                    label: t(option),
                  }))}
                  selected={priority}
                  onSelect={setPriority}
                />
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("payment")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <View style={styles.pair}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("price")}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                      error={errors.price}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("deposit")}
                      value={deposit}
                      onChangeText={setDeposit}
                      keyboardType="decimal-pad"
                      error={errors.deposit}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.currencyRow,
                    {
                      backgroundColor: Theme.semantic.bg.sunken,
                      borderColor: Theme.semantic.border.subtle,
                    },
                  ]}
                >
                  <Flag code={country.code} size={24} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Theme.semantic.text.primary,
                        fontFamily: Theme.fonts.onestBold,
                        fontSize: Theme.fontSizes.body,
                      }}
                    >
                      {currency}
                    </Text>
                    <Text
                      style={{
                        color: Theme.semantic.text.secondary,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.caption,
                      }}
                    >
                      {t("currency_from_settings")}
                    </Text>
                  </View>
                  <Text
                    onPress={() => router.push("/settings")}
                    style={{
                      color: Theme.semantic.accent.primary,
                      fontFamily: Theme.fonts.onestBold,
                      fontSize: Theme.fontSizes.label,
                    }}
                  >
                    {t("change")}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("timeline")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
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
                    {t("due_date")}
                  </Text>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.dateRow,
                      {
                        backgroundColor: Theme.semantic.bg.sunken,
                        borderColor: errors.dueDate
                          ? Theme.semantic.state.danger
                          : Theme.semantic.border.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: dueDate
                          ? Theme.semantic.text.primary
                          : Theme.semantic.text.tertiary,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.body,
                      }}
                    >
                      {dueDate ? formatDisplayDate(dueDate) : t("select_date")}
                    </Text>
                    <Text style={{ color: Theme.semantic.accent.primary, fontSize: 18 }}>📅</Text>
                  </Pressable>
                  {errors.dueDate && (
                    <Text
                      style={{
                        color: Theme.semantic.state.danger,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.caption,
                      }}
                    >
                      {errors.dueDate}
                    </Text>
                  )}
                  <Text
                    style={{
                      color: Theme.semantic.text.tertiary,
                      fontFamily: Theme.fonts.onest,
                      fontSize: Theme.fontSizes.caption,
                    }}
                  >
                    {t("due_date_hint")}
                  </Text>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate ? new Date(dueDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false)
                      if (selectedDate) {
                        setDueDate(selectedDate.toISOString())
                      }
                    }}
                  />
                )}
                <TextField
                  label={t("notes")}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  error={errors.notes}
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
            label={t("save_order")}
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

function ChoiceGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: { label: string; value: T }[]
  selected: T
  onSelect: (value: T) => void
}) {
  const { Theme } = useAppTheme()

  return (
    <View style={{ gap: Theme.spacing.xs }}>
      <Text
        style={{
          color: Theme.semantic.text.secondary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.caption,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pair: {
    flexDirection: "row",
    gap: 12,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  dateRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
})

function formatDisplayDate(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
