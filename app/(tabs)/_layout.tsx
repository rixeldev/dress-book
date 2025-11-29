import { Tabs } from "expo-router"
import { HomeIcon, UserIcon } from "@/icons/Icons"
import { useAppTheme } from "@/hooks/useAppTheme"
import { TabBar } from "@/components/ui/TabBar"
import { useTranslation } from "react-i18next"

export default function TabsLayout() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

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
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          title: t("home"),
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
          title: t("user"),
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />
    </Tabs>
  )
}
