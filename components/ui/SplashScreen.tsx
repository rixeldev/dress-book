import { useEffect, useRef, useState } from "react"
import { AccessibilityInfo, Animated, Easing, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { Theme } = useAppTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled)
    })
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion)
    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1)
      scale.setValue(1)
      const timer = setTimeout(onFinish, 300)
      return () => clearTimeout(timer)
    }

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
  }, [reduceMotion])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Theme.semantic.bg.canvas }]}>
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
