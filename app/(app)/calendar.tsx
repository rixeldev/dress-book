import { useCallback, useEffect, useState } from "react"
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Stack, router } from "expo-router"

import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getAppointments, deleteAppointment } from "@/features/appointments/repository"
import type { Appointment } from "@/interfaces/Appointment"
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  Skeleton,
} from "@/components/ui"
import { CalendarIcon, ClockIcon, PlusIcon, TrashIcon } from "@/icons/Icons"
import { formatIsoDate, formatIsoTime } from "@/libs/dates"

export default function CalendarScreen() {
  const { t, i18n } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setAppointments(await getAppointments(user.uid))
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

  const confirmDelete = (appointment: Appointment) => {
    Alert.alert(t("delete_appointment"), t("delete_appointment_desc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          if (!user) return
          await deleteAppointment(user.uid, appointment.id)
          await load()
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerTitle: t("calendar") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="46%" height={38} />
          <Skeleton height={96} radius={20} />
          <Skeleton height={96} radius={20} />
        </View>
      </Screen>
    )
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
  const upcoming = sorted.filter((item) => new Date(item.startsAt).getTime() >= Date.now())
  const past = sorted.filter((item) => new Date(item.startsAt).getTime() < Date.now())

  return (
    <Screen padding={0}>
      <Stack.Screen options={{ headerTitle: t("calendar") }} />
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
          paddingBottom: 120,
          gap: Theme.spacing.sm,
        }}
        data={[...upcoming, ...past]}
        keyExtractor={(appointment) => appointment.id}
        ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.xs }} />}
        ListHeaderComponent={
          <View style={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text
                  style={{
                    color: Theme.semantic.text.primary,
                    fontFamily: Theme.fonts.display,
                    fontSize: Theme.fontSizes.h1,
                  }}
                >
                  {t("calendar")}
                </Text>
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                  }}
                >
                  {t("appointments_count", { count: appointments.length })}
                </Text>
              </View>
              <IconButton
                icon={<PlusIcon size={20} color={Theme.semantic.text.inverse} />}
                accessibilityLabel={t("new_appointment")}
                onPress={() => router.push("/appointment/new")}
                variant="primary"
              />
            </View>
            <Button
              label={t("new_appointment")}
              onPress={() => router.push("/appointment/new")}
              variant="secondary"
              fullWidth
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<CalendarIcon color={Theme.semantic.accent.primary} size={30} />}
            title={t("calendar_empty_title")}
            description={t("calendar_empty_desc")}
            actionLabel={t("new_appointment")}
            onAction={() => router.push("/appointment/new")}
            actionVariant="primary"
          />
        }
        renderItem={({ item }) => {
          const isPast = new Date(item.startsAt).getTime() < Date.now()
          return (
            <Card style={styles.card}>
              <View style={styles.topRow}>
                <View style={[styles.dateChip, { backgroundColor: Theme.semantic.accent.soft }]}>
                  <Text
                    style={{
                      color: Theme.semantic.accent.primary,
                      fontFamily: Theme.fonts.display,
                      fontSize: Theme.fontSizes.h3,
                      lineHeight: Theme.lineHeights.h3,
                    }}
                  >
                    {new Date(item.startsAt).getDate()}
                  </Text>
                  <Text
                    style={{
                      color: Theme.semantic.accent.primary,
                      fontFamily: Theme.fonts.onestBold,
                      fontSize: 9,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    {new Date(item.startsAt).toLocaleDateString(i18n.language, {
                      month: "short",
                    })}
                  </Text>
                </View>

                <View style={styles.copy}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: isPast
                        ? Theme.semantic.text.secondary
                        : Theme.semantic.text.primary,
                      fontFamily: Theme.fonts.onestBold,
                      fontSize: Theme.fontSizes.body,
                    }}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <ClockIcon size={13} color={Theme.semantic.text.secondary} />
                    <Text
                      style={{
                        color: Theme.semantic.text.secondary,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.label,
                      }}
                      numberOfLines={1}
                    >
                      {formatIsoTime(item.startsAt, i18n.language)}
                      {item.endsAt ? ` – ${formatIsoTime(item.endsAt, i18n.language)}` : ""}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: Theme.semantic.text.tertiary,
                      fontFamily: Theme.fonts.onest,
                      fontSize: Theme.fontSizes.caption,
                    }}
                    numberOfLines={1}
                  >
                    {formatIsoDate(item.startsAt, i18n.language)}
                    {item.location ? ` · ${item.location}` : ""}
                  </Text>
                </View>

                <IconButton
                  icon={<TrashIcon size={18} color={Theme.semantic.state.danger} />}
                  onPress={() => confirmDelete(item)}
                  accessibilityLabel={t("delete_appointment")}
                  size="sm"
                />
              </View>

              {item.notes ? (
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                    lineHeight: Theme.lineHeights.label,
                  }}
                  numberOfLines={2}
                >
                  {item.notes}
                </Text>
              ) : null}
            </Card>
          )
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateChip: {
    width: 50,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
})
