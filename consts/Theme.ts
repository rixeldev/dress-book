import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("screen")

export const lightColors = {
  background: "#F7F2EA",
  background2: "#EDE4D5",
  text: "#191411",
  primary: "#6E2A38",
  primary2: "#6E2A381F",
  secondary: "#E7DAC6",
  accent: "#6E2A38",
  red: "#A3322C",
  green: "#2D6A4F",
  yellow: "#A96E15",
  gray: "#7B6B60",
  ultraLightGray: "#EAE1D266",
  lightGray: "#94857A",
  darkGray: "#332B26",
  border: "#DCD0BD",
  modal: "#FFFDF8",
  transparent: "#00000000",
  backdrop: "#19141180",
  brass: "#B98A4B",
  accentSoft: "#F2E3E1",
  surfaceAlt: "#FBF7F0",
}

export const darkColors = {
  background: "#0E0C0B",
  background2: "#1C1713",
  text: "#F3ECE1",
  primary: "#E8A8B4",
  primary2: "#E8A8B42B",
  secondary: "#251E19",
  accent: "#E8A8B4",
  red: "#F07B72",
  green: "#6FD3A3",
  yellow: "#E8B45E",
  gray: "#B5A79B",
  ultraLightGray: "#251E1988",
  lightGray: "#C9BAB0",
  darkGray: "#E1D4C7",
  border: "#322822",
  modal: "#191410",
  transparent: "#00000000",
  backdrop: "#000000B3",
  brass: "#D8B273",
  accentSoft: "#3A252B",
  surfaceAlt: "#14100E",
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
  section: 28,
  gutter: 20,
} as const

const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
  input: 14,
  card: 20,
  sheet: 28,
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
        raised: colors.surfaceAlt,
      },
      text: {
        primary: colors.text,
        secondary: colors.gray,
        tertiary: colors.lightGray,
        inverse: isDark ? lightColors.text : lightColors.modal,
      },
      accent: {
        primary: colors.primary,
        soft: colors.accentSoft,
        brass: colors.brass,
      },
      state: {
        success: colors.green,
        warning: colors.yellow,
        danger: colors.red,
      },
      border: {
        subtle: colors.border,
        strong: isDark ? "#463A32" : "#CBBBA3",
      },
      overlay: colors.backdrop,
    },
    gradient: {
      hero: isDark
        ? (["#2A1D20", "#171110"] as const)
        : (["#7B3040", "#5A1F2C"] as const),
      brass: isDark
        ? (["#33261A", "#1D1714"] as const)
        : (["#F6E9D3", "#EFE1CB"] as const),
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
      hero: 40,
      display: 34,
      h1: 28,
      h2: 22,
      h3: 18,
      body: 15,
      label: 13,
      caption: 11,
    },
    lineHeights: {
      hero: 46,
      display: 42,
      h1: 36,
      h2: 30,
      h3: 26,
      body: 23,
      label: 19,
      caption: 16,
    },
    spacing,
    radius,
    motion,
    elevation: {
      card: isDark
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            shadowColor: "#2A1A10",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.07,
            shadowRadius: 18,
            elevation: 2,
          },
      sheet: isDark
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            shadowColor: "#2A1A10",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 10,
          },
      floating: isDark
        ? { borderWidth: 1, borderColor: colors.border }
        : {
            shadowColor: "#2A1A10",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.18,
            shadowRadius: 22,
            elevation: 8,
          },
    },
  }
}

// Default export for backward compatibility
export const Theme = createTheme(false)

export type AppTheme = ReturnType<typeof createTheme>
