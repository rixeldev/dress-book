import { useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { BackIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useAuth } from "@/contexts/AuthContext"
import { createMeasurement, getMeasurements } from "@/features/measurements/repository"
import { getEmptyMeasurements } from "@/libs/measurementTemplates"
import { toCanonicalCm, fromCanonicalCm } from "@/libs/units"
import type { FullBodyMeasurements } from "@/interfaces/FullBodyMeasurements"
import type { RegType } from "@/interfaces/Regs"
import { Button, Card, Chip, IconButton, MeasurementDiagram, MeasurementRow, Screen, SegmentedControl, TextField } from "@/components/ui"

const types: RegType[] = ["Clothes", "Curtains", "Others"]

export default function MeasurementStudioScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ clientId: string }>()
  const clientId = params.clientId

  useEffect(() => {
    if (!user || !clientId) return
    getMeasurements(user.uid, clientId)
      .then((measurements) => {
        if (measurements.length > 0) setPrevious(measurements[0].values)
      })
      .catch(() => setPrevious(null))
  }, [user, clientId])

  const [type, setType] = useState<RegType>("Clothes")
  const [unit, setUnit] = useState<"cm" | "in" | "yd">("cm")
  const [values, setValues] = useState<FullBodyMeasurements>(() => getEmptyMeasurements("Clothes"))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState("")
  const [previous, setPrevious] = useState<FullBodyMeasurements | null>(null)
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())

  const handleTypeChange = (nextType: RegType) => {
    setType(nextType)
    setValues(getEmptyMeasurements(nextType))
    setExpanded(new Set())
  }

  const handleUnitChange = (nextUnit: "cm" | "in" | "yd") => {
    // Convert existing numeric values to the new unit for display
    const converted = structuredClone(values) as unknown as Record<string, Record<string, number | undefined>>
    for (const category of Object.keys(converted)) {
      for (const field of Object.keys(converted[category])) {
        const current = converted[category][field]
        if (typeof current === "number") {
          converted[category][field] = fromCanonicalCm(toCanonicalCm(current, unit), nextUnit)
        }
      }
    }
    setUnit(nextUnit)
    setValues(converted as unknown as FullBodyMeasurements)
  }

  const updateField = (category: string, field: string, raw: string) => {
    const parsed = raw === "" ? undefined : Number(raw)
    setValues((prev) => {
      const next = structuredClone(prev) as unknown as Record<string, Record<string, number | undefined>>
      if (!next[category]) next[category] = {}
      next[category][field] = Number.isFinite(parsed) ? parsed : undefined
      return next as unknown as FullBodyMeasurements
    })

    if (previous) {
      const previousRecord = previous as unknown as Record<string, Record<string, number | undefined>>
      const previousValue = previousRecord?.[category]?.[field]
      const currentValue = parsed
      if (previousValue !== currentValue) {
        setChangedFields((prevSet) => new Set(prevSet).add(`${category}.${field}`))
      } else {
        setChangedFields((prevSet) => {
          const nextSet = new Set(prevSet)
          nextSet.delete(`${category}.${field}`)
          return nextSet
        })
      }
    }
  }

  const copyFromPrevious = () => {
    if (!previous) return
    const converted = structuredClone(previous) as unknown as Record<string, Record<string, number | undefined>>
    for (const category of Object.keys(converted)) {
      for (const field of Object.keys(converted[category])) {
        const current = converted[category][field]
        if (typeof current === "number") {
          converted[category][field] = fromCanonicalCm(toCanonicalCm(current, "cm"), unit)
        }
      }
    }
    setValues(converted as unknown as FullBodyMeasurements)
    setChangedFields(new Set())
  }

  const handleSave = async () => {
    if (!user || !clientId) return
    setSaving(true)
    try {
      // Convert display values to canonical cm before storage
      const canonical = structuredClone(values) as unknown as Record<string, Record<string, number | undefined>>
      for (const category of Object.keys(canonical)) {
        for (const field of Object.keys(canonical[category])) {
          const current = canonical[category][field]
          if (typeof current === "number") {
            canonical[category][field] = toCanonicalCm(current, unit)
          }
        }
      }

      await createMeasurement(user.uid, {
        clientId,
        version: 1,
        unit: "cm",
        values: canonical as unknown as FullBodyMeasurements,
        source: "designer",
        takenAt: new Date().toISOString(),
        notes: notes || null,
      })
      router.replace(`/client/${clientId}`)
    } catch (error) {
      console.log("Failed to save measurement", error)
    } finally {
      setSaving(false)
    }
  }

  const categories = Object.keys(values as unknown as Record<string, unknown>)

  return (
    <Screen padding={0}>
      <Stack.Screen
        options={{
          headerTitle: t("measurement_studio"),
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
      <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}>
        <Card>
          <View style={{ gap: Theme.spacing.md }}>
            <View style={{ gap: Theme.spacing.xs }}>
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                {t("type")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Theme.spacing.xs }}>
                {types.map((option) => (
                  <Chip key={option} label={t(option.toLowerCase())} selected={type === option} onPress={() => handleTypeChange(option)} />
                ))}
              </View>
            </View>

            <View style={{ gap: Theme.spacing.xs }}>
              <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.label }}>
                {t("measurement_unit")}
              </Text>
              <SegmentedControl
                options={[
                  { label: "cm", value: "cm" },
                  { label: "in", value: "in" },
                  { label: "yd", value: "yd" },
                ]}
                value={unit}
                onChange={handleUnitChange}
              />
            </View>
          </View>
        </Card>

        {previous && (
          <Button
            label={t("copy_from_previous")}
            onPress={copyFromPrevious}
            variant="secondary"
            fullWidth
          />
        )}

        <MeasurementDiagram type={type} activeCategory={expanded.size === 1 ? [...expanded][0] : undefined} />

        {categories.map((category) => {
          const fields = (values as unknown as Record<string, Record<string, number | undefined>>)[category] ?? {}
          const isOpen = expanded.has(category)
          return (
            <Card key={category} padded={false}>
              <View style={{ padding: Theme.spacing.md, gap: Theme.spacing.sm }}>
                <Text
                  onPress={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev)
                      if (next.has(category)) next.delete(category)
                      else next.add(category)
                      return next
                    })
                  }}
                  style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: Theme.fontSizes.h3 }}
                >
                  {t(category)} {isOpen ? "−" : "+"}
                </Text>
                {isOpen && (
                  <View style={{ gap: Theme.spacing.sm }}>
                    {Object.keys(fields).map((field) => (
                      <MeasurementRow
                        key={field}
                        label={t(field.replace(/([A-Z])/g, "_$1").toLowerCase())}
                        value={fields[field]}
                        unit={unit}
                        highlight={changedFields.has(`${category}.${field}`)}
                        onChangeText={(value) => updateField(category, field, value)}
                      />
                    ))}
                  </View>
                )}
              </View>
            </Card>
          )
        })}

        <Card>
          <View style={{ gap: Theme.spacing.sm }}>
            <TextField label={t("notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          </View>
        </Card>

        <Button label={t("save_measurement")} onPress={handleSave} loading={saving} fullWidth size="lg" />
      </ScrollView>
    </Screen>
  )
}
