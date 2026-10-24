import Svg, { Circle, Path } from "react-native-svg"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface BrandMarkProps {
  size?: number
  color?: string
  accentColor?: string
}

/**
 * The Dress Book monogram, drawn with theme-aware colors so it stays legible in
 * both light and dark surfaces (the bundled PNG is a single dark tint).
 */
export function BrandMark({ size = 28, color, accentColor }: BrandMarkProps) {
  const { Theme } = useAppTheme()
  const stroke = color ?? Theme.semantic.accent.primary
  const dot = accentColor ?? Theme.semantic.accent.brass

  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" accessibilityRole="image">
      <Circle
        cx={512}
        cy={560}
        r={190}
        stroke={stroke}
        strokeWidth={64}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M322 270v480" stroke={stroke} strokeWidth={64} strokeLinecap="round" fill="none" />
      <Path d="M702 270v480" stroke={stroke} strokeWidth={64} strokeLinecap="round" fill="none" />
      <Circle cx={702} cy={270} r={26} fill={dot} />
    </Svg>
  )
}
