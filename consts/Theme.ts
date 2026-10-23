import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("screen")

export const lightColors = {
  background: "#F7F2EA",
  background2: "#EDE5D8",
  text: "#1E1719",
  primary: "#492532",
  primary2: "#49253224",
  secondary: "#E7D9C7",
  accent: "#492532",
  red: "#A32E2E",
  green: "#2F6B4F",
  yellow: "#C98A2E",
  gray: "#6E625C",
  ultraLightGray: "#EDE5D880",
  lightGray: "#8A7C74",
  darkGray: "#3B3035",
  border: "#DED3C3",
  modal: "#FFFDF9",
  transparent: "#00000000",
  backdrop: "#1E171966",
}

export const darkColors = {
  background: "#0E0C0B",
  background2: "#221C18",
  text: "#F5EFE6",
  primary: "#E8B4C8",
  primary2: "#E8B4C830",
  secondary: "#2C2420",
  accent: "#E8B4C8",
  red: "#FF6B6B",
  green: "#69F0AE",
  yellow: "#FFD740",
  gray: "#B9ACA2",
  ultraLightGray: "#2A221D88",
  lightGray: "#C9BDB3",
  darkGray: "#D8CCC2",
  border: "#332A24",
  modal: "#171310",
  transparent: "#00000000",
  backdrop: "#000000AA",
}

const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const

const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
  input: 8,
  card: 12,
  sheet: 20,
} as const

const motion = {
  fast: 150,
  base: 220,
  slow: 320,
  easing: [0.2, 0, 0, 1] as const,
}

export const createTheme = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors

  return {
    isDark,
    colors,
    semantic: {
      bg: {
        canvas: colors.background,
        surface: colors.modal,
        sunken: colors.background2,
      },
      text: {
        primary: colors.text,
        secondary: colors.gray,
        inverse: isDark ? lightColors.text : lightColors.modal,
      },
      accent: {
        primary: colors.primary,
        brass: isDark ? "#D8B273" : "#B98A4B",
      },
      state: {
        success: colors.green,
        warning: colors.yellow,
        danger: colors.red,
      },
      border: {
        subtle: colors.border,
      },
    },
    fonts: {
      onest: "Onest",
      onestBold: "OnestBold",
      display: "FrauncesSemiBold",
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
    fontSizes: {
      display: 32,
      h1: 26,
      h2: 20,
      h3: 17,
      body: 15,
      label: 13,
      caption: 11,
    },
    lineHeights: {
      display: 40,
      h1: 34,
      h2: 26,
      h3: 24,
      body: 22,
      label: 18,
      caption: 16,
    },
    spacing,
    radius,
    motion,
    elevation: {
      card: isDark
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            shadowColor: lightColors.text,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 2,
          },
      sheet: isDark
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            shadowColor: lightColors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 8,
          },
    },
  }
}

// Default export for backward compatibility
export const Theme = createTheme(false)
