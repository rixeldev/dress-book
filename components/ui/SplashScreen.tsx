import LottieView from "lottie-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ic from "@/assets/lotties/ic_brand.json"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function SplashScreen({
  onFinish,
}: {
  onFinish: () => void
}) {
  const { Theme } = useAppTheme()
  return (
    <SafeAreaView
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: Theme.colors.background,
      }}
    >
      <LottieView
        onAnimationFinish={onFinish}
        source={ic}
        autoPlay
        loop={false}
        duration={3000}
        style={{
          flex: 1,
          width: "50%",
        }}
      />
    </SafeAreaView>
  )
}
