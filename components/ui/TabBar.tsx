import { useCallback, useRef, useState } from "react"
import { Platform, StyleSheet, Vibration, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { BannerAd, BannerAdSize, TestIds, useForeground } from "react-native-google-mobile-ads"
import { useFocusEffect } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { adBannerId } from "@/db/firebaseConfig"
import { TabBarButton } from "./TabBarButton"

export const REG_ADDED_EVENT = "reg_added"
export const REG_DELETED_EVENT = "reg_deleted"

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : adBannerId

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { Theme } = useAppTheme()
  const { getItem } = useStorage()
  const insets = useSafeAreaInsets()
  const bannerRef = useRef<BannerAd>(null)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  useForeground(() => {
    if (Platform.OS === "ios") bannerRef.current?.load()
  })

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        setVibrationEnabled(parseBoolean(await getItem("vibration")))
      }

      loadSettings()
    }, [getItem]),
  )

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: Theme.semantic.bg.surface,
            borderColor: Theme.semantic.border.subtle,
          },
          Theme.elevation.floating,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name
          const isFocused = state.index === index
          const color = isFocused ? Theme.semantic.accent.primary : Theme.semantic.text.secondary

          const onPress = () => {
            if (vibrationEnabled) Vibration.vibrate(10)

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          return (
            <TabBarButton
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              isFocused={isFocused}
              label={label.toString()}
              icon={options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
            />
          )
        })}
      </View>

      {/* The banner keeps loading while collapsed; zero height means an empty
          ad slot never reserves visible space. */}
      <View style={[styles.ad, isAdLoaded ? styles.adVisible : styles.adHidden]}>
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={() => setIsAdLoaded(true)}
          onAdFailedToLoad={() => setIsAdLoaded(false)}
          requestOptions={{ keywords: ["fashion design", "dressmaking", "sewing", "tailoring"] }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  bar: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  ad: {
    alignItems: "center",
  },
  adHidden: {
    height: 0,
    overflow: "hidden",
  },
  adVisible: {
    marginTop: 0,
  },
})
