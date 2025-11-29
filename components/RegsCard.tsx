import { ClothIcon, CurtainIcon, ForwardIcon, PackageIcon, EditIcon } from "@/icons/Icons"
import { Regs } from "@/interfaces/Regs"
import { useEffect, useRef, useState, useMemo } from "react"
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useRouter } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useTranslation } from "react-i18next"

const MENU_WIDTH = 160
const MENU_HEIGHT = 150
const SCREEN_PADDING = 16

interface Props {
  reg: Regs
  index: number
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleDelivered?: (id: string, delivered: boolean) => void
}

export const RegsCard = ({ reg, index, onEdit, onDelete, onToggleDelivered }: Props) => {
  const { Theme } = useAppTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const [btnScale] = useState(new Animated.Value(1))
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()
  const opacity = useRef(new Animated.Value(0)).current

  const styles = useMemo(() => createStyles(Theme), [Theme])

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: index * 200,
      useNativeDriver: true,
    }).start()
  }, [opacity, index])

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

    // Calculate position respecting screen boundaries
    let x = pageX
    let y = pageY

    // Check right boundary
    if (x + MENU_WIDTH > screenWidth - SCREEN_PADDING) {
      x = pageX - MENU_WIDTH
    }

    // Check left boundary
    if (x < SCREEN_PADDING) {
      x = SCREEN_PADDING
    }

    // Check bottom boundary
    if (y + MENU_HEIGHT > screenHeight - SCREEN_PADDING) {
      y = pageY - MENU_HEIGHT
    }

    // Check top boundary
    if (y < SCREEN_PADDING) {
      y = SCREEN_PADDING
    }

    setMenuPosition({ x, y })
    setMenuVisible(true)
  }

  const handleEdit = () => {
    setMenuVisible(false)
    onEdit?.(reg.id)
  }

  const handleDelete = () => {
    setMenuVisible(false)
    onDelete?.(reg.id)
  }

  const handleToggleDelivered = () => {
    setMenuVisible(false)
    onToggleDelivered?.(reg.id, !reg.delivered)
  }

  const getIcon = () => {
    switch (reg.type) {
      case "Clothes":
        return <ClothIcon size={20} color={Theme.colors.accent} />
      case "Curtains":
        return <CurtainIcon size={20} color={Theme.colors.accent} />
      case "Others":
        return <PackageIcon size={20} color={Theme.colors.accent} />
      default:
        return <PackageIcon size={20} color={Theme.colors.accent} />
    }
  }

  return (
    <>
      <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%", opacity }}>
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.9 }, styles.pressables]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push({ pathname: "/details", params: { id: reg.id } })}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <View key={reg.id} style={styles.card}>
            {reg.thumbnail && <Image style={styles.image} source={{ uri: reg.thumbnail }} />}
            <View style={styles.details}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {getIcon()}
                  <Text style={styles.title}>{reg.title}</Text>
                </View>
                {reg.synced === false && <View style={styles.unsyncedDot} />}
              </View>
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.description}>
                {reg.description}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.deadlinePill}>
                  <Text style={styles.deadlineLabel}>{t("delivery_deadline_short")}</Text>
                  <Text style={styles.deadlineValue}>
                    {reg.deliveryDeadline || t("deadline_not_set")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    reg.delivered ? styles.statusDelivered : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      reg.delivered ? styles.statusTextDelivered : styles.statusTextPending,
                    ]}
                  >
                    {reg.delivered ? t("delivered") : t("undelivered")}
                  </Text>
                </View>
              </View>
              <Text style={styles.timestamp}>{reg.timestamp}</Text>
            </View>

            <View style={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
              <ForwardIcon color={Theme.colors.accent} size={28} />
            </View>
          </View>
        </Pressable>
      </Animated.View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.contextMenu,
                {
                  top: menuPosition.y,
                  left: menuPosition.x,
                },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
                <EditIcon size={18} color={Theme.colors.text} />
                <Text style={styles.menuText}>{t("edit")}</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleToggleDelivered}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={reg.delivered ? "refresh-outline" : "checkmark-done-outline"}
                  size={18}
                  color={Theme.colors.text}
                />
                <Text style={styles.menuText}>
                  {reg.delivered ? t("mark_as_undelivered") : t("mark_as_delivered")}
                </Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleDelete} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color={Theme.colors.red} />
                <Text style={[styles.menuText, { color: Theme.colors.red }]}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: Theme.colors.ultraLightGray,
      marginBottom: 12,
      maxWidth: "100%",
      overflow: "hidden",
      maxHeight: 140,
      borderRadius: 20,
      paddingHorizontal: 18,
    },
    details: {
      flex: 1,
      justifyContent: "space-between",
    },
    image: {
      width: 107,
      height: 147,
    },
    title: {
      color: Theme.colors.text,
      fontFamily: Theme.fonts.onestBold,
      fontSize: 18,
      marginVertical: 10,
    },
    description: {
      flexWrap: "wrap",
      color: Theme.colors.darkGray,
      fontSize: 14,
      fontFamily: Theme.fonts.onest,
      marginBottom: 10,
      flexShrink: 1,
      lineHeight: 16,
      overflow: "hidden",
    },
    timestamp: {
      color: Theme.colors.lightGray,
      fontFamily: Theme.fonts.onest,
      fontSize: 12,
      marginBottom: 10,
      fontStyle: "italic",
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    deadlinePill: {
      flex: 1,
      backgroundColor: Theme.colors.background2,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    deadlineLabel: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: 12,
      color: Theme.colors.lightGray,
    },
    deadlineValue: {
      fontFamily: Theme.fonts.onest,
      fontSize: 14,
      color: Theme.colors.text,
    },
    statusBadge: {
      borderRadius: 50,
      paddingVertical: 6,
      paddingHorizontal: 12,
      minWidth: 90,
      alignItems: "center",
      justifyContent: "center",
    },
    statusDelivered: {
      backgroundColor: Theme.colors.primary2,
    },
    statusPending: {
      backgroundColor: Theme.colors.background2,
    },
    statusText: {
      fontFamily: Theme.fonts.onestBold,
      fontSize: 12,
    },
    statusTextDelivered: {
      color: Theme.colors.accent,
    },
    statusTextPending: {
      color: Theme.colors.text,
    },
    pressables: {
      borderRadius: 26,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      gap: 18,
    },
    unsyncedDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Theme.colors.yellow,
      marginRight: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    contextMenu: {
      position: "absolute",
      backgroundColor: Theme.colors.modal,
      borderRadius: 12,
      paddingVertical: 4,
      minWidth: 140,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 12,
    },
    menuText: {
      fontFamily: Theme.fonts.onest,
      fontSize: 14,
      color: Theme.colors.text,
    },
    menuDivider: {
      height: 1,
      backgroundColor: Theme.colors.background2,
      marginHorizontal: 8,
    },
  })
