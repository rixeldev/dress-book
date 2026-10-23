import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClient, updateClient } from "@/features/clients/repository"
import { clientSchema } from "@/libs/schemas"
import { Button, Card, Screen, TextField } from "@/components/ui"

export default function EditClientScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ id: string }>()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || !params.id) return
    getClient(user.uid, params.id)
      .then((client) => {
        if (!client) return
        setName(client.name)
        setPhone(client.phone ?? "")
        setEmail(client.email ?? "")
        setNotes(client.notes ?? "")
        setTags(client.tags.join(", "))
      })
      .finally(() => setLoading(false))
  }, [user, params.id])

  if (!user) return null

  const handleSave = async () => {
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
      await updateClient(user.uid, params.id, result.data)
      router.back()
    } catch (error) {
      console.log("Failed to update client", error)
      setErrors({ form: t("client_save_error") })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <View style={{ height: 48, borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
          <View style={{ height: 48, borderRadius: 8, backgroundColor: Theme.colors.background2 }} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("edit_client"),
          headerLeft: () => <BackIcon color={Theme.colors.text} size={24} onPress={() => router.back()} />,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}
      >
        <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }} keyboardShouldPersistTaps="handled">
          <Card>
            <View style={{ gap: Theme.spacing.md }}>
              <TextField label={t("client_name")} value={name} onChangeText={setName} error={errors.name} />
              <TextField label={t("phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
              <TextField label={t("email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <TextField label={t("tags")} value={tags} onChangeText={setTags} placeholder={t("tags_placeholder")} hint={t("tags_hint")} />
              <TextField label={t("notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={4} error={errors.notes} />
              {errors.form && <Text style={{ color: Theme.semantic.state.danger, fontFamily: Theme.fonts.onest }}>{errors.form}</Text>}
            </View>
          </Card>
          <Button label={t("save_client")} onPress={handleSave} loading={saving} fullWidth size="lg" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
