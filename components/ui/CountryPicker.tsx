import { useMemo, useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { COUNTRIES, findCountry, type CountryOption } from "@/libs/countries"
import { CheckIcon, CloseIcon, SearchIcon } from "@/icons/Icons"
import { Card } from "./Card"
import { Flag } from "./Flag"
import { TextField } from "./TextField"

export interface CountryPickerProps {
  value: string
  onChange: (code: string) => void
  label?: string
  hint?: string
  disabled?: boolean
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export function CountryPicker({ value, onChange, label, hint, disabled }: CountryPickerProps) {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = findCountry(value)
  const results = useMemo(() => {
    const term = normalize(query.trim())
    if (!term) return COUNTRIES
    return COUNTRIES.filter(
      (country) =>
        normalize(country.name).includes(term) ||
        country.currency.toLowerCase().includes(term) ||
        country.code.includes(term),
    )
  }, [query])

  const handleSelect = (country: CountryOption) => {
    onChange(country.code)
    setOpen(false)
    setQuery("")
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.label,
          }}
        >
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.trigger,
          {
            backgroundColor: Theme.semantic.bg.sunken,
            borderColor: Theme.semantic.border.subtle,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        {selected ? <Flag code={selected.code} size={24} /> : null}
        <View style={styles.triggerCopy}>
          <Text
            style={{
              color: Theme.semantic.text.primary,
              fontFamily: Theme.fonts.onestBold,
              fontSize: Theme.fontSizes.body,
            }}
            numberOfLines={1}
          >
            {selected?.name ?? t("select_region")}
          </Text>
          <Text
            style={{
              color: Theme.semantic.text.secondary,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.fontSizes.caption,
            }}
          >
            {selected ? selected.currency : ""}
          </Text>
        </View>
        <Text
          style={{
            color: Theme.semantic.accent.primary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: Theme.fontSizes.label,
          }}
        >
          {t("change")}
        </Text>
      </Pressable>

      {hint && (
        <Text
          style={{
            color: Theme.semantic.text.secondary,
            fontFamily: Theme.fonts.onest,
            fontSize: Theme.fontSizes.caption,
          }}
        >
          {hint}
        </Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.backdrop, { backgroundColor: Theme.semantic.overlay }]}>
          <Card
            padded={false}
            style={[
              styles.sheet,
              { marginTop: insets.top + 24, marginBottom: insets.bottom + 24 },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text
                style={{
                  flex: 1,
                  color: Theme.semantic.text.primary,
                  fontFamily: Theme.fonts.display,
                  fontSize: Theme.fontSizes.h2,
                }}
              >
                {t("region_and_currency")}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel={t("close")}
                hitSlop={10}
              >
                <CloseIcon size={22} color={Theme.semantic.text.secondary} />
              </Pressable>
            </View>

            <View style={styles.search}>
              <TextField
                value={query}
                onChangeText={setQuery}
                placeholder={t("search_country")}
                autoCorrect={false}
                leftIcon={<SearchIcon size={18} color={Theme.semantic.text.secondary} />}
              />
            </View>

            <FlatList
              data={results}
              keyExtractor={(country) => country.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              contentContainerStyle={{ paddingBottom: Theme.spacing.sm }}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: Theme.semantic.border.subtle,
                    marginLeft: 54,
                  }}
                />
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    padding: Theme.spacing.lg,
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                    textAlign: "center",
                  }}
                >
                  {t("search_no_results_desc")}
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.code === selected?.code
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && { backgroundColor: Theme.semantic.bg.sunken },
                    ]}
                  >
                    <Flag code={item.code} size={28} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: Theme.semantic.text.primary,
                          fontFamily: isSelected ? Theme.fonts.onestBold : Theme.fonts.onest,
                          fontSize: Theme.fontSizes.body,
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: Theme.semantic.text.secondary,
                          fontFamily: Theme.fonts.onest,
                          fontSize: Theme.fontSizes.caption,
                          letterSpacing: 0.4,
                        }}
                      >
                        {item.currency}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckIcon size={20} color={Theme.semantic.accent.primary} />
                    )}
                  </Pressable>
                )
              }}
            />
          </Card>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6, width: "100%" },
  trigger: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  triggerCopy: { flex: 1, gap: 1 },
  backdrop: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sheet: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  search: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { flex: 1 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
  },
})
