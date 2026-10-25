// Generates Google Play store assets for Dress Book from real screenshots:
//   docs/images/store/feature-graphic-1024x500.png
//   docs/images/store/screenshot-1..4-*.png (1080x1920)
//
// Usage: node scripts/generate-store-assets.mjs [es|en]
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const STORE = {
  es: {
    dir: join(root, "docs", "images", "store"),
    tagline: "Tu estudio de moda, en orden.",
    footer: "Clientes · Medidas · Pedidos · Telas",
    captions: [
      { source: "today", title: "Hoy en tu estudio", subtitle: "Entregas, atrasos y accesos rápidos" },
      { source: "orders", title: "Pedidos bajo control", subtitle: "Estado, fecha y prioridad de un vistazo" },
      { source: "studio", title: "Tu estudio, organizado", subtitle: "Clientes, medidas y estadísticas" },
      { source: "new", title: "Añade en segundos", subtitle: "Nuevo cliente, pedido o medida" },
    ],
  },
  en: {
    dir: join(root, "docs", "images", "store", "en"),
    tagline: "Your fashion studio, in order.",
    footer: "Clients · Measurements · Orders · Fabrics",
    captions: [
      { source: "today", title: "Today in your studio", subtitle: "Due dates, overdue and quick actions" },
      { source: "orders", title: "Orders under control", subtitle: "Status, due date and priority at a glance" },
      { source: "studio", title: "Your studio, organized", subtitle: "Clients, measurements and stats" },
      { source: "new", title: "Add in seconds", subtitle: "New client, order or measurement" },
    ],
  },
}

const lang = STORE[process.argv[2]] ? process.argv[2] : "es"
const store = STORE[lang]
const outDir = store.dir
mkdirSync(outDir, { recursive: true })

const font = (name, path) => {
  if (existsSync(path)) GlobalFonts.registerFromPath(path, name)
  return name
}
const FRAUNCES = font("DressFraunces", join(root, "node_modules/@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf"))
const SANS = "sans-serif"

const IVORY = "#F7F2EA"
const OXBLOOD = "#6E2A38"
const BRASS = "#B98A4B"
const DARK = "#0E0C0B"
const MUTED = "#7B6B60"

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const drawCover = (ctx, img, x, y, w, h, r) => {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

const radial = (ctx, x, y, r, color, alpha) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, colorWithAlpha(color, alpha))
  g.addColorStop(1, colorWithAlpha(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

const colorWithAlpha = (hex, alpha) => {
  const value = parseInt(hex.replace("#", ""), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

const wrap = (ctx, text, maxWidth) => {
  const words = text.split(" ")
  const lines = []
  let line = ""
  for (const word of words) {
    const candidate = line.length === 0 ? word : `${line} ${word}`
    if (ctx.measureText(candidate).width <= maxWidth || line.length === 0) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line.length > 0) lines.push(line)
  return lines
}

const fitFont = (ctx, family, weight, size, text, maxWidth) => {
  let current = size
  while (current > 18) {
    ctx.font = `${weight} ${current}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) return current
    current -= 2
  }
  return current
}

const images = {
  icon: await loadImage(join(root, "assets", "brand", "icon-1024.png")),
  today: await loadImage(join(root, "docs", "images", "today.jpg")),
  orders: await loadImage(join(root, "docs", "images", "orders.jpg")),
  studio: await loadImage(join(root, "docs", "images", "studio.jpg")),
  new: await loadImage(join(root, "docs", "images", "new.jpg")),
}

/* --------------------------------------------------------- feature graphic */
const feature = () => {
  const W = 1024
  const H = 500
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, "#7B3040")
  bg.addColorStop(1, "#5A1F2C")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  radial(ctx, 260, 480, 520, BRASS, 0.22)
  radial(ctx, 900, 60, 380, IVORY, 0.08)

  // Icon tile
  const tile = 96
  const tileX = 64
  const tileY = 110
  ctx.save()
  ctx.shadowColor = colorWithAlpha(BRASS, 0.45)
  ctx.shadowBlur = 28
  roundRect(ctx, tileX, tileY, tile, tile, 24)
  ctx.fillStyle = IVORY
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.save()
  roundRect(ctx, tileX, tileY, tile, tile, 24)
  ctx.clip()
  ctx.drawImage(images.icon, tileX, tileY, tile, tile)
  ctx.restore()
  ctx.restore()

  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  const titleSize = fitFont(ctx, FRAUNCES, 600, 62, "Dress Book", W - tileX - tile - 120)
  ctx.font = `600 ${titleSize}px ${FRAUNCES}`
  ctx.fillStyle = IVORY
  ctx.fillText("Dress Book", tileX + tile + 24, tileY + 30)

  ctx.font = `400 26px ${SANS}`
  ctx.fillStyle = colorWithAlpha(IVORY, 0.85)
  ctx.fillText(store.tagline, tileX + tile + 24, tileY + 78)

  // Phone mockup
  const phoneW = 260
  const phoneH = 500
  const px = 700
  const py = 0
  ctx.save()
  ctx.shadowColor = colorWithAlpha("#000", 0.4)
  ctx.shadowBlur = 40
  roundRect(ctx, px, py, phoneW, phoneH, 32)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.save()
  roundRect(ctx, px, py, phoneW, phoneH, 32)
  ctx.clip()
  drawCover(ctx, images.today, px, py, phoneW, phoneH, 0)
  ctx.restore()
  roundRect(ctx, px, py, phoneW, phoneH, 32)
  ctx.lineWidth = 2
  ctx.strokeStyle = colorWithAlpha(IVORY, 0.2)
  ctx.stroke()
  ctx.restore()

  // Footer
  ctx.textAlign = "left"
  ctx.font = `400 20px ${SANS}`
  ctx.fillStyle = colorWithAlpha(IVORY, 0.7)
  ctx.fillText(store.footer, tileX, H - 36)

  writeFileSync(join(outDir, "feature-graphic-1024x500.png"), canvas.toBuffer("image/png"))
}

/* ------------------------------------------------------------- screenshots */
const screenshot = (index, { source, title, subtitle }) => {
  const W = 1080
  const H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, "#7B3040")
  bg.addColorStop(1, "#5A1F2C")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  radial(ctx, W / 2, 800, 900, BRASS, 0.18)
  radial(ctx, 120, 1700, 600, IVORY, 0.06)

  // Top accent line
  const bar = ctx.createLinearGradient(0, 0, W, 0)
  bar.addColorStop(0, colorWithAlpha(BRASS, 0))
  bar.addColorStop(0.5, colorWithAlpha(BRASS, 0.9))
  bar.addColorStop(1, colorWithAlpha(IVORY, 0))
  ctx.fillStyle = bar
  ctx.fillRect(0, 0, W, 6)

  // Caption
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const titleSize = fitFont(ctx, FRAUNCES, 600, 74, title, W - 200)
  ctx.font = `600 ${titleSize}px ${FRAUNCES}`
  ctx.shadowColor = colorWithAlpha(BRASS, 0.4)
  ctx.shadowBlur = 20
  ctx.fillStyle = IVORY
  ctx.fillText(title, W / 2, 170)
  ctx.shadowBlur = 0
  ctx.font = `400 34px ${SANS}`
  ctx.fillStyle = colorWithAlpha(IVORY, 0.8)
  ctx.fillText(subtitle, W / 2, 246)

  // Phone
  const phoneW = 720
  const phoneH = 1480
  const px = (W - phoneW) / 2
  const py = 340
  ctx.save()
  ctx.shadowColor = colorWithAlpha("#000", 0.45)
  ctx.shadowBlur = 60
  roundRect(ctx, px, py, phoneW, phoneH, 48)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.save()
  roundRect(ctx, px, py, phoneW, phoneH, 48)
  ctx.clip()
  drawCover(ctx, images[source], px, py, phoneW, phoneH, 0)
  ctx.restore()
  roundRect(ctx, px, py, phoneW, phoneH, 48)
  ctx.lineWidth = 3
  ctx.strokeStyle = colorWithAlpha(IVORY, 0.18)
  ctx.stroke()
  ctx.restore()

  // Brand footer
  const mark = 48
  const markX = W / 2 - 100
  const markY = 1850
  ctx.save()
  roundRect(ctx, markX, markY - mark / 2, mark, mark, 14)
  ctx.clip()
  ctx.drawImage(images.icon, markX, markY - mark / 2, mark, mark)
  ctx.restore()
  ctx.textAlign = "left"
  ctx.font = `600 32px ${FRAUNCES}`
  ctx.fillStyle = colorWithAlpha(IVORY, 0.9)
  ctx.fillText("Dress Book", markX + mark + 16, markY + 2)

  const file = `screenshot-${index + 1}-${source}-1080x1920.png`
  writeFileSync(join(outDir, file), canvas.toBuffer("image/png"))
}

/* -------------------------------------------------------------------- run */
feature()
store.captions.forEach((caption, index) => screenshot(index, caption))

for (const file of ["feature-graphic-1024x500.png", ...store.captions.map((c, i) => `screenshot-${i + 1}-${c.source}-1080x1920.png`)]) {
  const size = statSync(join(outDir, file)).size
  console.log(file, (size / 1024 / 1024).toFixed(2) + " MB")
}
console.log("done →", outDir)
