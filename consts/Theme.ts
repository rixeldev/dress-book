import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("screen")

export const lightColors = {
  background: "#F1F1F1",
  background2: "#E1E1E1FF",
  text: "#1C1C1C",
  primary: "#492532",
  primary2: "#49253227",
  secondary: "#D9F4F3",
  accent: "#492532",
  red: "#e32020ff",
  green: "#4CFF4C",
  yellow: "#FFFF4C",
  gray: "#A9A9A9",
  ultraLightGray: "#E1E1E177",
  lightGray: "#939393",
  darkGray: "#353535ff",
  border: "#333333",
  modal: "#FFFFFF",
  transparent: "#00000000",
  backdrop: "#00000086",
}

export const darkColors = {
  background: "#0D0D0D",
  background2: "#1A1A1A",
  text: "#F5F5F5",
  primary: "#E8B4C8",
  primary2: "#E8B4C830",
  secondary: "#2C4A4A",
  accent: "#E8B4C8",
  red: "#FF6B6B",
  green: "#69F0AE",
  yellow: "#FFD740",
  gray: "#A0A0A0",
  ultraLightGray: "#2A2A2A88",
  lightGray: "#B0B0B0",
  darkGray: "#D0D0D0",
  border: "#3A3A3A",
  modal: "#1A1A1A",
  transparent: "#00000000",
  backdrop: "#000000DD",
}

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  fonts: {
    onest: "Onest",
    onestBold: "OnestBold",
  },
  sizes: {
    h0: 24,
    h1: 22,
    h2: 20,
    h3: 18,
    h4: 16,
    h5: 14,
    h6: 12,
    width,
    height,
  },
})

// Default export for backward compatibility
export const Theme = createTheme(false)
