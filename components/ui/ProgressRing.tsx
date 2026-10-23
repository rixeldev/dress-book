import { StyleSheet, Text, View } from "react-native"
import { Circle, Svg } from "react-native-svg"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  style?: StyleProp<ViewStyle>
}

export function ProgressRing({
  value,
  size = 56,
  strokeWidth = 6,
  color,
  trackColor,
  label,
  style,
}: ProgressRingProps) {
  const { Theme } = useAppTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? Theme.semantic.bg.sunken}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color ?? Theme.semantic.accent.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {label && (
        <View style={styles.label}>
          <Text style={{ color: Theme.semantic.text.primary, fontFamily: Theme.fonts.onestBold, fontSize: size * 0.22 }}>
            {label}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
})
