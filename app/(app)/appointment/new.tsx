import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"
import { createAppointment } from "@/features/appointments/repository"
import { appointmentSchema } from "@/libs/schemas"
import { scheduleAppointmentReminder } from "@/services/notifications"
import {
  Button,
  Card,
  DateField,
  IconButton,
  Screen,
  SectionHeader,
  TextField,
} from "@/components/ui"

export default function NewAppointmentScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { getItem } = useStorage()
  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user) return null

  const handleSave = async () => {
    const result = appointmentSchema.safeParse({
      title,
      startsAt: startsAt ? new Date(startsAt).toISOString() : "",
      location: location || null,
      notes: notes || null,
      clientId: null,
      orderId: null,
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
      const appointment = await createAppointment(user.uid, {
        clientId: null,
        orderId: null,
        title: result.data.title,
        startsAt: result.data.startsAt,
        endsAt: null,
        location: result.data.location ?? null,
        notes: result.data.notes ?? null,
      })

      const notificationsEnabled = await getItem("notifications")
      if (notificationsEnabled !== "false") {
        await scheduleAppointmentReminder({
          title: appointment.title,
          body: appointment.location ?? t("appointment_reminder_body"),
          triggerAt: new Date(appointment.startsAt),
        })
      }

      router.replace("/calendar")
    } catch (error) {
      console.log("Failed to create appointment", error)
      setErrors({ form: t("appointment_save_error") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("new_appointment"),
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
            <SectionHeader title={t("details_section")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("title")}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t("appointment_title_placeholder")}
                  error={errors.title}
                />
                <DateField
                  label={t("starts_at")}
                  value={startsAt}
                  onChangeText={setStartsAt}
                  placeholder="2026-05-01T10:00:00"
                  hint={t("starts_at_hint")}
                  error={errors.startsAt}
                />
                <TextField
                  label={t("location")}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t("location_placeholder")}
                />
                <TextField
                  label={t("notes")}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
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
            label={t("save_appointment")}
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
