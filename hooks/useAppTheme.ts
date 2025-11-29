import { useTheme as useThemeContext } from "@/contexts/ThemeContext"

// Re-export for convenience
export const useAppTheme = () => {
  const { theme, isDark, themeMode, setThemeMode } = useThemeContext()
  return { Theme: theme, isDark, themeMode, setThemeMode }
}
