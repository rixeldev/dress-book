import React, { useCallback, useRef, useState } from "react"
import { View, LayoutChangeEvent, Vibration, Platform, DeviceEventEmitter } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useAppTheme } from "@/hooks/useAppTheme"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useFocusEffect } from "expo-router"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { BannerAd, BannerAdSize, TestIds, useForeground } from "react-native-google-mobile-ads"
import { adBannerId } from "@/db/firebaseConfig"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TabBarButton } from "./TabBarButton"
import { AddButton } from "./AddButton"

export const REG_ADDED_EVENT = "reg_added"
export const REG_DELETED_EVENT = "reg_deleted"

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : adBannerId

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { Theme } = useAppTheme()
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 })
  const [isAdLoaded, setIsAdLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const { getItem } = useStorage()
  const insets = useSafeAreaInsets()

  const buttonWidth = dimensions.width / (state.routes.length + 1) // +1 for AddButton
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
        style={{
          bottom: isAdLoaded ? 76 : insets.bottom + 10,
          zIndex: 50,
          flexDirection: "row",
          justifyContent: "space-between",
          alignSelf: "center",
          alignItems: "center",
          backgroundColor: Theme.colors.background2,
          maxWidth: 300,
          maxHeight: 75,
          paddingVertical: 8,
          borderRadius: 30,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
          shadowOpacity: 0.7,
          position: "absolute",
        }}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              backgroundColor: Theme.colors.primary2,
              borderRadius: 30,
              marginHorizontal: currentIndex === 1 ? 8 : 16,
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
            // Adjust position: index 0 stays at 0, index 1 moves to position after AddButton
            const adjustedIndex = index === 0 ? 0 : index + 1
            tabPositionX.value = withSpring(buttonWidth * adjustedIndex, {
              duration: 500,
            })

            setCurrentIndex(index)

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
            <React.Fragment key={route.name}>
              <TabBarButton
                onPress={onPress}
                onLongPress={onLongPress}
                isFocused={isFocused}
                routeName={route.name}
                label={label.toString()}
                color={isFocused ? Theme.colors.primary : Theme.colors.darkGray}
              />
              {index === 0 && <AddButton onRegAdded={() => DeviceEventEmitter.emit(REG_ADDED_EVENT)} />}
            </React.Fragment>
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
