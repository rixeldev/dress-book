import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { Stack, router } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useOrganization } from "@/contexts/OrganizationContext"
import { Button, Card, EmptyState, IconButton, ListRow, Screen, ScreenHeader, SectionHeader, TextField } from "@/components/ui"

export default function OrganizationScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const org = useOrganization()
  const [orgName, setOrgName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [suggestionText, setSuggestionText] = useState("")

  if (!user) return null

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("organization"),
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
          paddingBottom: 40,
          gap: Theme.spacing.lg,
        }}
      >
        <ScreenHeader
          overline={t("studio")}
          title={t("organization")}
          description={t("organization_desc")}
        />

        {org.readOnly && (
          <Card style={{ backgroundColor: Theme.semantic.accent.soft }}>
            <Text
              style={{
                color: Theme.semantic.accent.primary,
                fontFamily: Theme.fonts.onestBold,
                fontSize: Theme.fontSizes.label,
              }}
            >
              {t("viewing_org_readonly", { name: org.orgName ?? org.activeOwnerId })}
            </Text>
            <Button label={t("leave_org")} onPress={org.leaveOrg} variant="ghost" size="sm" />
          </Card>
        )}

        {!org.readOnly && org.activeOwnerId === null && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("your_org")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("org_name")}
                  value={orgName || org.orgName || ""}
                  onChangeText={setOrgName}
                  placeholder={t("org_name_placeholder")}
                />
                <Button
                  label={t("save_org")}
                  onPress={() => org.setupOrg(orgName || org.orgName || "My Studio")}
                  fullWidth
                />
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>{t("invite_code")}</Text>
                  <Text style={styles.readonlyValue}>{org.inviteCode}</Text>
                </View>
                <Text
                  style={{
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.caption,
                  }}
                >
                  {t("invite_code_hint")}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {!org.readOnly && org.activeOwnerId === null && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("members")} description={t("members_desc")} />
            {org.members.filter((m) => m.uid !== user.uid).length === 0 ? (
              <EmptyState
                title={t("no_members_yet")}
                description={t("no_members_desc")}
              />
            ) : (
              <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
                {org.members
                  .filter((m) => m.uid !== user.uid)
                  .map((member, index, list) => (
                    <ListRow
                      key={member.uid}
                      title={member.email ?? member.uid}
                      description={member.role}
                      divider={index < list.length - 1}
                      trailing={
                        <Button
                          label={t("remove")}
                          onPress={() => org.removeMember(member.uid)}
                          variant="ghost"
                          size="sm"
                        />
                      }
                    />
                  ))}
              </Card>
            )}
          </View>
        )}

        {!org.readOnly && org.activeOwnerId === null && org.suggestions.length > 0 && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("suggestions")} description={t("suggestions_desc")} />
            <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
              {org.suggestions.map((suggestion, index, list) => (
                <ListRow
                  key={suggestion.id}
                  title={`${suggestion.type}: ${suggestion.targetId ?? ""}`}
                  description={`${suggestion.memberEmail ?? suggestion.memberUid} · ${suggestion.status}`}
                  divider={index < list.length - 1}
                  trailing={
                    suggestion.status === "pending" ? (
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <Button
                          label={t("accept")}
                          onPress={() => org.reviewSuggestion(suggestion.id, "accepted")}
                          size="sm"
                        />
                        <Button
                          label={t("reject")}
                          onPress={() => org.reviewSuggestion(suggestion.id, "rejected")}
                          variant="ghost"
                          size="sm"
                        />
                      </View>
                    ) : (
                      <Text style={{ color: Theme.semantic.text.secondary, fontFamily: Theme.fonts.onest, fontSize: Theme.fontSizes.caption }}>
                        {suggestion.status}
                      </Text>
                    )
                  }
                />
              ))}
            </Card>
          </View>
        )}

        {org.readOnly && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("suggest_change")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("suggestion_details")}
                  value={suggestionText}
                  onChangeText={setSuggestionText}
                  multiline
                  numberOfLines={4}
                />
                <Button
                  label={t("submit_suggestion")}
                  onPress={async () => {
                    await org.submitSuggestion({
                      type: "client",
                      targetId: null,
                      changes: { note: suggestionText },
                    })
                    setSuggestionText("")
                    Alert.alert(t("success"), t("suggestion_submitted"))
                  }}
                  fullWidth
                />
              </View>
            </Card>
          </View>
        )}

        {!org.readOnly && org.activeOwnerId === null && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("join_org")} />
            <Card>
              <View style={{ gap: Theme.spacing.md }}>
                <TextField
                  label={t("owner_id")}
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder={t("owner_id_placeholder")}
                  autoCapitalize="none"
                />
                <Button
                  label={t("join_org_action")}
                  onPress={async () => {
                    try {
                      await org.joinOrg(joinCode.trim())
                      Alert.alert(t("success"), t("joined_org"))
                    } catch {
                      Alert.alert(t("error"), t("join_org_failed"))
                    }
                  }}
                  fullWidth
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  readonlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  readonlyLabel: {
    color: "#7B6B60",
    fontFamily: "OnestBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  readonlyValue: {
    color: "#191411",
    fontFamily: "OnestBold",
    fontSize: 14,
  },
})
