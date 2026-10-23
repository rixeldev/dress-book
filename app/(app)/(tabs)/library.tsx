import { useTranslation } from "react-i18next"
import { PackageIcon } from "@/icons/Icons"
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder"
import { useAppTheme } from "@/hooks/useAppTheme"

export default function LibraryScreen() {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()

  return (
    <WorkspacePlaceholder
      title={t("library")}
      description={t("library_empty_desc")}
      icon={<PackageIcon color={Theme.semantic.accent.primary} size={30} />}
    />
  )
}
