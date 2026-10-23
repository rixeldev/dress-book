import { useCallback, useEffect, useState } from "react"
import { Linking, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon, UsersIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClient, archiveClient } from "@/features/clients/repository"
import { getMeasurements } from "@/features/measurements/repository"
import type { Measurement } from "@/interfaces/Measurement"
import type { Client } from "@/interfaces/Client"
import { Button, Card, EmptyState, Screen, SectionHeader } from "@/components/ui"

// no local wrapper needed

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
        <View style={{ gap: Theme.spacing.md }}>
          <Card>
            <View style={{ gap: Theme.spacing.sm }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Theme.colors.primary2 }} />
              <View style={{ width: "60%", height: 24, borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
            </View>
          </Card>
        </View>
      </Screen>
    )
  }

  if (!client) {
    return (
      <Screen padding={0}>
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
          headerShown: true,
          headerTitle: client.name,
          headerLeft: () => <BackIcon color={Theme.colors.text} size={24} onPress={() => router.back()} />,
        }}
      />
      <View style={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}>
        <Card>
          <View style={{ gap: Theme.spacing.sm }}>
            <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.display, fontSize: Theme.fontSizes.h1 }}>
              {client.name}
            </Text>
            {client.phone && <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>{client.phone}</Text>}
            {client.email && <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>{client.email}</Text>}
            {client.notes && (
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onest, lineHeight: Theme.lineHeights.body }}>
                {client.notes}
              </Text>
            )}
          </View>
        </Card>
        <SectionHeader title={t("measurements")} description={t("client_measurements_desc")} />
        <View style={{ gap: Theme.spacing.sm }}>
          {measurements.length === 0 ? (
            <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest }}>
              {t("no_measurements_yet")}
            </Text>
          ) : (
            measurements.map((measurement) => {
              const outdated = new Date(measurement.takenAt).getTime() < Date.now() - 180 * 86_400_000
              return (
                <View
                  key={measurement.id}
                  style={{
                    borderRadius: Theme.radius.card,
                    backgroundColor: Theme.semantic.bg.surface,
                    borderWidth: 1,
                    borderColor: outdated ? Theme.semantic.state.warning : Theme.semantic.border.subtle,
                    padding: Theme.spacing.md,
                    gap: 4,
                  }}
                >
                  <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold }}>
                    {t("version")} {measurement.version} · {measurement.unit}
                  </Text>
                  <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.label }}>
                    {t("taken_on")} {measurement.takenAt.slice(0, 10)}
                    {outdated ? ` · ${t("measurement_outdated")}` : ""}
                  </Text>
                </View>
              )
            })
          )}
        </View>

        <SectionHeader title={t("orders")} description={t("client_orders_desc")} />
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
          label={t("archive_client")}
          onPress={async () => {
            if (!user) return
            await archiveClient(user.uid, client.id)
            router.replace("/clients")
          }}
          variant="ghost"
          fullWidth
        />
      </View>
    </Screen>
  )
}
