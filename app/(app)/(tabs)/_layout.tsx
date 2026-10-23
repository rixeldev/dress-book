import { Tabs } from "expo-router"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/hooks/useAppTheme"
import { TabBar } from "@/components/ui/TabBar"
import { HomeIcon, ListIcon, PackageIcon, UsersIcon, UserIcon } from "@/icons/Icons"

export default function TabsLayout() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Theme.semantic.accent.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          title: t("home"),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          tabBarIcon: ({ color }) => <UsersIcon color={color} />,
          title: t("clients"),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color }) => <ListIcon color={color} />,
          title: t("orders"),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color }) => <PackageIcon color={color} />,
          title: t("library"),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
          title: t("more"),
        }}
      />
    </Tabs>
  )
}
