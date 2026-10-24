import React, { useEffect, useState, useMemo } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
  Animated,
  Pressable,
} from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"
import { VerifiedIcon } from "@/icons/Icons"
import { useTranslation } from "react-i18next"
import { auth } from "@/db/firebaseConfig"
import { sendEmailVerification, signOut } from "@react-native-firebase/auth"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"

export const WaitingVerification = () => {
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnScale] = useState(new Animated.Value(1))

  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const { refreshUser } = useAuth()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser
      if (user && !checking) {
        setChecking(true)

        await refreshUser()

        if (auth.currentUser?.emailVerified) {
          clearInterval(interval)
          ToastAndroid.showWithGravity(t("email_verified"), ToastAndroid.SHORT, ToastAndroid.CENTER)
          router.replace("/")
        }

        setChecking(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()

  const handleResendEmail = async () => {
    if (!auth.currentUser) return
    if (loading) return

    setLoading(true)

    await sendEmailVerification(auth.currentUser).finally(() => {
      setLoading(false)
    })

    ToastAndroid.showWithGravity(
      t("verification_email_sent"),
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    )
  }

  const handleSignOut = () => {
    if (loading) return

    setLoading(true)

    if (auth) {
      signOut(auth).finally(() => setLoading(false))
    }
  }

  return (
    <View style={styles.container}>
      <VerifiedIcon color={Theme.semantic.accent.primary} size={132} />
      <Text style={styles.title}>{t("verify_your_email")}</Text>
      <Text style={styles.subtitle}>
        {t("verify_your_email_desc_1")}
        {"\n"}
        {t("verify_your_email_desc_2")}
      </Text>
      <ActivityIndicator size="large" color={Theme.semantic.accent.primary} style={styles.loader} />
      <Text style={styles.hint}>{t("waiting_verification")}</Text>
      <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleResendEmail}
          style={({ pressed }) => [
            styles.submit,
            pressed && { opacity: 0.9 },
            loading && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("resend_email_verification")}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ width: 32, height: 32 }} />
          ) : (
            <Text style={styles.submitText}>{t("resend_email_verification")}</Text>
          )}
        </Pressable>
      </Animated.View>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSignOut}
        style={({ pressed }) => [
          styles.signout,
          pressed && { opacity: 0.9 },
          loading && { opacity: 0.8 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("sign_out")}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{t("sign_out")}</Text>
        )}
      </Pressable>
    </View>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Theme.semantic.bg.canvas,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 12,
    },
    title: {
      fontSize: Theme.sizes.h1,
      fontFamily: Theme.fonts.onestBold,
      color: Theme.semantic.text.primary,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: Theme.sizes.h4,
      fontFamily: Theme.fonts.onest,
      color: Theme.semantic.text.secondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    loader: {
      marginBottom: 16,
    },
    hint: {
      fontSize: Theme.sizes.h5,
      color: Theme.semantic.text.secondary,
      fontFamily: Theme.fonts.onest,
    },
    submit: {
      backgroundColor: Theme.semantic.accent.primary,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 6,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    submitText: {
      color: "#FFFFFF",
      fontSize: Theme.sizes.h4,
      fontFamily: Theme.fonts.onestBold,
    },
    signout: {
      backgroundColor: Theme.semantic.state.danger,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 6,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
  })
