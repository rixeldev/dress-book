import { useEffect, useRef } from "react"
import { Animated, StyleSheet } from "react-native"
import type { DimensionValue, StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface SkeletonProps {
  width?: DimensionValue
  height?: number
  radius?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius,
  style,
  testID,
}: SkeletonProps) {
  const { Theme } = useAppTheme()
  const opacity = useRef(new Animated.Value(0.55)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
      ]),
    )
    animation.start()
    return () => {
      animation.stop()
      opacity.setValue(0.55)
    }
  }, [opacity])

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius ?? Theme.radius.sm,
          backgroundColor: Theme.semantic.bg.sunken,
          opacity,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
})
