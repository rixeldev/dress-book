import pkg from "../app.config.js"
import {
  BackIcon,
  CopyIcon,
  LanguageIcon,
  ListIcon,
  LogoutIcon,
  PrivacyIcon,
  UserIcon,
  VibrationIcon,
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
import {
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
import { Divider } from "@/components/Divider"
import { SettingsButton } from "@/components/SettingsButton"

const languageCodes = ["en", "es"]
const appVersion = pkg.expo.android.version

export default function Settings() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [languageSelected, setLanguageSelected] = useState<string>("en")
  const [image, setImage] = useState("")
  const [progress, setProgress] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [connection, setConnection] = useState(true)
  const [userName, setUserName] = useState<string | null | undefined>("Anon-12345678")
  const [userId, setUserId] = useState<string | undefined>("1234567890101112131415")
  const [userEmail, setUserEmail] = useState<string | undefined>("email@email.com")

  const { t, i18n } = useTranslation()
  const { setItem, getItem } = useStorage()
  const { Theme, themeMode, setThemeMode } = useAppTheme()

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
    }

    const unsubscription = NetInfo.addEventListener((state) => {
      setConnection(state.isConnected ?? false)
    })

    loadSettings()

    return unsubscription()
  }, [])

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

  const handlePickImage = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync()

    let result = await ImagePicker.launchImageLibraryAsync({
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
      const result = await Share.share({
        message: `${t("sharing_text")} https://play.google.com/store/apps/details?id=com.rilisentertainment.dressbook`,
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (error: any) {
      console.log("Error sharing:", error.message)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Theme.colors.background,
        width: "100%",
      }}
    >
      <Stack.Screen
        options={{
          headerTintColor: Theme.colors.text,
          headerTitle: t("settings"),
          headerTitleStyle: {
            fontSize: Theme.sizes.h0,
            fontFamily: Theme.fonts.onest,
          },
          headerLeft: () => (
            <BackIcon color={Theme.colors.text} size={34} onPress={() => navigation.goBack()} />
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

      <ScrollView style={{ flex: 1, paddingTop: insets.top }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 22,
          }}
        >
          <View
            style={{
              position: "relative",
            }}
          >
            <Pressable
              onPress={handlePickImage}
              style={{
                width: 96,
                height: 96,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Theme.colors.primary2,
                borderRadius: 100,
                marginBottom: 4,
                overflow: "hidden",
              }}
            >
              {auth.currentUser?.photoURL ? (
                <Image
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                    borderRadius: 100,
                    alignSelf: "center",
                  }}
                  source={{ uri: auth.currentUser?.photoURL }}
                />
              ) : (
                <UserIcon size={76} color={Theme.colors.accent} />
              )}
            </Pressable>

            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => [
                { opacity: pressed ? 0.6 : 1 },
                {
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: Theme.colors.accent,
                  borderRadius: 100,
                  padding: 6,
                  elevation: 3,
                },
              ]}
            >
              <EditIcon color={Theme.colors.background2} size={14} />
            </Pressable>
          </View>

          <Text
            style={{
              color: Theme.colors.accent,
              fontFamily: Theme.fonts.onestBold,
              fontSize: Theme.sizes.h0,
            }}
          >
            {userName ?? "User"}
          </Text>

          <Text
            style={{
              color: Theme.colors.darkGray,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.sizes.h5,
            }}
          >
            {userEmail}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: Theme.colors.gray,
                fontFamily: Theme.fonts.onest,
                fontSize: Theme.sizes.h6,
              }}
            >
              {userId}
            </Text>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              onPress={copyUserId}
            >
              <CopyIcon color={Theme.colors.darkGray} size={12} />
            </Pressable>
          </View>
        </View>

        <Divider />

        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? Theme.colors.background2 : Theme.colors.transparent,
              opacity: pressed ? 0.6 : 1,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              paddingVertical: 16,
              padding: 16,
            },
          ]}
          onPress={toggleVibrationSwitch}
        >
          <View>
            <VibrationIcon color={Theme.colors.gray} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: Theme.colors.text }}>{t("vibration")}</Text>
            <Text style={{ color: Theme.colors.gray }}>{t("vibration_desc")}</Text>
          </View>

          <View>
            <Switch
              trackColor={{
                false: Theme.colors.darkGray,
                true: Theme.colors.primary2,
              }}
              thumbColor={isVibrationEnabled ? Theme.colors.primary : Theme.colors.text}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleVibrationSwitch}
              value={isVibrationEnabled}
            />
          </View>
        </Pressable>

        <SettingsButton
          onPress={() => themeSheetRef.current?.expand()}
          title={t("theme")}
          description={getThemeLabel()}
          icon={<SunIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => sheetRef.current?.expand()}
          title={t("language")}
          description={languageSelected === "es" ? t("es") : t("en")}
          icon={<LanguageIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={handleShareApp}
          title={t("invite_friends")}
          description={t("invite_friends_desc")}
          icon={<ShareIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() =>
            Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.rilisentertainment.dressbook",
            )
          }
          title={t("rate_app")}
          description={t("rate_app_desc")}
          icon={<StarIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rixel.dev")}
          title={t("site")}
          description={t("site_desc")}
          icon={<WebIcon color={Theme.colors.gray} />}
        />

        <Divider />

        <SettingsButton
          onPress={() => Linking.openURL("https://rixel.dev/privacy")}
          title={t("privacy_policy")}
          icon={<PrivacyIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rixel.dev/terms")}
          title={t("terms_conditions")}
          icon={<ListIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://github.com/rixeldev/dress-book")}
          title="GitHub"
          icon={<GithubIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://www.rixel.dev/#contact")}
          title={t("feedback")}
          icon={<QuestionIcon color={Theme.colors.gray} />}
        />

        <Divider />

        {auth && (
          <SettingsButton
            onPress={handleSignOut}
            title={t("sign_out")}
            icon={<LogoutIcon color={Theme.colors.red} />}
            color={Theme.colors.red}
          />
        )}

        <View
          style={{
            flexDirection: "column",
            marginVertical: 8,
            marginBottom: insets.bottom + 16,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              width: "100%",
              color: Theme.colors.darkGray,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.sizes.h5,
            }}
          >
            Dress Book
          </Text>

          <Text
            style={{
              textAlign: "center",
              width: "100%",
              color: Theme.colors.darkGray,
              fontFamily: Theme.fonts.onest,
              fontSize: Theme.sizes.h6,
            }}
          >
            {appVersion}
          </Text>
        </View>
      </ScrollView>

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
                      borderColor: isSelected ? Theme.colors.primary : Theme.colors.gray,
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.innerDot, { backgroundColor: Theme.colors.primary }]} />
                  )}
                </View>

                <View>
                  <Text style={[styles.optionText, { color: Theme.colors.text }]}>
                    {option === "es" ? "Spanish" : "English"}
                  </Text>
                  <Text style={[styles.optionSubText, { color: Theme.colors.gray }]}>
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
                      borderColor: isSelected ? Theme.colors.primary : Theme.colors.gray,
                    },
                  ]}
                >
                  {isSelected && <View style={styles.innerDot} />}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {option === "light" && <SunIcon size={20} color={Theme.colors.text} />}
                  {option === "dark" && <MoonIcon size={20} color={Theme.colors.text} />}
                  {option === "automatic" && <AutoThemeIcon size={20} color={Theme.colors.text} />}
                  <View>
                    <Text style={[styles.optionText, { color: Theme.colors.text }]}>
                      {option === "light"
                        ? t("light")
                        : option === "dark"
                          ? t("dark")
                          : t("automatic")}
                    </Text>
                    <Text style={[styles.optionSubText, { color: Theme.colors.gray }]}>
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
