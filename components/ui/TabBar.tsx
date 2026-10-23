import { useCallback, useRef, useState } from "react"
import { DeviceEventEmitter, Platform, StyleSheet, Vibration, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { BannerAd, BannerAdSize, TestIds, useForeground } from "react-native-google-mobile-ads"
import { useFocusEffect } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { adBannerId } from "@/db/firebaseConfig"
import { AddButton } from "./AddButton"
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
    <View style={[styles.container, { paddingBottom: isAdLoaded ? 0 : insets.bottom + 8 }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: Theme.semantic.bg.surface,
            borderColor: Theme.semantic.border.subtle,
          },
          Theme.elevation.card,
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
              icon={options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            />
          )
        })}
      </View>

      <View style={styles.quickAdd} pointerEvents="box-none">
        <AddButton onRegAdded={() => DeviceEventEmitter.emit(REG_ADDED_EVENT)} />
      </View>

      <View style={[styles.ad, { opacity: isAdLoaded ? 1 : 0 }]}>
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
  },
  bar: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  quickAdd: {
    position: "absolute",
    top: -58,
    alignSelf: "center",
    zIndex: 2,
  },
  ad: {
    alignItems: "center",
  },
})
