import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { getClient, updateClient } from "@/features/clients/repository"
import { clientSchema } from "@/libs/schemas"
import {
  Button,
  Card,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  TextField,
} from "@/components/ui"

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
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
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
        setCustomFields(client.customFields ?? {})
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
      customFields,
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
        <Stack.Screen options={{ headerTitle: t("edit_client") }} />
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="50%" height={38} />
          <Skeleton height={64} radius={18} />
          <Skeleton height={64} radius={18} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("edit_client"),
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
          <ScreenHeader overline={t("clients")} title={t("edit_client")} />

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("details_section")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("client_name")}
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                />
                <TextField
                  label={t("phone")}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={errors.phone}
                />
                <TextField
                  label={t("email")}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
              </View>
            </Card>
          </View>

          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("custom_fields")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                {Object.entries(customFields).map(([key, value]) => (
                  <View
                    key={key}
                    style={[
                      styles.fieldRow,
                      { borderBottomColor: Theme.semantic.border.subtle },
                    ]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          color: Theme.semantic.text.secondary,
                          fontFamily: Theme.fonts.onestBold,
                          fontSize: Theme.fontSizes.caption,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                        }}
                      >
                        {key}
                      </Text>
                      <Text
                        style={{
                          color: Theme.semantic.text.primary,
                          fontFamily: Theme.fonts.onest,
                          fontSize: Theme.fontSizes.body,
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                    <Button
                      label={t("remove")}
                      onPress={() => {
                        setCustomFields((prev) => {
                          const next = { ...prev }
                          delete next[key]
                          return next
                        })
                      }}
                      variant="ghost"
                      size="sm"
                    />
                  </View>
                ))}
                <View style={styles.pair}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("field_name")}
                      value={newFieldKey}
                      onChangeText={setNewFieldKey}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t("field_value")}
                      value={newFieldValue}
                      onChangeText={setNewFieldValue}
                    />
                  </View>
                </View>
                <Button
                  label={t("add_field")}
                  onPress={() => {
                    if (!newFieldKey.trim()) return
                    setCustomFields((prev) => ({
                      ...prev,
                      [newFieldKey.trim()]: newFieldValue,
                    }))
                    setNewFieldKey("")
                    setNewFieldValue("")
                  }}
                  variant="secondary"
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
            label={t("save_client")}
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
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
