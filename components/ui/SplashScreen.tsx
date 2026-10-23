import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { Theme } = useAppTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Theme.motion.base,
        easing: Easing.bezier(0.2, 0, 0, 1),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(onFinish, 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Theme.colors.background }]}>
      <Animated.Image
        source={require("@/assets/icons/ic_brand.png")}
        resizeMode="contain"
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 168,
    height: 168,
  },
})
