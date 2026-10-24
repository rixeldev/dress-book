import pkg from "../../app.config.js"
import {
  BackIcon,
  CopyIcon,
  LanguageIcon,
  ListIcon,
  LogoutIcon,
  PrivacyIcon,
  UserIcon,
  VibrationIcon,
  SoundIcon,
  WebIcon,
  EditIcon,
  GithubIcon,
  ShareIcon,
  QuestionIcon,
  StarIcon,
  SunIcon,
  MoonIcon,
  AutoThemeIcon,
} from "@/icons/Icons"
import { Stack, useNavigation } from "expo-router"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  Vibration,
  View,
  Share,
} from "react-native"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { BottomSheetModal } from "@/components/ui/BottomSheetModal"
import BottomSheet from "@gorhom/bottom-sheet"
import Clipboard from "@react-native-clipboard/clipboard"
import { signOut, updateProfile } from "@react-native-firebase/auth"
import { auth, storage } from "@/db/firebaseConfig"
import { useTranslation } from "react-i18next"
import { Updaloading } from "@/components/Uploading"
import * as ImagePicker from "expo-image-picker"
import NetInfo from "@react-native-community/netinfo"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ref, uploadBytesResumable, getDownloadURL } from "@react-native-firebase/storage"
import { useAppTheme } from "@/hooks/useAppTheme"
import { requestNotificationPermission } from "@/services/notifications"
import { SettingsButton } from "@/components/SettingsButton"
import { CustomModal } from "@/components/ui/CustomModal"
import { deleteAccount, RecentLoginRequiredError } from "@/services/account"
import { showPrivacyOptions } from "@/services/consent"
import { isPremium, setPremium } from "@/services/entitlements"
import { useCurrency } from "@/contexts/CurrencyContext"
import {
  BrandMark,
  Card,
  CountryPicker,
  IconButton,
  ListRow,
  SectionHeader,
} from "@/components/ui"

const languageCodes = ["en", "es"]
const appVersion = pkg.expo.android.version

interface ToggleRowProps {
  title: string
  description: string
  icon: ReactNode
  value: boolean
  onToggle: () => void
}

export default function Settings() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
  const [languageSelected, setLanguageSelected] = useState<string>("en")
  const [image, setImage] = useState("")
  const [progress, setProgress] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [connection, setConnection] = useState(true)
  const [userName, setUserName] = useState<string | null | undefined>("Anon-12345678")
  const [userId, setUserId] = useState<string | undefined>("1234567890101112131415")
  const [userEmail, setUserEmail] = useState<string | undefined>("email@email.com")
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  const { t, i18n } = useTranslation()
  const { setItem, getItem } = useStorage()
  const { Theme, themeMode, setThemeMode } = useAppTheme()
  const { country, currency, setCountry } = useCurrency()

  const sheetRef = useRef<BottomSheet>(null)
  const themeSheetRef = useRef<BottomSheet>(null)
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const loadSettings = async () => {
      const vibrationValue = await getItem("vibration")
      const languageCode = await getItem("language")

      setIsVibrationEnabled(parseBoolean(vibrationValue))
      setLanguageSelected(languageCode ?? "en")
      setUserId(auth.currentUser?.uid)
      setUserEmail(auth.currentUser?.email ?? "email@email.com")
      setUserName(auth.currentUser?.displayName)
      setIsPremiumUser(await isPremium())
    }

    const unsubscription = NetInfo.addEventListener((state) => {
      setConnection(state.isConnected ?? false)
    })

    loadSettings()

    return unsubscription()
  }, [])

  const toggleNotifications = async () => {
    if (!isNotificationsEnabled) {
      const granted = await requestNotificationPermission()
      setIsNotificationsEnabled(granted)
      await setItem("notifications", String(granted))
    } else {
      setIsNotificationsEnabled(false)
      await setItem("notifications", String(false))
    }
  }

  const toggleVibrationSwitch = () => {
    setIsVibrationEnabled((prev) => {
      const newValue = !prev
      setItem("vibration", String(newValue))
      if (newValue) Vibration.vibrate(10)
      return newValue
    })
  }

  const toggleLanguage = (code: string) => {
    setLanguageSelected(code)
    setItem("language", code)
    sheetRef.current?.close()
    i18n.changeLanguage(code)
  }

  const toggleTheme = (mode: "light" | "dark" | "automatic") => {
    setThemeMode(mode)
    themeSheetRef.current?.close()
  }

  const getThemeLabel = () => {
    switch (themeMode) {
      case "light":
        return t("light")
      case "dark":
        return t("dark")
      case "automatic":
        return t("automatic")
      default:
        return t("automatic")
    }
  }

  const copyUserId = () => {
    isVibrationEnabled && Vibration.vibrate(10)
    Clipboard.setString(userId ?? "")
    ToastAndroid.showWithGravity(t("copied_clipboard"), ToastAndroid.SHORT, ToastAndroid.CENTER)
  }

  const handleSignOut = () => {
    if (auth) {
      signOut(auth)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteAccountModalVisible(false)

    try {
      await deleteAccount()
    } catch (error: any) {
      if (
        error instanceof RecentLoginRequiredError ||
        error?.code === "auth/requires-recent-login"
      ) {
        Alert.alert(
          t("delete_account_recent_login_title"),
          t("delete_account_recent_login_desc"),
        )
        return
      }

      console.log("Failed to delete account:", error)
      Alert.alert(t("error"), t("delete_account_failed"))
    }
  }

  const handlePickImage = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync()

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 2],
      quality: 0.5,
      allowsMultipleSelection: false,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setModalVisible(true)
    }
  }

  const uploadImage = async (uri: string) => {
    if (!connection) {
      ToastAndroid.showWithGravity(t("you_are_offline"), ToastAndroid.SHORT, ToastAndroid.CENTER)
      return
    }

    if (!auth.currentUser) return
    if (uploading) return

    setUploading(true)

    const response = await fetch(uri)
    const blob = await response.blob()
    const storageRef = ref(storage, `Profiles/${auth.currentUser.uid}`)
    const uploadTask = uploadBytesResumable(storageRef, blob)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(+progress.toFixed())
      },
      (error) => {
        console.log("Upliad failed:", error)
        setImage("")
        setModalVisible(false)
        ToastAndroid.showWithGravity(t("error_uploading"), ToastAndroid.SHORT, ToastAndroid.CENTER)
      },
      () => {
        getDownloadURL(uploadTask.snapshot!.ref).then(async (downloadURL) => {
          await updateProfile(auth.currentUser!, { photoURL: downloadURL })
          setImage(downloadURL)
          setModalVisible(false)
          setProgress(0)
          setUploading(false)
        })
      },
    )
  }

  const handleAccept = async (uri: string) => {
    await uploadImage(uri)
  }

  const handleClose = () => {
    setModalVisible(false)
    setImage("")
    setProgress(0)
    setUploading(false)
  }

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `${t("sharing_text")} https://play.google.com/store/apps/details?id=com.rilisentertainment.dressbook`,
      })
    } catch (error: any) {
      console.log("Error sharing:", error.message)
    }
  }

  const ToggleRow = ({ title, description, icon, value, onToggle }: ToggleRowProps) => (
    <ListRow
      title={title}
      description={description}
      style={styles.row}
      leading={
        <View
          style={[
            styles.icon,
            {
              backgroundColor: Theme.semantic.bg.sunken,
              borderColor: Theme.semantic.border.subtle,
            },
          ]}
        >
          {icon}
        </View>
      }
      trailing={
        <Switch
          trackColor={{
            false: Theme.semantic.border.strong,
            true: Theme.semantic.accent.primary,
          }}
          thumbColor={Theme.semantic.bg.surface}
          ios_backgroundColor={Theme.semantic.border.strong}
          onValueChange={onToggle}
          value={value}
        />
      }
    />
  )

  return (
    <View style={{ flex: 1, backgroundColor: Theme.semantic.bg.canvas }}>
      <Stack.Screen
        options={{
          headerTitle: t("settings"),
          headerLeft: () => (
            <IconButton
              icon={<BackIcon color={Theme.semantic.text.primary} size={24} />}
              onPress={() => navigation.goBack()}
              accessibilityLabel={t("back")}
            />
          ),
          headerRight: () => null,
        }}
      />

      <Updaloading
        onAccept={() => handleAccept(image)}
        onClose={handleClose}
        modalVisible={modalVisible}
        image={image}
        progress={progress}
        uploading={uploading}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Theme.spacing.lg,
          paddingHorizontal: Theme.spacing.gutter,
          paddingBottom: insets.bottom + 56,
          gap: Theme.spacing.section,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <Pressable
            onPress={handlePickImage}
            accessibilityRole="button"
            accessibilityLabel={t("change_photo")}
            style={styles.avatarWrap}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: Theme.semantic.accent.soft,
                  borderColor: Theme.semantic.accent.brass,
                },
              ]}
            >
              {auth.currentUser?.photoURL ? (
                <Image
                  style={styles.avatarImage}
                  source={{ uri: auth.currentUser?.photoURL }}
                />
              ) : (
                <UserIcon size={44} color={Theme.semantic.accent.primary} />
              )}
            </View>
            <View
              style={[
                styles.editBubble,
                {
                  backgroundColor: Theme.semantic.accent.primary,
                  borderColor: Theme.semantic.bg.surface,
                },
              ]}
            >
              <EditIcon color={Theme.semantic.text.inverse} size={12} />
            </View>
          </Pressable>

          <Text
            style={{
              color: Theme.semantic.text.primary,
              fontFamily: Theme.fonts.display,
              fontSize: Theme.fontSizes.h1,
              textAlign: "center",
            }}
          >
            {userName || t("user")}
          </Text>
          <Text
            style={{
              color: Theme.semantic.text.secondary,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.fontSizes.label,
              textAlign: "center",
            }}
          >
            {userEmail}
          </Text>

          <Pressable
            onPress={copyUserId}
            accessibilityRole="button"
            accessibilityLabel={t("copy_user_id")}
            style={({ pressed }) => [styles.idRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: Theme.semantic.text.tertiary,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.fontSizes.caption,
              }}
            >
              {userId}
            </Text>
            <CopyIcon color={Theme.semantic.text.tertiary} size={12} />
          </Pressable>
        </Card>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("region_and_currency")} description={t("currency_hint")} />
          <Card>
            <CountryPicker
              label={t("country")}
              hint={`${t("preferred_currency")}: ${currency}`}
              value={country.code}
              onChange={setCountry}
            />
          </Card>
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("preferences")} />
          <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
            <ToggleRow
              title={t("vibration")}
              description={t("vibration_desc")}
              icon={<VibrationIcon color={Theme.semantic.text.secondary} size={18} />}
              value={isVibrationEnabled}
              onToggle={toggleVibrationSwitch}
            />
            <ToggleRow
              title={t("notifications")}
              description={t("notifications_desc")}
              icon={<SoundIcon color={Theme.semantic.text.secondary} size={18} />}
              value={isNotificationsEnabled}
              onToggle={toggleNotifications}
            />
            <SettingsButton
              onPress={() => themeSheetRef.current?.expand()}
              title={t("theme")}
              description={getThemeLabel()}
              icon={<SunIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => sheetRef.current?.expand()}
              title={t("language")}
              description={languageSelected === "es" ? t("es") : t("en")}
              icon={<LanguageIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={async () => {
                const next = !isPremiumUser
                await setPremium(next)
                setIsPremiumUser(next)
              }}
              title={t("premium_dev")}
              description={isPremiumUser ? t("enabled") : t("disabled")}
              icon={<StarIcon color={Theme.semantic.text.secondary} size={18} />}
            />
          </Card>
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("about")} />
          <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
            <SettingsButton
              onPress={handleShareApp}
              title={t("invite_friends")}
              description={t("invite_friends_desc")}
              icon={<ShareIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.rilisentertainment.dressbook",
                )
              }
              title={t("rate_app")}
              description={t("rate_app_desc")}
              icon={<StarIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => Linking.openURL("https://rixel.dev")}
              title={t("site")}
              description={t("site_desc")}
              icon={<WebIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => Linking.openURL("https://rixel.dev/privacy")}
              title={t("privacy_policy")}
              icon={<PrivacyIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => showPrivacyOptions()}
              title={t("privacy_options")}
              icon={<PrivacyIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => Linking.openURL("https://rixel.dev/terms")}
              title={t("terms_conditions")}
              icon={<ListIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => Linking.openURL("https://github.com/rixeldev/dress-book")}
              title="GitHub"
              icon={<GithubIcon color={Theme.semantic.text.secondary} size={18} />}
            />
            <SettingsButton
              onPress={() => Linking.openURL("https://www.rixel.dev/#contact")}
              title={t("feedback")}
              icon={<QuestionIcon color={Theme.semantic.text.secondary} size={18} />}
            />
          </Card>
        </View>

        <View style={{ gap: Theme.spacing.sm }}>
          <SectionHeader title={t("account")} />
          <Card padded={false} style={{ paddingHorizontal: Theme.spacing.md }}>
            <SettingsButton
              onPress={() => setDeleteAccountModalVisible(true)}
              title={t("delete_account")}
              description={t("delete_account_hint")}
              icon={<LogoutIcon color={Theme.semantic.state.danger} size={18} />}
              color={Theme.semantic.state.danger}
            />
            {auth && (
              <SettingsButton
                onPress={handleSignOut}
                title={t("sign_out")}
                icon={<LogoutIcon color={Theme.semantic.state.danger} size={18} />}
                color={Theme.semantic.state.danger}
              />
            )}
          </Card>
        </View>

        <View style={[styles.footer, { marginTop: Theme.spacing.xxl, marginBottom: 24 }]}>
          <BrandMark size={34} />
          <Text
            style={{
              color: Theme.semantic.text.primary,
              fontFamily: Theme.fonts.display,
              fontSize: Theme.fontSizes.h2,
              letterSpacing: -0.4,
            }}
          >
            Dress Book
          </Text>
          <Text
            style={{
              color: Theme.semantic.text.tertiary,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.fontSizes.caption,
              letterSpacing: 1.2,
            }}
          >
            {appVersion}
          </Text>
        </View>
      </ScrollView>

      <CustomModal
        title={t("delete_account")}
        description={t("delete_account_desc")}
        modalVisible={deleteAccountModalVisible}
        onRequestClose={() => setDeleteAccountModalVisible(false)}
        onAccept={handleDeleteAccount}
        acceptLabel={t("delete")}
        destructive
      />

      <BottomSheetModal title={t("language")} ref={sheetRef}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {languageCodes.map((option) => {
            const isSelected = languageSelected === option
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.optionContainer]}
                onPress={() => toggleLanguage(option)}
              >
                <View
                  style={[
                    styles.outerCircle,
                    {
                      borderColor: isSelected
                        ? Theme.semantic.accent.primary
                        : Theme.semantic.border.strong,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.innerDot,
                        { backgroundColor: Theme.semantic.accent.primary },
                      ]}
                    />
                  )}
                </View>

                <View>
                  <Text style={[styles.optionText, { color: Theme.semantic.text.primary }]}>
                    {option === "es" ? "Spanish" : "English"}
                  </Text>
                  <Text style={[styles.optionSubText, { color: Theme.semantic.text.secondary }]}>
                    {option === "es" ? "Español" : "Inglés"}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </BottomSheetModal>

      <BottomSheetModal title={t("theme")} ref={themeSheetRef}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {["automatic", "light", "dark"].map((option) => {
            const isSelected = themeMode === option
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.optionContainer]}
                onPress={() => toggleTheme(option as "light" | "dark" | "automatic")}
              >
                <View
                  style={[
                    styles.outerCircle,
                    {
                      borderColor: isSelected
                        ? Theme.semantic.accent.primary
                        : Theme.semantic.border.strong,
                    },
                  ]}
                >
                  {isSelected && <View style={styles.innerDot} />}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {option === "light" && (
                    <SunIcon size={20} color={Theme.semantic.text.primary} />
                  )}
                  {option === "dark" && (
                    <MoonIcon size={20} color={Theme.semantic.text.primary} />
                  )}
                  {option === "automatic" && (
                    <AutoThemeIcon size={20} color={Theme.semantic.text.primary} />
                  )}
                  <View>
                    <Text style={[styles.optionText, { color: Theme.semantic.text.primary }]}>
                      {option === "light"
                        ? t("light")
                        : option === "dark"
                          ? t("dark")
                          : t("automatic")}
                    </Text>
                    <Text
                      style={[styles.optionSubText, { color: Theme.semantic.text.secondary }]}
                    >
                      {option === "automatic"
                        ? t("follow_system")
                        : option === "light"
                          ? t("light_mode")
                          : t("dark_mode")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          })}
        </View>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 22,
  },
  avatarWrap: {
    marginBottom: 6,
  },
  avatar: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderRadius: 999,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editBubble: {
    position: "absolute",
    right: 0,
    bottom: 0,
    padding: 6,
    borderWidth: 2,
    borderRadius: 999,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  row: {
    paddingHorizontal: 16,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 24,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  optionSubText: {
    fontSize: 12,
  },
})
