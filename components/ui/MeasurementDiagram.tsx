import { StyleSheet, View } from "react-native"
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg"
import { useAppTheme } from "@/hooks/useAppTheme"

export type MeasurementDiagramType = "Clothes" | "Curtains" | "Others"

export interface MeasurementDiagramProps {
  type: MeasurementDiagramType
  activeCategory?: string
}

const categoryColors = {
  active: "#492532",
  inactive: "#DED3C3",
}

export function MeasurementDiagram({ type, activeCategory }: MeasurementDiagramProps) {
  const { Theme } = useAppTheme()

  if (type === "Curtains") {
    return (
      <View style={styles.container}>
        <Svg width={160} height={120} viewBox="0 0 160 120">
          <Rect x={20} y={10} width={120} height={8} rx={4} fill={categoryColors.inactive} />
          <Rect x={30} y={18} width={100} height={90} rx={6} fill={categoryColors.inactive} opacity={0.4} />
          <Line x1={80} y1={18} x2={80} y2={108} stroke={categoryColors.inactive} strokeWidth={1} />
          <SvgText x={80} y={118} fontSize={10} fill={Theme.semantic.text.secondary} textAnchor="middle">
            Curtain
          </SvgText>
        </Svg>
      </View>
    )
  }

  if (type === "Others") {
    return (
      <View style={styles.container}>
        <Svg width={160} height={120} viewBox="0 0 160 120">
          <Rect x={40} y={30} width={80} height={60} rx={8} fill={categoryColors.inactive} opacity={0.4} />
          <Line x1={40} y1={60} x2={120} y2={60} stroke={categoryColors.inactive} strokeWidth={1} />
          <Line x1={80} y1={30} x2={80} y2={90} stroke={categoryColors.inactive} strokeWidth={1} />
          <SvgText x={80} y={118} fontSize={10} fill={Theme.semantic.text.secondary} textAnchor="middle">
            Object
          </SvgText>
        </Svg>
      </View>
    )
  }

  // Clothes body outline
  const active = (category: string) => (activeCategory === category ? categoryColors.active : categoryColors.inactive)

  return (
    <View style={styles.container}>
      <Svg width={160} height={220} viewBox="0 0 160 220">
        <Circle cx={80} cy={24} r={16} fill={active("headAndNeck")} opacity={0.35} />
        <Line x1={80} y1={40} x2={80} y2={52} stroke={active("upperTorso")} strokeWidth={2} />
        <Path d="M55 52 L105 52 L110 95 L50 95 Z" fill={active("upperTorso")} opacity={0.25} />
        <Path d="M50 95 L110 95 L108 140 L52 140 Z" fill={active("midTorso")} opacity={0.25} />
        <Path d="M52 140 L108 140 L105 200 L55 200 Z" fill={active("hipsAndPelvis")} opacity={0.25} />
        <Line x1={55} y1={52} x2={40} y2={95} stroke={active("arms")} strokeWidth={2} />
        <Line x1={105} y1={52} x2={120} y2={95} stroke={active("arms")} strokeWidth={2} />
        <Line x1={60} y1={140} x2={58} y2={210} stroke={active("legs")} strokeWidth={2} />
        <Line x1={100} y1={140} x2={102} y2={210} stroke={active("legs")} strokeWidth={2} />
        <SvgText x={80} y={218} fontSize={10} fill={Theme.semantic.text.secondary} textAnchor="middle">
          Body
        </SvgText>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
})
