import { useTranslation } from "react-i18next"
import { UsersIcon } from "@/icons/Icons"
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function ClientsScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  return (
    <WorkspacePlaceholder
      title={t("clients")}
      description={t("clients_empty_desc")}
      icon={<UsersIcon color={Theme.semantic.accent.primary} size={30} />}
    />
  )
}
