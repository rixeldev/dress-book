import { RegsCard } from "@/components/RegsCard"
import { WhiteSpace } from "@/components/ui/WhiteSpace"
import { CustomModal } from "@/components/ui/CustomModal"
import { AddRegModal } from "@/components/ui/AddRegModal"
import { FilterModal, FilterOptions, defaultFilters } from "@/components/ui/FilterModal"
import { REG_ADDED_EVENT, REG_DELETED_EVENT } from "@/components/ui/TabBar"
import Fire from "@/db/Fire"
import { auth } from "@/db/firebaseConfig"
import { useStorage } from "@/hooks/useStorage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { FilterIcon, ReloadIcon } from "@/icons/Icons"
import { Regs } from "@/interfaces/Regs"
import { useEffect, useState, useMemo } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  DeviceEventEmitter,
} from "react-native"
import { Screen } from "@/components/ui/Screen"
import { useTranslation } from "react-i18next"

export default function Index() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [regs, setRegs] = useState<Regs[] | null>([])
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [regToDelete, setRegToDelete] = useState<string | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [regToEdit, setRegToEdit] = useState<Regs | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const { getItem, setItem } = useStorage()
  const { Theme } = useAppTheme()

  useEffect(() => {
    fetchRegs()

    const addSubscription = DeviceEventEmitter.addListener(REG_ADDED_EVENT, () => {
      fetchRegs()
    })
    const deleteSubscription = DeviceEventEmitter.addListener(REG_DELETED_EVENT, () => {
      fetchRegs()
    })

    return () => {
      addSubscription.remove()
      deleteSubscription.remove()
    }
  }, [])

  const fetchRegs = async () => {
    setRefreshing(true)
    // Don't set isLoading to true if we are just refreshing, to avoid flashing if we have data
    if (!regs || regs.length === 0) setIsLoading(true)

    try {
      const userId = auth.currentUser?.uid

      // 1. Load Local Data first
      const localData = await getItem("regs")
      let localRegs: Regs[] = localData ? JSON.parse(localData) : []

      // If we have no state yet, show local immediately
      if (!regs || regs.length === 0) {
        setRegs(localRegs)
        setIsLoading(false)
      }

      if (!userId) {
        setRefreshing(false)
        return
      }

      // 2. Sync Offline Records
      const unsynced = localRegs.filter((r) => !r.synced)
      let syncOccurred = false

      if (unsynced.length > 0) {
        for (const reg of unsynced) {
          try {
            const regToUpload = { ...reg, userId: userId }
            // Remove synced property before uploading if you don't want it in DB
            const { synced, ...regData } = regToUpload
            await Fire.insertReg("regs", reg.id, regData as Regs)

            reg.synced = true
            reg.userId = userId
            syncOccurred = true
          } catch (e) {
            console.log("Sync failed for", reg.id, e)
          }
        }

        if (syncOccurred) {
          await setItem("regs", JSON.stringify(localRegs))
          setRegs([...localRegs])
        }
      }

      // 3. Fetch Remote
      const remoteData = await Fire.getRegs("regs", userId)
      const remoteRegs = (remoteData as Regs[]) || []

      // 4. Merge
      // We prioritize remote regs, but keep local unsynced ones.
      const mergedRegs = [...remoteRegs]
      const remoteIds = new Set(remoteRegs.map((r) => r.id))

      // Add unsynced local regs that are not in remote
      for (const r of localRegs) {
        if (!r.synced && !remoteIds.has(r.id)) {
          mergedRegs.push(r)
        }
      }

      // Sort by timestamp desc (parse "MM/DD/YYYY HH:MM AM/PM" format)
      mergedRegs.sort((a, b) => {
        const parseTs = (ts: string) => {
          const parts = ts.split(" ")
          const datePart = parts[0]
          const timePart = parts[1]
          const period = parts[2]?.toUpperCase()
          const [month, day, year] = datePart.split("/").map(Number)
          const timeParts = timePart.split(":").map(Number)
          let hours = timeParts[0]
          const minutes = timeParts[1] || 0
          if (period === "PM" && hours !== 12) hours += 12
          if (period === "AM" && hours === 12) hours = 0
          return new Date(year, month - 1, day, hours, minutes).getTime()
        }
        return parseTs(b.timestamp) - parseTs(a.timestamp)
      })

      const normalizedRegs = mergedRegs.map((r) => ({
        ...r,
        delivered: r.delivered ?? false,
        deliveryDeadline: r.deliveryDeadline ?? null,
      }))

      setRegs(normalizedRegs)

      // Update local cache with the fresh merged list
      // We mark all remote regs as synced=true (implicitly, or explicitly if we want to store it)
      const cacheRegs = normalizedRegs.map((r) => ({ ...r, synced: r.synced !== false }))
      await setItem("regs", JSON.stringify(cacheRegs))
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  // Apply filters and sorting
  const filteredRegs = useMemo(() => {
    // Parse "11/27/2025 09:15 AM" or similar locale format to Date
    const parseTimestamp = (timestamp: string): Date => {
      const parts = timestamp.split(" ")
      const datePart = parts[0]
      const timePart = parts[1]
      const period = parts[2]?.toUpperCase()
      const [month, day, year] = datePart.split("/").map(Number)
      const timeParts = timePart.split(":").map(Number)
      let hours = timeParts[0]
      const minutes = timeParts[1] || 0
      if (period === "PM" && hours !== 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      return new Date(year, month - 1, day, hours, minutes)
    }

    if (!regs) return []

    let result = [...regs]

    // Filter by type
    if (filters.types.length > 0) {
      result = result.filter((r) => filters.types.includes(r.type))
    }

    // Filter by sync status
    if (filters.syncStatus === "synced") {
      result = result.filter((r) => r.synced !== false)
    } else if (filters.syncStatus === "unsynced") {
      result = result.filter((r) => r.synced === false)
    }

    // Filter by delivery status
    if (filters.deliveryStatus === "delivered") {
      result = result.filter((r) => r.delivered)
    } else if (filters.deliveryStatus === "undelivered") {
      result = result.filter((r) => !r.delivered)
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime())
        break
      case "oldest":
        result.sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime())
        break
      case "title_asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title_desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
    }

    return result
  }, [regs, filters])

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.sortBy !== "newest" ||
    filters.syncStatus !== "all" ||
    filters.deliveryStatus !== "all"

  if (isLoading && (!regs || regs.length === 0)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    )
  }

  if (!regs || regs.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          backgroundColor: Theme.colors.background,
        }}
      >
        <Text style={{ fontFamily: Theme.fonts.onest, fontSize: 12, color: Theme.colors.text }}>
          {t("no_registries_found")}
        </Text>

        <Pressable onPress={fetchRegs} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <ReloadIcon size={24} color={Theme.colors.accent} />
        </Pressable>
      </View>
    )
  }

  return (
    <Screen padding={0}>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: Theme.fonts.onest, fontSize: 12, color: Theme.colors.text }}>
          {t("registries_count", { filtered: filteredRegs.length, total: regs?.length })}
        </Text>

        <Pressable
          onPress={() => setFilterModalVisible(true)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          })}
        >
          <Text style={{ fontFamily: Theme.fonts.onest, fontSize: 12, color: Theme.colors.text }}>
            {t("filter")}
          </Text>
          <View style={{ position: "relative" }}>
            <FilterIcon
              size={24}
              color={hasActiveFilters ? Theme.colors.accent : Theme.colors.text}
            />
            {hasActiveFilters && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Theme.colors.accent,
                }}
              />
            )}
          </View>
        </Pressable>
      </View>

      <FlatList
        style={{ paddingTop: 12 }}
        data={filteredRegs}
        keyExtractor={(reg) => reg.id}
        renderItem={({ item, index }) => (
          <RegsCard
            reg={item}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleDelivered={handleToggleDelivered}
          />
        )}
        ListFooterComponent={<WhiteSpace />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchRegs}
            colors={[Theme.colors.accent]}
            progressBackgroundColor={Theme.colors.background}
          />
        }
      />

      <CustomModal
        title={t("delete_record")}
        description={t("delete_record_desc")}
        modalVisible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(false)
          setRegToDelete(null)
        }}
        onAccept={confirmDelete}
      />

      <AddRegModal
        visible={editModalVisible}
        initialTitle={regToEdit?.title || ""}
        initialDescription={regToEdit?.description || ""}
        initialDeliveryDeadline={regToEdit?.deliveryDeadline || ""}
        isEditMode={true}
        onClose={() => {
          setEditModalVisible(false)
          setRegToEdit(null)
        }}
        onSave={handleEditSave}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </Screen>
  )

  function handleEdit(id: string) {
    const reg = regs?.find((r) => r.id === id)
    if (reg) {
      setRegToEdit(reg)
      setEditModalVisible(true)
    }
  }

  async function handleEditSave(title: string, description: string, deliveryDeadline: string) {
    if (!regToEdit) return

    try {
      const userId = auth.currentUser?.uid
      const normalizedDeadline = deliveryDeadline.trim()
      const updatedReg = {
        ...regToEdit,
        title,
        description,
        deliveryDeadline: normalizedDeadline || null,
      }

      // Update in Firebase if logged in
      if (userId && regToEdit.synced) {
        try {
          await Fire.insertReg("regs", regToEdit.id, updatedReg)
        } catch (error) {
          console.log("Failed to update in Firebase", error)
        }
      }

      // Update in local storage
      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      const updatedRegs = localRegs.map((r) =>
        r.id === regToEdit.id
          ? { ...r, title, description, deliveryDeadline: normalizedDeadline || null }
          : r,
      )
      await setItem("regs", JSON.stringify(updatedRegs))

      // Update state
      setRegs(
        (prev) =>
          prev?.map((r) =>
            r.id === regToEdit.id
              ? { ...r, title, description, deliveryDeadline: normalizedDeadline || null }
              : r,
          ) || [],
      )
    } catch (error) {
      console.error("Failed to update", error)
      Alert.alert(t("error"), t("failed_update_record"))
    } finally {
      setEditModalVisible(false)
      setRegToEdit(null)
    }
  }

  function handleDelete(id: string) {
    setRegToDelete(id)
    setDeleteModalVisible(true)
  }

  async function confirmDelete() {
    if (!regToDelete) return

    try {
      const userId = auth.currentUser?.uid

      // Delete from Firebase if logged in
      if (userId) {
        try {
          await Fire.deleteReg("regs", regToDelete)
        } catch (error) {
          console.log("Failed to delete from Firebase", error)
        }
      }

      // Delete from local storage
      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      const updatedRegs = localRegs.filter((r) => r.id !== regToDelete)
      await setItem("regs", JSON.stringify(updatedRegs))

      // Update state
      setRegs((prev) => prev?.filter((r) => r.id !== regToDelete) || [])
    } catch (error) {
      console.error("Failed to delete", error)
      Alert.alert(t("error"), t("failed_delete_record"))
    } finally {
      setDeleteModalVisible(false)
      setRegToDelete(null)
    }
  }

  async function handleToggleDelivered(id: string, delivered: boolean) {
    try {
      const userId = auth.currentUser?.uid

      const localData = await getItem("regs")
      const localRegs: Regs[] = localData ? JSON.parse(localData) : []
      const updatedLocalRegs = localRegs.map((r) => (r.id === id ? { ...r, delivered } : r))
      await setItem("regs", JSON.stringify(updatedLocalRegs))

      setRegs((prev) => prev?.map((r) => (r.id === id ? { ...r, delivered } : r)) || [])

      if (userId) {
        const target = updatedLocalRegs.find((r) => r.id === id)
        if (target && target.synced !== false) {
          try {
            await Fire.insertReg("regs", id, { ...target, delivered })
          } catch (error) {
            console.log("Failed to update delivered status remotely", error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle delivered state", error)
      Alert.alert(t("error"), t("failed_update_record"))
    }
  }
}
