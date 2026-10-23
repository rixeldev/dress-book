import { useState } from "react"
import type { ReactNode } from "react"
import { KeyboardAvoidingView, Platform, Text, View } from "react-native"
import { Redirect, router } from "expo-router"
import { useTranslation } from "react-i18next"
import { CheckIcon, UsersIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useStorage } from "@/hooks/useStorage"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { Button, Card, Chip, TextField } from "@/components/ui"
import { createClient } from "@/features/clients/repository"
import {
  saveOnboardingProfile,
  type CurrencyPreference,
  type MeasurementUnitPreference,
} from "@/features/onboarding/repository"

const stepCount = 3

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const { setItem } = useStorage()
  const { markComplete } = useOnboarding()
  const [step, setStep] = useState(0)
  const [units, setUnits] = useState<MeasurementUnitPreference>("cm")
  const [currency, setCurrency] = useState<CurrencyPreference>("USD")
  const [clientName, setClientName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return <Redirect href="/sign-in" />

  const completeOnboarding = async () => {
    const normalizedName = clientName.trim()
    if (!normalizedName || saving) return

    setSaving(true)
    setError(null)

    try {
      await Promise.all([
        saveOnboardingProfile({ userId: user.uid, units, currency }),
        createClient(user.uid, { name: normalizedName }),
      ])
      await Promise.all([
        setItem("measurementUnit", units),
        setItem("currency", currency),
        setItem(`onboarding:${user.uid}`, "complete"),
      ])
      markComplete()
      router.replace("/clients")
    } catch (caughtError) {
      console.log("Failed to complete onboarding", caughtError)
      setError(t("onboarding_save_error"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: Theme.spacing.xl,
          paddingTop: Theme.spacing.huge,
          paddingBottom: Theme.spacing.xxl,
        }}
      >
        <View style={{ gap: Theme.spacing.lg }}>
          <Text
            style={{
              color: Theme.semantic.text.secondary,
              fontFamily: Theme.fonts.onestBold,
              fontSize: Theme.fontSizes.caption,
              letterSpacing: 1.2,
            }}
          >
            {t("onboarding_step", { current: step + 1, total: stepCount })}
          </Text>

          {step === 0 && (
            <OnboardingPage
              icon={<CheckIcon size={32} color={Theme.semantic.accent.primary} />}
              title={t("onboarding_welcome_title")}
              description={t("onboarding_welcome_desc")}
            />
          )}

          {step === 1 && (
            <View style={{ gap: Theme.spacing.xl }}>
              <OnboardingPage
                title={t("onboarding_preferences_title")}
                description={t("onboarding_preferences_desc")}
              />
              <PreferenceGroup
                label={t("measurement_unit")}
                options={[
                  { label: t("centimeters"), value: "cm" as const },
                  { label: t("inches"), value: "in" as const },
                ]}
                selected={units}
                onSelect={setUnits}
              />
              <PreferenceGroup
                label={t("currency")}
                options={[
                  { label: "USD ($)", value: "USD" as const },
                  { label: "EUR (€)", value: "EUR" as const },
                ]}
                selected={currency}
                onSelect={setCurrency}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: Theme.spacing.xl }}>
              <OnboardingPage
                icon={<UsersIcon size={32} color={Theme.semantic.accent.primary} />}
                title={t("onboarding_first_client_title")}
                description={t("onboarding_first_client_desc")}
              />
              <TextField
                label={t("client_name")}
                placeholder={t("client_name_placeholder")}
                value={clientName}
                onChangeText={setClientName}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={completeOnboarding}
                error={error ?? undefined}
              />
            </View>
          )}
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          {step < stepCount - 1 ? (
            <Button
              label={t("continue")}
              onPress={() => setStep((current) => current + 1)}
              fullWidth
              size="lg"
            />
          ) : (
            <Button
              label={t("onboarding_finish")}
              onPress={completeOnboarding}
              disabled={!clientName.trim()}
              loading={saving}
              fullWidth
              size="lg"
            />
          )}
          {step > 0 && (
            <Button
              label={t("back")}
              onPress={() => setStep((current) => current - 1)}
              variant="ghost"
              fullWidth
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

function OnboardingPage({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: ReactNode
}) {
  const { Theme } = useAppTheme()

  return (
    <View style={{ gap: Theme.spacing.sm }}>
      {icon && (
        <Card
          padded={false}
          style={{ width: 68, height: 68, alignItems: "center", justifyContent: "center" }}
        >
          {icon}
        </Card>
      )}
      <Text
        style={{
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.display,
          fontSize: Theme.fontSizes.display,
          lineHeight: Theme.lineHeights.display,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: Theme.semantic.text.secondary,
          fontFamily: Theme.fonts.onest,
          fontSize: Theme.fontSizes.body,
          lineHeight: Theme.lineHeights.body,
        }}
      >
        {description}
      </Text>
    </View>
  )
}

function PreferenceGroup<T extends string>({
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
          color: Theme.semantic.text.primary,
          fontFamily: Theme.fonts.onestBold,
          fontSize: Theme.fontSizes.label,
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
