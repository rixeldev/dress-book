import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useColorScheme } from "react-native"
import { useStorage } from "@/hooks/useStorage"
import { createTheme } from "@/consts/Theme"

export type ThemeMode = "light" | "dark" | "automatic"

interface ThemeContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  isDark: boolean
  theme: ReturnType<typeof createTheme>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>("automatic")
  const { getItem, setItem } = useStorage()

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getItem("theme")
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "automatic")) {
        setThemeModeState(savedTheme as ThemeMode)
      }
    }
    loadTheme()
  }, [])

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await setItem("theme", mode)
  }

  const isDark = themeMode === "automatic" 
    ? systemColorScheme === "dark" 
    : themeMode === "dark"

  const theme = createTheme(isDark)

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
