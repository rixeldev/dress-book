import { useTranslation } from "react-i18next"
import { ListIcon } from "@/icons/Icons"
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function OrdersScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  return (
    <WorkspacePlaceholder
      title={t("orders")}
      description={t("orders_empty_desc")}
      icon={<ListIcon color={Theme.semantic.accent.primary} size={30} />}
    />
  )
}
