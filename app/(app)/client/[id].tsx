import { useCallback, useEffect, useState } from "react"
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon, UsersIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClient, archiveClient } from "@/features/clients/repository"
import { getMeasurements } from "@/features/measurements/repository"
import type { Measurement } from "@/interfaces/Measurement"
import type { Client } from "@/interfaces/Client"
import { exportMeasurementSheet } from "@/services/pdf"
import { AnalyticsEvents } from "@/services/analytics"
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  SectionHeader,
  Skeleton,
} from "@/components/ui"

export default function ClientDetailScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [client, setClient] = useState<Client | null>(null)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user || !params.id) return
    setLoading(true)
    try {
      const [loadedClient, loadedMeasurements] = await Promise.all([
        getClient(user.uid, params.id),
        getMeasurements(user.uid, params.id),
      ])
      setClient(loadedClient)
      setMeasurements(loadedMeasurements)
    } finally {
      setLoading(false)
    }
  }, [user, params.id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerTitle: t("client") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="60%" height={38} />
          <Skeleton height={120} radius={20} />
          <Skeleton height={96} radius={20} />
        </View>
      </Screen>
    )
  }

  if (!client) {
    return (
      <Screen padding={0}>
        <Stack.Screen options={{ headerTitle: t("client") }} />
        <EmptyState
          icon={<UsersIcon color={Theme.semantic.state.danger} size={30} />}
          title={t("client_not_found")}
          description={t("client_not_found_desc")}
          actionLabel={t("go_back")}
          onAction={() => router.back()}
        />
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: client.name,
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
      <ScrollView
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 48,
          gap: Theme.spacing.lg,
        }}
      >
        <Card style={styles.profile}>
          <View style={styles.profileRow}>
            <Avatar name={client.name} size="xl" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  color: Theme.semantic.text.primary,
                  fontFamily: Theme.fonts.display,
                  fontSize: Theme.fontSizes.h1,
                  letterSpacing: -0.3,
                }}
              >
                {client.name}
              </Text>
              {client.phone && (
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                  }}
                >
                  {client.phone}
                </Text>
              )}
              {client.email && (
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                  }}
                >
                  {client.email}
                </Text>
              )}
            </View>
          </View>

          {client.notes ? (
            <Text
              style={{
                color: Theme.semantic.text.primary,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.fontSizes.body,
                lineHeight: Theme.lineHeights.body,
              }}
            >
              {client.notes}
            </Text>
          ) : null}

          {Object.entries(client.customFields ?? {}).length > 0 && (
            <View style={styles.fieldsWrap}>
              {Object.entries(client.customFields ?? {}).map(([key, value]) => (
                <View
                  key={key}
                  style={[styles.field, { backgroundColor: Theme.semantic.bg.sunken }]}
                >
                  <Text
                    style={{
                      color: Theme.semantic.text.secondary,
                      fontFamily: Theme.fonts.onestBold,
                      fontSize: Theme.fontSizes.caption,
                    }}
                  >
                    {key}
                  </Text>
                  <Text
                    style={{
                      color: Theme.semantic.text.primary,
                      fontFamily: Theme.fonts.onest,
                      fontSize: Theme.fontSizes.label,
                    }}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader
            title={t("measurements")}
            description={t("client_measurements_desc")}
          />
          {measurements.length === 0 ? (
            <Text
              style={{
                color: Theme.semantic.text.secondary,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.fontSizes.label,
              }}
            >
              {t("no_measurements_yet")}
            </Text>
          ) : (
            <View style={{ gap: Theme.spacing.xs }}>
              {measurements.map((measurement) => {
                const outdated =
                  new Date(measurement.takenAt).getTime() < Date.now() - 180 * 86_400_000
                return (
                  <Card
                    key={measurement.id}
                    style={{
                      gap: 4,
                      borderColor: outdated
                        ? Theme.semantic.state.warning
                        : Theme.semantic.border.subtle,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text
                        style={{
                          flex: 1,
                          color: Theme.semantic.text.primary,
                          fontFamily: Theme.fonts.onestBold,
                          fontSize: Theme.fontSizes.body,
                        }}
                      >
                        {t("version")} {measurement.version} · {measurement.unit}
                      </Text>
                      {outdated && <Badge label={t("outdated")} tone="warning" />}
                    </View>
                    <Text
                      style={{
                        color: Theme.semantic.text.secondary,
                        fontFamily: Theme.fonts.onest,
                        fontSize: Theme.fontSizes.label,
                      }}
                    >
                      {t("taken_on")} {measurement.takenAt.slice(0, 10)}
                      {outdated ? ` · ${t("measurement_outdated")}` : ""}
                    </Text>
                  </Card>
                )
              })}
            </View>
          )}
        </View>

        {(client.phone || client.email) && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("contact")} />
            <View style={{ flexDirection: "row", gap: Theme.spacing.sm }}>
              {client.phone && (
                <Button
                  label={t("call")}
                  onPress={() => Linking.openURL(`tel:${client.phone}`)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              )}
              {client.phone && (
                <Button
                  label={t("message")}
                  onPress={() => Linking.openURL(`sms:${client.phone}`)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              )}
              {client.email && (
                <Button
                  label={t("email_action")}
                  onPress={() => Linking.openURL(`mailto:${client.email}`)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        )}

        <View style={{ gap: Theme.spacing.sm }}>
          <Button
            label={t("edit_client")}
            onPress={() => router.push(`/client/edit?id=${client.id}`)}
            variant="secondary"
            fullWidth
          />
          <Button
            label={t("take_measurements")}
            onPress={() => router.push(`/measurement/new?clientId=${client.id}`)}
            fullWidth
          />
          <Button
            label={t("export_measurement_sheet")}
            onPress={async () => {
              const latest = measurements[0]
              await exportMeasurementSheet({
                clientName: client.name,
                measurements: (latest?.values ?? {}) as unknown as Record<
                  string,
                  Record<string, number | undefined>
                >,
              })
              AnalyticsEvents.measurementExported()
            }}
            variant="secondary"
            fullWidth
          />
          <Button
            label={t("archive_client")}
            onPress={async () => {
              if (!user) return
              await archiveClient(user.uid, client.id)
              router.replace("/clients")
            }}
            variant="ghost"
            fullWidth
            labelStyle={{ color: Theme.semantic.state.danger }}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  profile: {
    gap: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  fieldsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  field: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
})
