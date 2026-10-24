import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/features/clients/repository"
import { getClients } from "@/features/clients/repository"
import { canCreateClient } from "@/services/entitlements"
import { clientSchema } from "@/libs/schemas"
import { AnalyticsEvents } from "@/services/analytics"
import { Button, Card, IconButton, Screen, TextField } from "@/components/ui"

export default function NewClientScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user) return null

  const handleSave = async () => {
    if (!user) return
    const existing = await getClients(user.uid)
    const gate = await canCreateClient(existing.length)
    if (!gate.allowed) {
      Alert.alert(t("upgrade_required"), gate.reason ?? "")
      return
    }
    const result = clientSchema.safeParse({
      name,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
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
      await createClient(user.uid, result.data)
      AnalyticsEvents.clientCreated()
      router.replace("/clients")
    } catch (error) {
      console.log("Failed to create client", error)
      setErrors({ form: t("client_save_error") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("new_client"),
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
        style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}
      >
        <ScrollView
          contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <View style={{ gap: Theme.spacing.md }}>
              <TextField
                label={t("client_name")}
                value={name}
                onChangeText={setName}
                placeholder={t("client_name_placeholder")}
                autoCapitalize="words"
                error={errors.name}
              />
              <TextField
                label={t("phone")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                error={errors.phone}
              />
              <TextField
                label={t("email")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />
              <TextField
                label={t("tags")}
                value={tags}
                onChangeText={setTags}
                placeholder={t("tags_placeholder")}
                hint={t("tags_hint")}
              />
              <TextField
                label={t("notes")}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                error={errors.notes}
              />
              {errors.form && (
                <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest }}>
                  {errors.form}
                </Text>
              )}
            </View>
          </Card>
          <Button label={t("save_client")} onPress={handleSave} loading={saving} fullWidth size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
