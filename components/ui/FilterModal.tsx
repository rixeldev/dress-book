import { useAppTheme } from "@/hooks/useAppTheme"
import { RegType } from "@/interfaces/Regs"
import { CloseIcon, ClothIcon, CurtainIcon, PackageIcon } from "@/icons/Icons"
import { useMemo, useState, useEffect } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useTranslation } from "react-i18next"

export type SortOption = "newest" | "oldest" | "title_asc" | "title_desc"

export interface FilterOptions {
  types: RegType[]
  sortBy: SortOption
  syncStatus: "all" | "synced" | "unsynced"
  deliveryStatus: "all" | "delivered" | "undelivered"
}

interface Props {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  initialFilters: FilterOptions
}

export const defaultFilters: FilterOptions = {
  types: [],
  sortBy: "newest",
  syncStatus: "all",
  deliveryStatus: "all",
}

export function FilterModal({ visible, onClose, onApply, initialFilters }: Props) {
  const { Theme } = useAppTheme()
  const { t } = useTranslation()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  const [selectedTypes, setSelectedTypes] = useState<RegType[]>(initialFilters.types)
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy)
  const [syncStatus, setSyncStatus] = useState<"all" | "synced" | "unsynced">(
    initialFilters.syncStatus
  )
  const [deliveryStatus, setDeliveryStatus] = useState<"all" | "delivered" | "undelivered">(
    initialFilters.deliveryStatus
  )

  useEffect(() => {
    setSelectedTypes(initialFilters.types)
    setSortBy(initialFilters.sortBy)
    setSyncStatus(initialFilters.syncStatus)
    setDeliveryStatus(initialFilters.deliveryStatus)
  }, [initialFilters, visible])

  const toggleType = (type: RegType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleApply = () => {
    onApply({ types: selectedTypes, sortBy, syncStatus, deliveryStatus })
    onClose()
  }

  const handleReset = () => {
    setSelectedTypes([])
    setSortBy("newest")
    setSyncStatus("all")
    setDeliveryStatus("all")
  }

  const typeOptions: { type: RegType; icon: React.ReactNode; label: string }[] = [
    { type: "Clothes", icon: <ClothIcon size={20} color={Theme.colors.text} />, label: t("clothes") },
    { type: "Curtains", icon: <CurtainIcon size={20} color={Theme.colors.text} />, label: t("curtains") },
    { type: "Others", icon: <PackageIcon size={20} color={Theme.colors.text} />, label: t("others") },
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: t("newest_first") },
    { value: "oldest", label: t("oldest_first") },
    { value: "title_asc", label: t("title_asc") },
    { value: "title_desc", label: t("title_desc") },
  ]

  const syncOptions: { value: "all" | "synced" | "unsynced"; label: string }[] = [
    { value: "all", label: t("all") },
    { value: "synced", label: t("synced") },
    { value: "unsynced", label: t("pending_sync") },
  ]

  const deliveryOptions: {
    value: "all" | "delivered" | "undelivered"
    label: string
  }[] = [
    { value: "all", label: t("all") },
    { value: "delivered", label: t("delivered_only") },
    { value: "undelivered", label: t("undelivered_only") },
  ]

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("filters")}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <CloseIcon size={24} color={Theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("type")}</Text>
              <View style={styles.optionsRow}>
                {typeOptions.map(({ type, icon, label }) => (
                  <Pressable
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[
                      styles.typeChip,
                      selectedTypes.includes(type) && styles.typeChipSelected,
                    ]}
                  >
                    {icon}
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedTypes.includes(type) && styles.typeChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("sort_by")}</Text>
              <View style={styles.optionsColumn}>
                {sortOptions.map(({ value, label }) => (
                  <Pressable
                    key={value}
                    onPress={() => setSortBy(value)}
                    style={[
                      styles.radioOption,
                      sortBy === value && styles.radioOptionSelected,
                    ]}
                  >
                    <View style={styles.radioOuter}>
                      {sortBy === value && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Sync Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("sync_status")}</Text>
              <View style={styles.optionsRow}>
                {syncOptions.map(({ value, label }) => (
                  <Pressable
                    key={value}
                    onPress={() => setSyncStatus(value)}
                    style={[
                      styles.syncChip,
                      syncStatus === value && styles.syncChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.syncChipText,
                        syncStatus === value && styles.syncChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Delivery Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("delivery_status")}</Text>
              <View style={styles.optionsRow}>
                {deliveryOptions.map(({ value, label }) => (
                  <Pressable
                    key={value}
                    onPress={() => setDeliveryStatus(value)}
                    style={[
                      styles.syncChip,
                      deliveryStatus === value && styles.syncChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.syncChipText,
                        deliveryStatus === value && styles.syncChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.resetButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.resetButtonText}>{t("reset")}</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [
                styles.applyButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.applyButtonText}>{t("apply_filters")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Theme.colors.backdrop,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: Theme.colors.modal,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h2,
      color: Theme.colors.text,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
      marginBottom: 12,
    },
    optionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    optionsColumn: {
      gap: 8,
    },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
      borderWidth: 2,
      borderColor: Theme.colors.transparent,
    },
    typeChipSelected: {
      borderColor: Theme.colors.accent,
      backgroundColor: Theme.colors.primary2,
    },
    typeChipText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    typeChipTextSelected: {
      color: Theme.colors.accent,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
    },
    radioOptionSelected: {
      backgroundColor: Theme.colors.primary2,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: Theme.colors.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Theme.colors.accent,
    },
    radioLabel: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    syncChip: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
      borderWidth: 2,
      borderColor: Theme.colors.transparent,
    },
    syncChipSelected: {
      borderColor: Theme.colors.accent,
      backgroundColor: Theme.colors.primary2,
    },
    syncChipText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    syncChipTextSelected: {
      color: Theme.colors.accent,
    },
    footer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    resetButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
      alignItems: "center",
    },
    resetButtonText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    applyButton: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: Theme.colors.accent,
      alignItems: "center",
    },
    applyButtonText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.background,
    },
  })

