import Fire from "@/db/Fire"
import { auth } from "@/db/firebaseConfig"
import { PlusIcon } from "@/icons/Icons"
import {
  FullBodyMeasurements,
  ClothesMeasurements,
  CurtainMeasurements,
  OtherMeasurements,
} from "@/interfaces/FullBodyMeasurements"
import { Regs, RegType } from "@/interfaces/Regs"
import { useState, useMemo, useCallback } from "react"
import { Alert, StyleSheet, Text, View, Pressable } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  SharedValue,
} from "react-native-reanimated"
import { AddRegModal } from "./AddRegModal"
import { useStorage } from "@/hooks/useStorage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useTranslation } from "react-i18next"
import { useInterstitialAd } from "@/hooks/useInterstitialAd"

const emptyClothesMeasurements: ClothesMeasurements = {
  headAndNeck: {},
  upperTorso: {},
  midTorso: {},
  arms: {},
  hipsAndPelvis: {},
  legs: {},
  feet: {},
}

const emptyCurtainMeasurements: CurtainMeasurements = {
  dimensions: {},
  details: {},
  hardware: {},
}

const emptyOtherMeasurements: OtherMeasurements = {
  general: {},
  custom: {},
}

const getEmptyMeasurements = (type: RegType): FullBodyMeasurements => {
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

const MENU_RADIUS = 100
const BUBBLE_SIZE = 65

interface AddButtonProps {
  onRegAdded?: () => void
}

export const AddButton = ({ onRegAdded }: AddButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [initialTitle, setInitialTitle] = useState("")
  const [selectedType, setSelectedType] = useState<RegType>("Others")
  const [isOpen, setIsOpen] = useState(false)

  const progress = useSharedValue(0)
  const { getItem, setItem } = useStorage()
  const { Theme } = useAppTheme()
  const { t } = useTranslation()
  const { showAdIfEligible } = useInterstitialAd()

  const styles = useMemo(() => createStyles(Theme), [Theme])

  const toggleMenu = useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)
    progress.value = withSpring(newState ? 1 : 0, { damping: 15, stiffness: 150 })
  }, [isOpen])

  const closeMenuAndOpenModal = useCallback((type: RegType) => {
    setSelectedType(type)
    setInitialTitle(type)
    setIsOpen(false)
    progress.value = withTiming(0, { duration: 150 })
    setTimeout(() => setModalVisible(true), 180)
  }, [])

  const handleSave = async (title: string, description: string, deliveryDeadline: string) => {
    const userId = auth.currentUser?.uid
    const id = Date.now().toString()
    const now = new Date()
    const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    const normalizedDeadline = deliveryDeadline.trim()

    let synced = false

    const measurements = getEmptyMeasurements(selectedType)

    // Try to save to Firebase first if user is logged in
    if (userId) {
      try {
        const regData: Regs = {
          id,
          userId,
          title,
          thumbnail: null,
          description,
          measurements,
          timestamp,
          synced: true,
          type: selectedType,
          deliveryDeadline: normalizedDeadline || null,
          delivered: false,
        }
        await Fire.insertReg("regs", id, regData)
        synced = true
      } catch (error) {
        console.log("Failed to save to Firebase, saving offline only", error)
      }
    }

    const newReg: Regs = {
      id,
      userId: userId || "offline",
      title,
      thumbnail: null,
      description,
      measurements,
      timestamp,
      synced,
      type: selectedType,
      deliveryDeadline: normalizedDeadline || null,
      delivered: false,
    }

    try {
      const existingData = await getItem("regs")
      const regs: Regs[] = existingData ? JSON.parse(existingData) : []
      regs.push(newReg)
      await setItem("regs", JSON.stringify(regs))

      if (!synced) {
        Alert.alert(t("saved_offline"), t("saved_offline_desc"))
      } else {
        Alert.alert(t("success"), t("record_added"))
      }
      
      onRegAdded?.()
      showAdIfEligible()
    } catch (error) {
      console.error("Failed to save locally", error)
      Alert.alert(t("error"), t("failed_save_record"))
    }

    setModalVisible(false)
  }

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }))

  return (
    <View style={styles.container} pointerEvents="box-none">
      <MenuItem
        title={t("clothes")}
        angle={-150}
        progress={progress}
        isOpen={isOpen}
        onPress={() => closeMenuAndOpenModal("Clothes")}
        theme={Theme}
      />
      <MenuItem
        title={t("curtains")}
        angle={-90}
        progress={progress}
        isOpen={isOpen}
        onPress={() => closeMenuAndOpenModal("Curtains")}
        theme={Theme}
      />
      <MenuItem
        title={t("others")}
        angle={-30}
        progress={progress}
        isOpen={isOpen}
        onPress={() => closeMenuAndOpenModal("Others")}
        theme={Theme}
      />

      <Pressable
        onPress={toggleMenu}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
      >
        <Animated.View style={rotationStyle}>
          <PlusIcon color="#fff" size={24} />
        </Animated.View>
      </Pressable>

      <AddRegModal
        visible={modalVisible}
        initialTitle={initialTitle}
        initialDeliveryDeadline=""
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  )
}

const MenuItem = ({
  title,
  angle,
  progress,
  isOpen,
  onPress,
  theme,
}: {
  title: string
  angle: number
  progress: SharedValue<number>
  isOpen: boolean
  onPress: () => void
  theme: any
}) => {
  const radian = (angle * Math.PI) / 180
  const targetX = MENU_RADIUS * Math.cos(radian)
  const targetY = MENU_RADIUS * Math.sin(radian)
  const styles = useMemo(() => createStyles(theme), [theme])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, targetX]) },
        { translateY: interpolate(progress.value, [0, 1], [0, targetY]) },
        { scale: interpolate(progress.value, [0, 1], [0.01, 1]) },
      ],
      opacity: progress.value,
    }
  })

  return (
    <View style={styles.menuItem} pointerEvents={isOpen ? "auto" : "none"}>
      <Animated.View style={[styles.menuButtonWrapper, animatedStyle]}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.menuText}>{title}</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 50,
      zIndex: 100,
    },
    button: {
      padding: 12,
      width: 85,
      height: 85,
      borderRadius: 200,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Theme.colors.accent,
      borderWidth: 8,
      borderColor: Theme.colors.background,
      zIndex: 10,
    },
    menuItem: {
      position: "absolute",
      width: MENU_RADIUS * 2,
      height: MENU_RADIUS * 2,
      justifyContent: "center",
      alignItems: "center",
    },
    menuButtonWrapper: {
      position: "absolute",
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
    },
    menuButton: {
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      borderRadius: BUBBLE_SIZE / 2,
      backgroundColor: Theme.colors.modal,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    menuText: {
      fontFamily: Theme.fonts.onestBold,
      color: Theme.colors.text,
      fontSize: 10,
      textAlign: "center",
    },
  })
