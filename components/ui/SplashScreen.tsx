import LottieView from "lottie-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ic from "@/assets/lotties/ic_brand.json"
import { Theme } from "@/consts/Theme"

export default function SplashScreen({
  onFinish = (isCancelled) => {},
}: {
  onFinish: (isCancelled: boolean) => void
}) {
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
