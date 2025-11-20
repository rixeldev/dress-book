import { Tabs } from "expo-router"
import { OfflineIcon, OnlineIcon } from "@/icons/Icons"
import { Theme } from "@/consts/Theme"
import { TabBar } from "@/components/ui/TabBar"
import { useTranslation } from "react-i18next"

export default function TabsLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.text,
        tabBarStyle: {
          backgroundColor: Theme.colors.transparent,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <OnlineIcon color={color} />,
          title: t("online"),
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />

      <Tabs.Screen
        name="offline"
        options={{
          tabBarIcon: ({ color }) => <OfflineIcon color={color} />,
          title: t("offline"),
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />
    </Tabs>
  )
}
