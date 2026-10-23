import { Screen } from "@/components/ui/Screen"
import { CustomModal } from "@/components/ui/CustomModal"
import { REG_ADDED_EVENT, REG_DELETED_EVENT } from "@/components/ui/TabBar"
import Fire from "@/db/Fire"
import { auth } from "@/db/firebaseConfig"
import { useStorage } from "@/hooks/useStorage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Regs } from "@/interfaces/Regs"
import { useEffect, useState, useMemo } from "react"
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native"
import { useTranslation } from "react-i18next"

export default function User() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [regs, setRegs] = useState<Regs[]>([])
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false)
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { getItem, setItem } = useStorage()
  const { Theme } = useAppTheme()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  const user = auth.currentUser

  useEffect(() => {
    fetchRegs()

    const subscription = DeviceEventEmitter.addListener(REG_ADDED_EVENT, () => {
      fetchRegs()
    })

    return () => subscription.remove()
  }, [])

  const fetchRegs = async () => {
    try {
      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      setRegs(localRegs)
    } catch (error) {
      console.error("Failed to fetch regs", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAllPress = () => {
    setDeleteAllModalVisible(true)
  }

  const handleFirstConfirm = () => {
    setDeleteAllModalVisible(false)
    setConfirmDeleteModalVisible(true)
  }

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      const userId = user?.uid

      // Delete from Firebase
      if (userId) {
        for (const reg of regs) {
          try {
            await Fire.deleteReg("regs", reg.id)
          } catch (error) {
            console.log("Failed to delete from Firebase", reg.id, error)
          }
        }
      }

      // Clear local storage
      await setItem("regs", JSON.stringify([]))
      setRegs([])
      DeviceEventEmitter.emit(REG_DELETED_EVENT)

      Alert.alert(t("success"), t("all_records_deleted"))
    } catch (error) {
      console.error("Failed to delete all", error)
      Alert.alert(t("error"), t("failed_delete_all"))
    } finally {
      setIsDeleting(false)
      setConfirmDeleteModalVisible(false)
    }
  }

  // Calculate stats
  const totalRecords = regs.length
  const recordsByType = regs.reduce(
    (acc, reg) => {
      acc[reg.type] = (acc[reg.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const syncedRecords = regs.filter((r) => r.synced !== false).length
  const unsyncedRecords = regs.filter((r) => r.synced === false).length

  const parseTimestamp = (timestamp: string): Date => {
    // Parse "11/27/2025 09:15 AM" format
    const [datePart, timePart, period] = timestamp.split(" ")
    const [month, day, year] = datePart.split("/").map(Number)
    let [hours, minutes] = timePart.split(":").map(Number)
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return new Date(year, month - 1, day, hours, minutes)
  }

  const oldestRecord =
    regs.length > 0
      ? regs.reduce((oldest, reg) =>
          parseTimestamp(reg.timestamp) < parseTimestamp(oldest.timestamp) ? reg : oldest,
        )
      : null

  const newestRecord =
    regs.length > 0
      ? regs.reduce((newest, reg) =>
          parseTimestamp(reg.timestamp) > parseTimestamp(newest.timestamp) ? reg : newest,
        )
      : null

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("account")}</Text>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.email?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>

              <Text style={styles.userName}>{user?.displayName || t("user")}</Text>
              <Text style={styles.userEmail}>{user?.email || t("not_signed_in")}</Text>
              {user?.emailVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>{t("verified")}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("statistics")}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalRecords}</Text>
              <Text style={styles.statLabel}>{t("total_records")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{syncedRecords}</Text>
              <Text style={styles.statLabel}>{t("synced")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{unsyncedRecords}</Text>
              <Text style={styles.statLabel}>{t("pending_sync")}</Text>
            </View>
          </View>
        </View>

        {/* Records by Type */}
        {Object.keys(recordsByType).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("records_by_type")}</Text>
            <View style={styles.card}>
              {Object.entries(recordsByType).map(([type, count]) => (
                <View key={type} style={styles.typeRow}>
                  <Text style={styles.typeLabel}>{type}</Text>
                  <Text style={styles.typeCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline Info */}
        {regs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("timeline")}</Text>
            <View style={styles.card}>
              {oldestRecord && (
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineLabel}>{t("first_record")}</Text>
                  <Text style={styles.timelineValue}>{oldestRecord.timestamp.split(" ")[0]}</Text>
                </View>
              )}
              {newestRecord && (
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineLabel}>{t("latest_record")}</Text>
                  <Text style={styles.timelineValue}>{newestRecord.timestamp.split(" ")[0]}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Danger Zone */}
        {regs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Theme.colors.red }]}>
              {t("danger_zone")}
            </Text>
            <View style={[styles.card, styles.dangerCard]}>
              <Text style={styles.dangerDescription}>{t("danger_zone_desc")}</Text>
              <Pressable
                onPress={handleDeleteAllPress}
                disabled={isDeleting}
                style={({ pressed }) => [
                  styles.deleteButton,
                  { opacity: pressed || isDeleting ? 0.6 : 1 },
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>{t("delete_all_records")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* First Confirmation Modal */}
      <CustomModal
        title={t("delete_all_title")}
        description={t("delete_all_desc")}
        modalVisible={deleteAllModalVisible}
        onRequestClose={() => setDeleteAllModalVisible(false)}
        onAccept={handleFirstConfirm}
      />

      {/* Second Confirmation Modal */}
      <CustomModal
        title={`⚠️ ${t("final_confirmation")}`}
        description={t("final_confirmation_desc", { count: totalRecords })}
        modalVisible={confirmDeleteModalVisible}
        onRequestClose={() => setConfirmDeleteModalVisible(false)}
        onAccept={handleDeleteAll}
      />
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
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h4,
      color: Theme.colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: Theme.colors.background2,
      borderRadius: 16,
      padding: 16,
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: Theme.colors.accent,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    avatarText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: 24,
      color: Theme.colors.background,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      resizeMode: "contain",
    },
    userInfo: {
      gap: 4,
    },
    userName: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h3,
      color: Theme.colors.text,
    },
    userEmail: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
    },
    verifiedBadge: {
      backgroundColor: Theme.colors.green + "30",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginTop: 8,
    },
    verifiedText: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.green,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: Theme.colors.background2,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
    },
    statNumber: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h1,
      color: Theme.colors.accent,
    },
    statLabel: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h6,
      color: Theme.colors.lightGray,
      marginTop: 4,
      textAlign: "center",
    },
    typeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: Theme.colors.ultraLightGray,
    },
    typeLabel: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    typeCount: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.accent,
    },
    timelineRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    timelineLabel: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
    },
    timelineValue: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.text,
    },
    dangerCard: {
      borderWidth: 1,
      borderColor: Theme.colors.red + "50",
    },
    dangerDescription: {
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h5,
      color: Theme.colors.lightGray,
      marginBottom: 16,
    },
    deleteButton: {
      backgroundColor: Theme.colors.red,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
    },
    deleteButtonText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: Theme.sizes.h5,
      color: "#fff",
    },
  })
