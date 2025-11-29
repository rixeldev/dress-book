import { Screen } from "@/components/ui/Screen"
import Fire from "@/db/Fire"
import { auth } from "@/db/firebaseConfig"
import { useStorage } from "@/hooks/useStorage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { BackIcon, ClothIcon, CurtainIcon, PackageIcon } from "@/icons/Icons"
import {
  FullBodyMeasurements,
  ClothesMeasurements,
  CurtainMeasurements,
  OtherMeasurements,
} from "@/interfaces/FullBodyMeasurements"
import { Regs, RegType } from "@/interfaces/Regs"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState, useMemo } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useTranslation } from "react-i18next"
import { useInterstitialAd } from "@/hooks/useInterstitialAd"

// Category translation keys for each type
const clothesCategoryKeys: Record<keyof ClothesMeasurements, string> = {
  headAndNeck: "head_and_neck",
  upperTorso: "upper_torso",
  midTorso: "mid_torso",
  arms: "arms",
  hipsAndPelvis: "hips_and_pelvis",
  legs: "legs",
  feet: "feet",
}

const curtainCategoryKeys: Record<keyof CurtainMeasurements, string> = {
  dimensions: "dimensions",
  details: "details",
  hardware: "hardware",
}

const otherCategoryKeys: Record<keyof OtherMeasurements, string> = {
  general: "general",
  custom: "custom",
}

// Empty measurements for each type
const emptyClothesMeasurements: ClothesMeasurements = {
  headAndNeck: {
    headCircumference: undefined,
    neckCircumference: undefined,
    neckHeight: undefined,
  },
  upperTorso: {
    shoulderWidth: undefined,
    chestWidth: undefined,
    shoulderLength: undefined,
    bustCircumference: undefined,
    underbustCircumference: undefined,
    bustSpan: undefined,
    bustHeight: undefined,
  },
  midTorso: {
    waistCircumference: undefined,
    frontWaistLength: undefined,
    backWaistLength: undefined,
    sideSeamLength: undefined,
  },
  arms: {
    armholeCircumference: undefined,
    sleeveLength: undefined,
    elbowLength: undefined,
    bicepCircumference: undefined,
    elbowCircumference: undefined,
    wristCircumference: undefined,
    handCircumference: undefined,
  },
  hipsAndPelvis: {
    highHipCircumference: undefined,
    lowHipCircumference: undefined,
    hipHeight: undefined,
    totalCrotchLength: undefined,
    seatedCrotchDepth: undefined,
  },
  legs: {
    outseam: undefined,
    inseam: undefined,
    thighCircumference: undefined,
    kneeCircumference: undefined,
    kneeHeight: undefined,
    calfCircumference: undefined,
    ankleCircumference: undefined,
  },
  feet: {
    footLength: undefined,
    footWidth: undefined,
    instepCircumference: undefined,
  },
}

const emptyCurtainMeasurements: CurtainMeasurements = {
  dimensions: {
    width: undefined,
    height: undefined,
    dropLength: undefined,
  },
  details: {
    headerType: undefined,
    hemAllowance: undefined,
    sideHemAllowance: undefined,
    fullness: undefined,
    numberOfPanels: undefined,
  },
  hardware: {
    rodWidth: undefined,
    rodHeight: undefined,
    bracketProjection: undefined,
  },
}

const emptyOtherMeasurements: OtherMeasurements = {
  general: {
    length: undefined,
    width: undefined,
    height: undefined,
    depth: undefined,
    circumference: undefined,
    diameter: undefined,
  },
  custom: {
    measurement1: undefined,
    measurement2: undefined,
    measurement3: undefined,
    measurement4: undefined,
    measurement5: undefined,
  },
}

// Measurement field translation keys
const measurementKeys: Record<string, string> = {
  // Clothes
  headCircumference: "head_circumference",
  neckCircumference: "neck_circumference",
  neckHeight: "neck_height",
  shoulderWidth: "shoulder_width",
  chestWidth: "chest_width",
  shoulderLength: "shoulder_length",
  bustCircumference: "bust_circumference",
  underbustCircumference: "underbust_circumference",
  bustSpan: "bust_span",
  bustHeight: "bust_height",
  waistCircumference: "waist_circumference",
  frontWaistLength: "front_waist_length",
  backWaistLength: "back_waist_length",
  sideSeamLength: "side_seam_length",
  armholeCircumference: "armhole_circumference",
  sleeveLength: "sleeve_length",
  elbowLength: "elbow_length",
  bicepCircumference: "bicep_circumference",
  elbowCircumference: "elbow_circumference",
  wristCircumference: "wrist_circumference",
  handCircumference: "hand_circumference",
  highHipCircumference: "high_hip_circumference",
  lowHipCircumference: "low_hip_circumference",
  hipHeight: "hip_height",
  totalCrotchLength: "total_crotch_length",
  seatedCrotchDepth: "seated_crotch_depth",
  outseam: "outseam",
  inseam: "inseam",
  thighCircumference: "thigh_circumference",
  kneeCircumference: "knee_circumference",
  kneeHeight: "knee_height",
  calfCircumference: "calf_circumference",
  ankleCircumference: "ankle_circumference",
  footLength: "foot_length",
  footWidth: "foot_width",
  instepCircumference: "instep_circumference",
  // Curtains
  width: "width",
  height: "height",
  dropLength: "drop_length",
  headerType: "header_type",
  hemAllowance: "hem_allowance",
  sideHemAllowance: "side_hem_allowance",
  fullness: "fullness",
  numberOfPanels: "number_of_panels",
  rodWidth: "rod_width",
  rodHeight: "rod_height",
  bracketProjection: "bracket_projection",
  // Others
  length: "length",
  depth: "depth",
  circumference: "circumference",
  diameter: "diameter",
  measurement1: "measurement_1",
  measurement2: "measurement_2",
  measurement3: "measurement_3",
  measurement4: "measurement_4",
  measurement5: "measurement_5",
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { Theme } = useAppTheme()
  const { getItem, setItem } = useStorage()
  const { t } = useTranslation()
  const { showAdIfEligible } = useInterstitialAd()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  const [reg, setReg] = useState<Regs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedMeasurements, setEditedMeasurements] = useState<FullBodyMeasurements | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReg()
    showAdIfEligible()
  }, [id])

  const getEmptyMeasurementsForType = (type?: RegType): FullBodyMeasurements => {
    switch (type) {
      case "Clothes":
        return emptyClothesMeasurements
      case "Curtains":
        return emptyCurtainMeasurements
      case "Others":
      default:
        return emptyOtherMeasurements
    }
  }

  const getCategoryKeysForType = (type?: RegType): Record<string, string> => {
    switch (type) {
      case "Clothes":
        return clothesCategoryKeys
      case "Curtains":
        return curtainCategoryKeys
      case "Others":
      default:
        return otherCategoryKeys
    }
  }

  const getMergedMeasurements = (
    measurements: FullBodyMeasurements | undefined,
    type?: RegType,
  ): FullBodyMeasurements => {
    const empty = getEmptyMeasurementsForType(type)
    const result: Record<string, Record<string, number | undefined>> = {}
    const measurementsRecord = measurements as unknown as
      | Record<string, Record<string, number | undefined>>
      | undefined

    for (const [category, fields] of Object.entries(empty)) {
      result[category] = {
        ...(fields as Record<string, number | undefined>),
        ...(measurementsRecord?.[category] || {}),
      }
    }

    return result as unknown as FullBodyMeasurements
  }

  const loadReg = async () => {
    try {
      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      const found = localRegs.find((r) => r.id === id)
      if (found) {
        setReg(found)
        const mergedMeasurements = getMergedMeasurements(found.measurements, found.type)
        setEditedMeasurements(mergedMeasurements)
        // Auto-expand categories that have values
        const categoriesWithValues = new Set<string>()
        Object.entries(mergedMeasurements).forEach(([category, values]) => {
          if (Object.values(values as object).some((v) => v !== undefined && v !== null)) {
            categoriesWithValues.add(category)
          }
        })
        setExpandedCategories(categoriesWithValues)
      }
    } catch (error) {
      console.error("Failed to load reg", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const updateMeasurement = (category: string, field: string, value: string) => {
    if (!editedMeasurements) return
    const numValue = value === "" ? undefined : parseFloat(value)
    const currentMeasurements = editedMeasurements as unknown as Record<
      string,
      Record<string, number | undefined>
    >
    setEditedMeasurements({
      ...editedMeasurements,
      [category]: {
        ...currentMeasurements[category],
        [field]: isNaN(numValue as number) ? undefined : numValue,
      },
    } as unknown as FullBodyMeasurements)
  }

  // Remove undefined values for Firebase compatibility
  const cleanMeasurementsForFirebase = (
    measurements: FullBodyMeasurements,
  ): FullBodyMeasurements => {
    const cleaned: Record<string, Record<string, number>> = {}
    const measurementsRecord = measurements as unknown as Record<
      string,
      Record<string, number | undefined>
    >
    for (const [category, fields] of Object.entries(measurementsRecord)) {
      cleaned[category] = {}
      for (const [field, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          cleaned[category][field] = value
        }
      }
    }
    return cleaned as unknown as FullBodyMeasurements
  }

  const handleSave = async () => {
    if (!reg || !editedMeasurements) return
    setIsSaving(true)

    try {
      const cleanedMeasurements = cleanMeasurementsForFirebase(editedMeasurements)
      const updatedReg = { ...reg, measurements: cleanedMeasurements }
      const userId = auth.currentUser?.uid

      // Update Firebase
      if (userId && reg.synced !== false) {
        try {
          await Fire.insertReg("regs", reg.id, updatedReg)
        } catch (error) {
          console.log("Failed to update in Firebase", error)
        }
      }

      // Update local storage
      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      const updatedRegs = localRegs.map((r) => (r.id === reg.id ? updatedReg : r))
      await setItem("regs", JSON.stringify(updatedRegs))

      setReg(updatedReg)
      setEditedMeasurements(getMergedMeasurements(updatedReg.measurements, updatedReg.type))
      setIsEditing(false)
      Alert.alert(t("success"), t("measurements_saved"))
    } catch (error) {
      console.error("Failed to save", error)
      Alert.alert(t("error"), t("failed_save_measurements"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedMeasurements(getMergedMeasurements(reg?.measurements, reg?.type))
    setIsEditing(false)
  }

  const categoryKeys = getCategoryKeysForType(reg?.type)

  const getTypeIcon = (type?: RegType) => {
    switch (type) {
      case "Clothes":
        return <ClothIcon size={24} color={Theme.colors.accent} />
      case "Curtains":
        return <CurtainIcon size={24} color={Theme.colors.accent} />
      default:
        return <PackageIcon size={24} color={Theme.colors.accent} />
    }
  }

  const getUnit = (type?: RegType) => {
    switch (type) {
      case "Clothes":
        return "cm"
      case "Curtains":
        return "yd"
      case "Others":
      default:
        return "in"
    }
  }

  const unit = getUnit(reg?.type)

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    )
  }

  if (!reg) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{t("record_not_found")}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("go_back")}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Screen padding={0}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBackBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <BackIcon size={28} color={Theme.colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          {getTypeIcon(reg.type)}
          <View>
            <Text style={styles.headerTitle}>{reg.title}</Text>
            <Text style={styles.headerDate}>{reg.timestamp}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {reg.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{reg.description}</Text>
          </View>
        )}

        {/* Delivery Info */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>{t("delivery_deadline")}</Text>
            <Text style={styles.deliveryValue}>{reg.deliveryDeadline || t("deadline_not_set")}</Text>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>{t("delivery_status")}</Text>
            <Text
              style={[
                styles.deliveryStatus,
                reg.delivered ? styles.deliveryStatusDelivered : styles.deliveryStatusPending,
              ]}
            >
              {reg.delivered ? t("delivered") : t("undelivered")}
            </Text>
          </View>
        </View>

        {/* Edit Toggle */}
        <View style={styles.editToggleRow}>
          <Text style={styles.sectionTitle}>{t("measurements")}</Text>
          {!isEditing ? (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.editBtnText}>{t("edit")}</Text>
            </Pressable>
          ) : (
            <View style={styles.editActions}>
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.cancelBtnText}>{t("cancel")}</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveBtn,
                  { opacity: pressed || isSaving ? 0.7 : 1 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Theme.colors.background} />
                ) : (
                  <Text style={styles.saveBtnText}>{t("save")}</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Measurement Categories */}
        {editedMeasurements &&
          Object.keys(categoryKeys).map((category) => {
            const categoryData = (
              editedMeasurements as unknown as Record<string, Record<string, number | undefined>>
            )[category]
            if (!categoryData) return null
            const isExpanded = expandedCategories.has(category)
            const hasValues = Object.values(categoryData).some((v) => v !== undefined && v !== null)

            return (
              <View key={category} style={styles.categoryCard}>
                <Pressable onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
                  <View style={styles.categoryTitleRow}>
                    <Text style={styles.categoryTitle}>{t(categoryKeys[category])}</Text>
                    {hasValues && <View style={styles.hasValuesDot} />}
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
                </Pressable>

                {isExpanded && (
                  <View style={styles.measurementsList}>
                    {Object.keys(categoryData as object).map((field) => {
                      const value = (categoryData as Record<string, number | undefined>)[field]
                      return (
                        <View key={field} style={styles.measurementRow}>
                          <Text style={styles.measurementLabel}>
                            {t(measurementKeys[field] || field)}
                          </Text>
                          {isEditing ? (
                            <TextInput
                              style={styles.measurementInput}
                              value={value?.toString() || ""}
                              onChangeText={(text) => updateMeasurement(category, field, text)}
                              keyboardType="decimal-pad"
                              placeholder={unit}
                              placeholderTextColor={Theme.colors.lightGray}
                            />
                          ) : (
                            <Text style={styles.measurementValue}>
                              {value !== undefined ? `${value} ${unit}` : unit}
                            </Text>
                          )}
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )
          })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Theme.colors.background,
    },
    errorText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
      marginBottom: 16,
    },
    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: Theme.colors.accent,
      borderRadius: 12,
    },
    backButtonText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingTop: 28,
      gap: 12,
    },
    headerBackBtn: {
      padding: 4,
    },
    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerTitle: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h2,
      color: Theme.colors.text,
    },
    headerDate: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.lightGray,
    },
    descriptionCard: {
      marginHorizontal: 16,
      marginBottom: 20,
      padding: 16,
      backgroundColor: Theme.colors.background2,
      borderRadius: 12,
    },
    descriptionText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
      lineHeight: 22,
    },
    deliveryCard: {
      marginHorizontal: 16,
      marginBottom: 20,
      padding: 16,
      backgroundColor: Theme.colors.background2,
      borderRadius: 12,
      gap: 12,
    },
    deliveryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    deliveryLabel: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
    },
    deliveryValue: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    deliveryStatus: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 20,
      overflow: "hidden",
    },
    deliveryStatusDelivered: {
      backgroundColor: Theme.colors.primary2,
      color: Theme.colors.accent,
    },
    deliveryStatusPending: {
      backgroundColor: Theme.colors.background,
      color: Theme.colors.text,
    },
    editToggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h4,
      color: Theme.colors.text,
    },
    editBtn: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: Theme.colors.primary2,
      borderRadius: 8,
    },
    editBtnText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.accent,
    },
    editActions: {
      flexDirection: "row",
      gap: 8,
    },
    cancelBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: Theme.colors.background2,
      borderRadius: 8,
    },
    cancelBtnText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.text,
    },
    saveBtn: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: Theme.colors.accent,
      borderRadius: 8,
      minWidth: 60,
      alignItems: "center",
    },
    saveBtnText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.background,
    },
    categoryCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: Theme.colors.background2,
      borderRadius: 16,
      overflow: "hidden",
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    categoryTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categoryTitle: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    hasValuesDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Theme.colors.accent,
    },
    expandIcon: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: 20,
      color: Theme.colors.lightGray,
    },
    measurementsList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    measurementRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Theme.colors.ultraLightGray,
    },
    measurementLabel: {
      flex: 1,
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.lightGray,
    },
    measurementValue: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
      minWidth: 80,
      textAlign: "right",
    },
    measurementInput: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
      minWidth: 80,
      textAlign: "right",
      backgroundColor: Theme.colors.background,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    scrollViewContent: {
      paddingTop: 10,
    },
  })
