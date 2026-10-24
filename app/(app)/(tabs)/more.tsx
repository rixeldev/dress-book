import { REG_ADDED_EVENT, REG_DELETED_EVENT } from "@/components/ui/TabBar"
import Fire from "@/db/Fire"
import { auth } from "@/db/firebaseConfig"
import { useStorage } from "@/hooks/useStorage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { Regs } from "@/interfaces/Regs"
import { useEffect, useState } from "react"
import {
  Alert,
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import {
  Avatar,
  Badge,
  Button,
  Card,
  CustomModal,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  StatCard,
} from "@/components/ui"
import {
  CalendarIcon,
  ChevronRightIcon,
  CogIcon,
  ImageIcon,
  TrashIcon,
} from "@/icons/Icons"

export default function StudioScreen() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [regs, setRegs] = useState<Regs[]>([])
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false)
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { getItem, setItem } = useStorage()
  const { Theme } = useAppTheme()

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

      if (userId) {
        for (const reg of regs) {
          try {
            await Fire.deleteReg("regs", reg.id)
          } catch (error) {
            console.log("Failed to delete from Firebase", reg.id, error)
          }
        }
      }

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
      <Screen>
        <View style={{ gap: Theme.spacing.md }}>
          <Skeleton width="42%" height={38} />
          <Skeleton height={110} radius={20} />
          <Skeleton height={86} radius={20} />
        </View>
      </Screen>
    )
  }

  const displayName = user?.displayName || t("user")

  return (
    <Screen padding={0}>
      <ScrollView
        contentContainerStyle={{
          padding: Theme.spacing.gutter,
          paddingBottom: 140,
          gap: Theme.spacing.section,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          overline={t("manage_studio")}
          title={t("studio")}
          right={
            <IconButton
              icon={<CogIcon size={20} color={Theme.semantic.text.primary} />}
              accessibilityLabel={t("settings")}
              onPress={() => router.push("/settings")}
              variant="surface"
            />
          }
        />

        <Card onPress={() => router.push("/settings")} style={styles.profile}>
          <View style={styles.profileRow}>
            <Avatar name={displayName} imageUrl={user?.photoURL} size="xl" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: Theme.semantic.text.primary,
                  fontFamily: Theme.fonts.display,
                  fontSize: Theme.fontSizes.h2,
                }}
              >
                {displayName}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: Theme.semantic.text.secondary,
                  fontFamily: Theme.fonts.onest,
                  fontSize: Theme.fontSizes.label,
                }}
              >
                {user?.email || t("not_signed_in")}
              </Text>
            </View>
            {user?.emailVerified && <Badge label={t("verified")} tone="success" dot />}
            <ChevronRightIcon size={18} color={Theme.semantic.text.tertiary} />
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard label={t("total_records")} value={totalRecords} style={styles.stat} />
          <StatCard
            label={t("synced")}
            value={syncedRecords}
            tone="sunken"
            style={styles.stat}
          />
          <StatCard
            label={t("pending_sync")}
            value={unsyncedRecords}
            tone="sunken"
            style={styles.stat}
          />
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("quick_actions")} />
          <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
            <ListRow
              title={t("designs")}
              description={t("designs_empty_desc")}
              onPress={() => router.push("/designs")}
              chevron
              leading={<ImageIcon size={20} color={Theme.semantic.accent.primary} />}
            />
            <ListRow
              title={t("calendar")}
              description={t("calendar_empty_desc")}
              onPress={() => router.push("/calendar")}
              chevron
              leading={<CalendarIcon size={20} color={Theme.semantic.accent.primary} />}
            />
            <ListRow
              title={t("settings")}
              description={t("preferences")}
              onPress={() => router.push("/settings")}
              chevron
              leading={<CogIcon size={20} color={Theme.semantic.accent.primary} />}
            />
          </Card>
        </View>

        {Object.keys(recordsByType).length > 0 && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader
              title={t("records_by_type")}
              description={t("legacy_records_desc")}
            />
            <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
              {Object.entries(recordsByType).map(([type, count], index, list) => (
                <ListRow
                  key={type}
                  title={type}
                  divider={index < list.length - 1}
                  leading={
                    <View
                      style={[
                        styles.typeDot,
                        { backgroundColor: Theme.semantic.accent.brass },
                      ]}
                    />
                  }
                  trailing={
                    <Text
                      style={{
                        color: Theme.semantic.accent.primary,
                        fontFamily: Theme.fonts.display,
                        fontSize: Theme.fontSizes.h3,
                      }}
                    >
                      {count}
                    </Text>
                  }
                />
              ))}
            </Card>
          </View>
        )}

        {regs.length > 0 && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader title={t("timeline")} />
            <Card style={{ gap: Theme.spacing.sm }}>
              {oldestRecord && (
                <View style={styles.timelineRow}>
                  <Text style={[styles.timelineLabel, { color: Theme.semantic.text.secondary }]}>
                    {t("first_record")}
                  </Text>
                  <Text style={[styles.timelineValue, { color: Theme.semantic.text.primary }]}>
                    {oldestRecord.timestamp.split(" ")[0]}
                  </Text>
                </View>
              )}
              {newestRecord && (
                <View style={styles.timelineRow}>
                  <Text style={[styles.timelineLabel, { color: Theme.semantic.text.secondary }]}>
                    {t("latest_record")}
                  </Text>
                  <Text style={[styles.timelineValue, { color: Theme.semantic.text.primary }]}>
                    {newestRecord.timestamp.split(" ")[0]}
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {regs.length > 0 && (
          <View style={{ gap: Theme.spacing.sm }}>
            <SectionHeader
              title={t("danger_zone")}
              description={t("danger_zone_desc")}
            />
            <Card
              style={{
                gap: Theme.spacing.md,
                borderColor: `${Theme.semantic.state.danger}55`,
              }}
            >
              <View style={styles.dangerRow}>
                <TrashIcon size={20} color={Theme.semantic.state.danger} />
                <Text
                  style={{
                    flex: 1,
                    color: Theme.semantic.text.secondary,
                    fontFamily: Theme.fonts.onest,
                    fontSize: Theme.fontSizes.label,
                    lineHeight: Theme.lineHeights.label,
                  }}
                >
                  {t("danger_zone_desc")}
                </Text>
              </View>
              <Button
                label={t("delete_all_records")}
                onPress={handleDeleteAllPress}
                variant="danger"
                loading={isDeleting}
                fullWidth
              />
            </Card>
          </View>
        )}

        <Button
          label={t("settings")}
          onPress={() => router.push("/settings")}
          variant="ghost"
        />
      </ScrollView>

      <CustomModal
        title={t("delete_all_title")}
        description={t("delete_all_desc")}
        modalVisible={deleteAllModalVisible}
        onRequestClose={() => setDeleteAllModalVisible(false)}
        onAccept={handleFirstConfirm}
      />

      <CustomModal
        title={t("final_confirmation")}
        description={t("final_confirmation_desc", { count: totalRecords })}
        modalVisible={confirmDeleteModalVisible}
        onRequestClose={() => setConfirmDeleteModalVisible(false)}
        onAccept={handleDeleteAll}
        acceptLabel={t("delete")}
        destructive
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  profile: {
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    padding: 14,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineLabel: {
    fontFamily: "Onest",
    fontSize: 13,
  },
  timelineValue: {
    fontFamily: "OnestBold",
    fontSize: 13,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
})
