import { useCallback, useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"

import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getAppointments, deleteAppointment } from "@/features/appointments/repository"
import type { Appointment } from "@/interfaces/Appointment"
import { Button, EmptyState, Screen, SectionHeader } from "@/components/ui"
import { router } from "expo-router"
import { StatsIcon as CalendarIcon } from "@/icons/Icons"
import { formatIsoDate } from "@/libs/dates"

export default function CalendarScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setAppointments(await getAppointments(user.uid))
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
          <View style={{ height: 24, width: "40%", borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
          <View style={{ height: 72, borderRadius: 12, backgroundColor: Theme.colors.background2 }} />
        </View>
      </Screen>
    )
  }

  if (appointments.length === 0) {
    return (
      <Screen padding={0}>
        <EmptyState
          icon={<CalendarIcon color={Theme.semantic.accent.primary} size={30} />}
          title={t("calendar_empty_title")}
          description={t("calendar_empty_desc")}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <FlatList
        contentContainerStyle={{ padding: Theme.spacing.md }}
        data={appointments}
        keyExtractor={(appointment) => appointment.id}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm }}>
            <SectionHeader title={t("calendar")} description={t("appointments_count", { count: appointments.length })} />
            <Button label={t("new_appointment")} onPress={() => router.push("/appointment/new")} variant="secondary" />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              borderRadius: Theme.radius.card,
              backgroundColor: Theme.semantic.bg.surface,
              borderWidth: 1,
              borderColor: Theme.semantic.border.subtle,
              padding: Theme.spacing.md,
              gap: 4,
              marginBottom: Theme.spacing.sm,
            }}
          >
            <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.body }}>
              {item.title}
            </Text>
            <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
              {formatIsoDate(item.startsAt)} {item.location ? `· ${item.location}` : ""}
            </Text>
            <Button
              label={t("delete")}
              onPress={async () => {
                if (!user) return
                await deleteAppointment(user.uid, item.id)
                await load()
              }}
              variant="ghost"
            />
          </View>
        )}
      />
    </Screen>
  )
}
