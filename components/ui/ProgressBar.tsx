import { View } from "react-native"
import Svg, { Rect } from "react-native-svg"
import { useAppTheme } from "@/hooks/useAppTheme"

interface Props {
  progress: number
}

export const ProgressBar = ({ progress }: Props) => {
  const { Theme } = useAppTheme()
  const bartWidth = 230
  const progressWidth = (progress / 100) * bartWidth

  return (
    <View>
      <Svg width={bartWidth} height="7">
        <Rect width={bartWidth} height="100%" fill={Theme.colors.darkGray} rx={3.5} ry={3.5} />
        <Rect width={progressWidth} height="100%" fill={Theme.colors.accent} rx={3.5} ry={3.5} />
      </Svg>
    </View>
  )
}
