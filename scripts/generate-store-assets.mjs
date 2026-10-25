// Generates Google Play store assets for Dress Book:
//   docs/images/store/feature-graphic-1024x500.png
//   docs/images/store/screenshot-1..5-<name>-1080x1920.png
//
// Uses the app's own branding: the Maker's Mark icon, the Onest + Fraunces
// fonts from node_modules, and the warm-atelier palette tokens.
//
// Usage: node scripts/generate-store-assets.mjs [es|en]
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const STORE = {
  es: {
    dir: join(root, "docs", "images", "store"),
    tagline: "Tu estudio de moda, en orden.",
    footer: "Clientes · Medidas · Pedidos · Telas · Sin conexión",
    captions: [
      { title: "Tu estudio, al día", subtitle: "Pedidos pendientes, entregas y accesos rápidos" },
      { title: "Tus clientes, organizados", subtitle: "Medidas, historial y contacto en un solo lugar" },
      { title: "Pedidos en producción", subtitle: "Estado, fecha de entrega, precio y depósito" },
      { title: "Biblioteca de telas", subtitle: "Stock, proveedor, color y composición" },
      { title: "Medidas precisas", subtitle: "Estudio guiado por tipo de prenda" },
    ],
  },
  en: {
    dir: join(root, "docs", "images", "store", "en"),
    tagline: "Your fashion studio, in order.",
    footer: "Clients · Measurements · Orders · Fabrics · Offline",
    captions: [
      { title: "Your studio, at a glance", subtitle: "Pending orders, due dates and quick actions" },
      { title: "Clients, organized", subtitle: "Measurements, history and contact in one place" },
      { title: "Orders in production", subtitle: "Status, due date, price and deposit" },
      { title: "Fabric library", subtitle: "Stock, supplier, color and composition" },
      { title: "Precise measurements", subtitle: "Guided studio by garment type" },
    ],
  },
}

const lang = STORE[process.argv[2]] ? process.argv[2] : "es"
const store = STORE[lang]
const outDir = store.dir
mkdirSync(outDir, { recursive: true })

// Fonts
const font = (name, path) => {
  if (existsSync(path)) GlobalFonts.registerFromPath(path, name)
  return name
}
const ONEST = font("DBOnest", join(root, "node_modules/@expo-google-fonts/onest/400Regular/Onest_400Regular.ttf"))
const ONEST_BOLD = font("DBOnestBold", join(root, "node_modules/@expo-google-fonts/onest/700Bold/Onest_700Bold.ttf"))
const DISPLAY = font("DBDisplay", join(root, "node_modules/@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf"))

// Palette (warm atelier)
const BG = "#F7F2EA"
const BG2 = "#EDE5D8"
const INK = "#1E1719"
const ACCENT = "#6E2A38"
const BRASS = "#B98A4B"
const MUTED = "#6E625C"

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const icon = await loadImage(join(root, "assets", "brand", "icon-1024.png"))

/* ------------------------------ feature graphic 1024x500 --------------------- */
{
  const W = 1024, H = 500
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, BG)
  bg.addColorStop(1, BG2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Accent wash
  const wash = ctx.createRadialGradient(W * 0.75, H * 0.4, 0, W * 0.75, H * 0.4, 420)
  wash.addColorStop(0, "rgba(110,42,56,0.18)")
  wash.addColorStop(1, "rgba(110,42,56,0)")
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, W, H)

  // Icon
  const iconSize = 260
  ctx.drawImage(icon, W - iconSize - 60, (H - iconSize) / 2, iconSize, iconSize)

  // Wordmark
  ctx.fillStyle = INK
  ctx.font = `600 74px ${DISPLAY}`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.fillText("Dress Book", 70, H / 2 - 60)

  // Tagline
  ctx.fillStyle = ACCENT
  ctx.font = `700 30px ${ONEST_BOLD}`
  ctx.fillText(store.tagline, 70, H / 2 + 10)

  // Footer
  ctx.fillStyle = MUTED
  ctx.font = `400 20px ${ONEST}`
  ctx.fillText(store.footer, 70, H - 50)

  // Brass rule
  ctx.fillStyle = BRASS
  ctx.fillRect(70, H / 2 - 100, 120, 4)

  writeFileSync(join(outDir, "feature-graphic-1024x500.png"), canvas.toBuffer("image/png"))
  console.log("wrote feature-graphic-1024x500.png")
}

/* ------------------------------ screenshots 1080x1920 ----------------------- */
const phoneW = 920
const phoneH = 1840
const phoneX = (1080 - phoneW) / 2
const phoneY = 120

for (let i = 0; i < store.captions.length; i++) {
  const cap = store.captions[i]
  const W = 1080, H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, BG)
  bg.addColorStop(1, BG2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Phone frame
  const r = 60
  roundRect(ctx, phoneX, phoneY, phoneW, phoneH, r)
  ctx.fillStyle = "#FFFFFF"
  ctx.fill()
  ctx.lineWidth = 6
  ctx.strokeStyle = "rgba(30,23,25,0.12)"
  ctx.stroke()

  // Icon inside phone
  const iconSize = 180
  ctx.drawImage(icon, phoneX + (phoneW - iconSize) / 2, phoneY + 120, iconSize, iconSize)

  // Caption title
  ctx.fillStyle = INK
  ctx.font = `600 64px ${DISPLAY}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(cap.title, W / 2, phoneY + phoneH / 2 - 40)

  // Caption subtitle
  ctx.fillStyle = MUTED
  ctx.font = `400 34px ${ONEST}`
  const subLines = cap.subtitle.split(" ").reduce((acc, w) => {
    const last = acc[acc.length - 1]
    if (last && (last + " " + w).length < 34) acc[acc.length - 1] = last + " " + w
    else acc.push(w)
    return acc
  }, [])
  subLines.forEach((line, idx) => {
    ctx.fillText(line, W / 2, phoneY + phoneH / 2 + 20 + idx * 42)
  })

  // Footer
  ctx.fillStyle = ACCENT
  ctx.font = `700 26px ${ONEST_BOLD}`
  ctx.fillText(store.footer, W / 2, H - 60)

  // Brass rule
  ctx.fillStyle = BRASS
  ctx.fillRect(W / 2 - 60, H - 90, 120, 3)

  const name = cap.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  writeFileSync(join(outDir, `screenshot-${i + 1}-${name}-1080x1920.png`), canvas.toBuffer("image/png"))
  console.log(`wrote screenshot-${i + 1}-${name}-1080x1920.png`)
}

console.log("Store assets generated in", outDir)
