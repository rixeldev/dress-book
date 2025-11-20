import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("screen")

export const Theme = {
  colors: {
    background: "#000B0A",
    background2: "#001514ff",
    text: "#FFFBFB",
    primary: "#008080",
    primary2: "#00808027",
    secondary: "#D9F4F3",
    accent: "#008080",
    red: "#e32020ff",
    green: "#4CFF4C",
    yellow: "#FFFF4C",
    gray: "#A9A9A9",
    lightGray: "#D3D3D3",
    darkGray: "#464646ff",
    border: "#333333",
    modal: "#001c1aff",
    transparent: "#00000000",
    backdrop: "#00000086",
  },
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
}
