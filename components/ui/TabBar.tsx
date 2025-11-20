import { View, StyleSheet, LayoutChangeEvent, Vibration, Platform } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Theme } from "@/consts/Theme"
import { useCallback, useRef, useState } from "react"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useFocusEffect } from "expo-router"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { BannerAd, BannerAdSize, TestIds, useForeground } from "react-native-google-mobile-ads"
import { adBannerId } from "@/db/firebaseConfig"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TabBarButton } from "./TabBarButton"

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : adBannerId

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 })
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  const { getItem } = useStorage()
  const insets = useSafeAreaInsets()

  const buttonWidth = dimensions.width / state.routes.length
  const bannerRef = useRef<BannerAd>(null)

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load()
  })

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const vibrationValue = await getItem("vibration")
        setVibrationEnabled(parseBoolean(vibrationValue))
      }
      loadSettings()
    }, []),
  )

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    })
  }

  const tabPositionX = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    }
  })

  return (
    <View style={{ position: "relative", gap: 12 }}>
      <View
        onLayout={onTabbarLayout}
        style={[
          {
            bottom: isAdLoaded ? 76 : insets.bottom + 10,
          },
          styles.tabbar,
        ]}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              backgroundColor: Theme.colors.primary2,
              borderRadius: 30,
              marginHorizontal: 12,
              height: dimensions.height - 15,
              width: buttonWidth - 25,
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isFocused = state.index === index

          const onPress = () => {
            if (vibrationEnabled) {
              Vibration.vibrate(10)
            }
            tabPositionX.value = withSpring(buttonWidth * index, {
              duration: 500,
            })

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            })
          }

          return (
            <TabBarButton
              key={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routeName={route.name}
              label={label.toString()}
              color={isFocused ? Theme.colors.primary : Theme.colors.darkGray}
            />
          )
        })}
      </View>

      <View
        style={{
          opacity: isAdLoaded ? 1 : 0,
          alignItems: "center",
        }}
      >
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={() => setIsAdLoaded(true)}
          onAdFailedToLoad={() => setIsAdLoaded(false)}
          requestOptions={{
            keywords: [
              "games",
              "gaming",
              "multiplayer",
              "action",
              "android",
              "technology",
              "software",
              "mobile development",
            ],
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabbar: {
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background2,
    maxWidth: 200,
    paddingVertical: 8,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    position: "absolute",
  },
})
