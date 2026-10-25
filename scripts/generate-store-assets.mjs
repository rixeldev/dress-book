// Generates the Google Play store assets from the real app screenshots:
//   docs/images/store/feature-graphic-1024x500.png  (feature graphic)
//   docs/images/store/screenshot-1..5-*.png         (1080x1920, 9:16)
//
// Composition uses the app's own branding: the launcher icon, the brand fonts
// (Onest + JetBrains Mono, straight from node_modules) and the palette tokens.
// The screenshots in docs/images are the source material — keep them as real
// app captures.
//
// Usage: node scripts/generate-store-assets.mjs [es|en|pt-BR|fr]
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

/**
 * One entry per store listing language (roadmap #70). Spanish is the default
 * listing and keeps the flat folder; the others sit in their own subfolder so
 * the Play Console can take each locale's assets.
 */
const STORE = {
  es: {
    dir: join(root, "docs", "images", "store"),
    tagline: "Tu estudio de costura, en orden.",
    footer: "Clientes · Pedidos · Medidas · Telas",
    dualTitle: "Clientes y pedidos",
    dualSubtitle: "Un espacio para tu estudio",
    captions: [
      { source: "today", title: "Tu día, al día", subtitle: "Entregas, pendientes y accesos rápidos" },
      { source: "orders", title: "Pedidos en marcha", subtitle: "Estado, fecha y prioridad de cada pedido" },
      { source: "studio", title: "Tu estudio", subtitle: "Clientes, medidas y estadísticas" },
      { source: "new", title: "Nuevo pedido", subtitle: "Crea un pedido para un cliente en segundos" },
    ],
  },
  en: {
    dir: join(root, "docs", "images", "store", "en"),
    tagline: "Your dressmaking studio, in order.",
    footer: "Clients · Orders · Measurements · Fabrics",
    dualTitle: "Clients and orders",
    dualSubtitle: "A workspace for your studio",
    captions: [
      { source: "today", title: "Your day at a glance", subtitle: "Due dates, pending work, quick actions" },
      { source: "orders", title: "Orders in progress", subtitle: "Status, due date and priority of each order" },
      { source: "studio", title: "Your studio", subtitle: "Clients, measurements and statistics" },
      { source: "new", title: "New order", subtitle: "Create an order for a client in seconds" },
    ],
  },
  "pt-BR": {
    dir: join(root, "docs", "images", "store", "pt-BR"),
    tagline: "Seu ateliê de costura, em ordem.",
    footer: "Clientes · Pedidos · Medidas · Tecidos",
    dualTitle: "Clientes e pedidos",
    dualSubtitle: "Um espaço para seu ateliê",
    captions: [
      { source: "today", title: "Seu dia em dia", subtitle: "Entregas, pendências e atalhos" },
      { source: "orders", title: "Pedidos em andamento", subtitle: "Status, prazo e prioridade de cada pedido" },
      { source: "studio", title: "Seu ateliê", subtitle: "Clientes, medidas e estatísticas" },
      { source: "new", title: "Novo pedido", subtitle: "Crie um pedido para um cliente em segundos" },
    ],
  },
  fr: {
    dir: join(root, "docs", "images", "store", "fr"),
    tagline: "Votre atelier de couture, en ordre.",
    footer: "Clients · Commandes · Mesures · Tissus",
    dualTitle: "Clients et commandes",
    dualSubtitle: "Un espace pour votre atelier",
    captions: [
      { source: "today", title: "Votre journée en vue", subtitle: "Échéances, en cours, raccourcis" },
      { source: "orders", title: "Commandes en cours", subtitle: "Statut, échéance et priorité de chaque commande" },
      { source: "studio", title: "Votre atelier", subtitle: "Clients, mesures et statistiques" },
      { source: "new", title: "Nouvelle commande", subtitle: "Créez une commande pour un client en secondes" },
    ],
  },
}
const lang = STORE[process.argv[2]] ? process.argv[2] : "es"
const store = STORE[lang]
const outDir = store.dir
mkdirSync(outDir, { recursive: true })

/* ------------------------------------------------------------------ fonts */

const font = (name, path) => {
  if (existsSync(path)) GlobalFonts.registerFromPath(path, name)
  return name
}
// Unique family names: the machine may have its own "Onest" installed, which
// would shadow the registered file (and rendered as broken bars).
const ONEST = font("GraphOnest", join(root, "assets", "fonts", "onest-latin-400-normal.ttf"))
const ONEST_BOLD = font("GraphOnestBold", join(root, "assets", "fonts", "onest-latin-800-normal.ttf"))
const MONO = font("GraphMono", join(root, "assets", "fonts", "onest-latin-400-normal.ttf"))
const MONO_BOLD = font("GraphMonoBold", join(root, "assets", "fonts", "onest-latin-800-normal.ttf"))

/* ----------------------------------------------------------------- palette */

const INK = "#0E0C0B"
const INK_HI = "#1D1714"
const CREAM = "#F7F2EA"
const MUTED = "#B9ACA2"
const ORANGE = "#B98A4B"
const ORANGE_DEEP = "#6E2A38"
const TEAL = "#E8A8B4"

/* ----------------------------------------------------------------- helpers */

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws an image cropped ("cover") into a rounded rectangle. */
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
  while (current > 20) {
    ctx.font = `${weight} ${current}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) return current
    current -= 2
  }
  return current
}

const drawGlowText = (ctx, text, x, y, fontSpec, color, glow, blur) => {
  ctx.save()
  ctx.font = fontSpec
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.shadowColor = glow
  ctx.shadowBlur = blur
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

const drawChordChip = (ctx, text, x, y, size, rotation = 0, alpha = 1) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.font = `700 ${size}px ${MONO_BOLD}`
  const padX = size * 0.9
  const w = ctx.measureText(text).width + padX * 2
  const h = size + size * 0.85
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2)
  ctx.fillStyle = colorWithAlpha(TEAL, 0.13)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = colorWithAlpha(TEAL, 0.38)
  ctx.stroke()
  ctx.shadowColor = colorWithAlpha(TEAL, 0.55)
  ctx.shadowBlur = 22
  ctx.fillStyle = TEAL
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 0, size * 0.06)
  ctx.restore()
}

/** Eighth note drawn with vector paths (font-independent, on-brand). */
const drawNoteShape = (ctx, x, y, size, rotation, alpha, color) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  const headR = size * 0.3
  const stemW = size * 0.16
  const stemH = size * 1.5
  ctx.beginPath()
  ctx.ellipse(-stemW * 0.15, 0, headR, headR * 0.76, -0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(-stemW / 2, -stemH, stemW, stemH + headR * 0.35)
  ctx.beginPath()
  ctx.moveTo(stemW / 2, -stemH)
  ctx.bezierCurveTo(
    stemW / 2 + size * 0.62,
    -stemH + size * 0.22,
    stemW / 2 + size * 0.52,
    -stemH + size * 0.86,
    stemW / 2 + size * 0.1,
    -stemH + size * 1.06,
  )
  ctx.bezierCurveTo(
    stemW / 2 + size * 0.44,
    -stemH + size * 0.82,
    stemW / 2 + size * 0.3,
    -stemH + size * 0.36,
    stemW / 2,
    -stemH + size * 0.18,
  )
  ctx.fill()
  ctx.restore()
}

/* ------------------------------------------------------------------ assets */

const images = {
  icon: await loadImage(join(root, "assets", "brand", "icon-1024.png")),
  note: await loadImage(join(root, "assets", "brand", "splash-icon.png")),
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

  // Deep brand background.
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, INK_HI)
  bg.addColorStop(0.55, INK)
  bg.addColorStop(1, "#0D0A16")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Energy: orange glow bottom-left, teal whisper top-right.
  radial(ctx, 300, 520, 560, ORANGE, 0.3)
  radial(ctx, 920, 40, 420, TEAL, 0.12)

  // Diagonal beams.
  const beam = (x, y, w, h, angle, alpha) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, colorWithAlpha(ORANGE, alpha))
    g.addColorStop(1, colorWithAlpha(ORANGE_DEEP, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, -h / 2, w, h)
    ctx.restore()
  }
  beam(40, 470, 980, 120, -0.32, 0.35)
  beam(0, 540, 900, 64, -0.32, 0.22)

  // Watermark of the brand note.
  ctx.save()
  ctx.globalAlpha = 0.06
  ctx.translate(640, 120)
  ctx.rotate(0.22)
  ctx.drawImage(images.note, -230, -230, 460, 460)
  ctx.restore()

  // Floating notes.
  drawNoteShape(ctx, 120, 400, 34, -0.2, 0.45, TEAL)
  drawNoteShape(ctx, 470, 90, 40, 0.15, 0.35, ORANGE)
  drawNoteShape(ctx, 360, 440, 26, 0.1, 0.4, MUTED)
  drawNoteShape(ctx, 620, 430, 30, -0.15, 0.3, CREAM)

  // Phone mockup (tilted, glowing) with a ghost card behind it.
  const phoneW = 232
  const phoneH = 452
  const px = 740
  const py = 32
  const cx = px + phoneW / 2
  const cy = py + phoneH / 2
  const tilt = -0.1
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)
  // ghost
  roundRect(ctx, -phoneW / 2 + 12, -phoneH / 2 + 14, phoneW, phoneH, 26)
  ctx.fillStyle = colorWithAlpha("#FFFFFF", 0.05)
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)
  ctx.shadowColor = colorWithAlpha(ORANGE, 0.55)
  ctx.shadowBlur = 46
  roundRect(ctx, -phoneW / 2, -phoneH / 2, phoneW, phoneH, 26)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.shadowBlur = 0
  roundRect(ctx, -phoneW / 2, -phoneH / 2, phoneW, phoneH, 26)
  ctx.save()
  ctx.clip()
  const scale = Math.max(phoneW / images.today.width, phoneH / images.today.height)
  const sw = phoneW / scale
  const sh = phoneH / scale
  ctx.drawImage(images.today, (images.today.width - sw) / 2, 0, sw, sh, -phoneW / 2, -phoneH / 2, phoneW, phoneH)
  ctx.restore()
  roundRect(ctx, -phoneW / 2, -phoneH / 2, phoneW, phoneH, 26)
  ctx.lineWidth = 2
  ctx.strokeStyle = colorWithAlpha("#FFFFFF", 0.18)
  ctx.stroke()
  ctx.restore()

  // Logo tile + wordmark + tagline.
  const tile = 84
  const tileX = 56
  const tileY = 108
  ctx.save()
  ctx.shadowColor = colorWithAlpha(ORANGE, 0.5)
  ctx.shadowBlur = 30
  roundRect(ctx, tileX, tileY, tile, tile, 20)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.save()
  roundRect(ctx, tileX, tileY, tile, tile, 20)
  ctx.clip()
  ctx.drawImage(images.icon, tileX, tileY, tile, tile)
  ctx.restore()
  ctx.restore()

  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.font = `700 54px ${ONEST_BOLD}`
  ctx.fillStyle = CREAM
  ctx.fillText("Dress Book", tileX + tile + 22, tileY + 44)

  ctx.font = `400 25px ${ONEST}`
  ctx.fillStyle = MUTED
  ctx.fillText(store.tagline, tileX, 238)

  // App-native chord chips under the tagline.
  const chips = ["cm", "in", "yd", "USD"]
  let chipX = tileX + 30
  for (const chord of chips) {
    ctx.font = `700 22px ${MONO_BOLD}`
    const w = ctx.measureText(chord).width + 44
    drawChordChip(ctx, chord, chipX + w / 2 - 22, 306, 22, 0, 1)
    chipX += w + 14
  }

  // Footer line.
  ctx.font = `400 19px ${ONEST}`
  ctx.fillStyle = colorWithAlpha(CREAM, 0.55)
  ctx.fillText(store.footer, tileX, 452)

  writeFileSync(join(outDir, "feature-graphic-1024x500.png"), canvas.toBuffer("image/png"))
}

/* ------------------------------------------------------------- screenshots */

const frameBackground = (ctx, W, H, tealAccent) => {
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, INK_HI)
  bg.addColorStop(0.6, INK)
  bg.addColorStop(1, "#0D0A16")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  radial(ctx, W / 2, 700, 860, ORANGE, 0.22)
  radial(ctx, 120, 1750, 620, tealAccent ? TEAL : ORANGE_DEEP, tealAccent ? 0.16 : 0.18)
  // Top energy line.
  const bar = ctx.createLinearGradient(0, 0, W, 0)
  bar.addColorStop(0, colorWithAlpha(ORANGE, 0))
  bar.addColorStop(0.5, colorWithAlpha(ORANGE, 0.9))
  bar.addColorStop(1, colorWithAlpha(TEAL, 0))
  ctx.fillStyle = bar
  ctx.fillRect(0, 0, W, 6)
}

const drawPhone = (ctx, img, x, y, w, h, rotation = 0) => {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rotation)
  ctx.shadowColor = colorWithAlpha(ORANGE, 0.45)
  ctx.shadowBlur = 60
  roundRect(ctx, -w / 2, -h / 2, w, h, 46)
  ctx.fillStyle = "#000"
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.save()
  roundRect(ctx, -w / 2, -h / 2, w, h, 46)
  ctx.clip()
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale
  const sh = h / scale
  ctx.drawImage(img, (img.width - sw) / 2, 0, sw, sh, -w / 2, -h / 2, w, h)
  ctx.restore()
  roundRect(ctx, -w / 2, -h / 2, w, h, 46)
  ctx.lineWidth = 3
  ctx.strokeStyle = colorWithAlpha("#FFFFFF", 0.16)
  ctx.stroke()
  ctx.restore()
}

const screenshot = (index, { source, title, subtitle }) => {
  const W = 1080
  const H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  frameBackground(ctx, W, H, index % 2 === 1)

  // Decorations.
  drawNoteShape(ctx, 96, 560, 42, -0.2, 0.35, TEAL)
  drawNoteShape(ctx, 990, 1180, 46, 0.18, 0.28, ORANGE)
  drawChordChip(ctx, "cm", 110, 900, 26, -0.14, 0.5)
  drawChordChip(ctx, "yd", 970, 620, 26, 0.14, 0.45)

  // Caption.
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const titleSize = fitFont(ctx, ONEST_BOLD, 700, 72, title, W - 200)
  ctx.font = `700 ${titleSize}px ${ONEST_BOLD}`
  ctx.shadowColor = colorWithAlpha(ORANGE, 0.35)
  ctx.shadowBlur = 26
  ctx.fillStyle = CREAM
  ctx.fillText(title, W / 2, 158)
  ctx.shadowBlur = 0
  ctx.font = `400 33px ${ONEST}`
  ctx.fillStyle = MUTED
  ctx.fillText(subtitle, W / 2, 232)

  // Phone.
  const phoneW = 660
  const phoneH = 1400
  drawPhone(ctx, images[source], (W - phoneW) / 2, 330, phoneW, phoneH)

  // Brand footer.
  const mark = 44
  const markX = W / 2 - 92
  const markY = 1840
  ctx.save()
  roundRect(ctx, markX, markY - mark / 2, mark, mark, 12)
  ctx.clip()
  ctx.drawImage(images.icon, markX, markY - mark / 2, mark, mark)
  ctx.restore()
  ctx.textAlign = "left"
  ctx.font = `700 30px ${ONEST_BOLD}`
  ctx.fillStyle = colorWithAlpha(CREAM, 0.9)
  ctx.fillText("Dress Book", markX + mark + 16, markY + 1)

  const file = `screenshot-${index + 1}-${source}-1080x1920.png`
  writeFileSync(join(outDir, file), canvas.toBuffer("image/png"))
}

/* ------------------------------------------------------------- dual frame */

const dualFrame = () => {
  const W = 1080
  const H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  frameBackground(ctx, W, H, true)

  drawNoteShape(ctx, 110, 620, 40, -0.2, 0.35, ORANGE)
  drawNoteShape(ctx, 980, 560, 44, 0.2, 0.35, TEAL)
  drawChordChip(ctx, "cm", 930, 1500, 26, 0.12, 0.5)
  drawChordChip(ctx, "yd", 120, 1480, 26, -0.12, 0.45)

  const title = store.dualTitle
  const subtitle = store.dualSubtitle

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `700 72px ${ONEST_BOLD}`
  ctx.shadowColor = colorWithAlpha(ORANGE, 0.35)
  ctx.shadowBlur = 26
  ctx.fillStyle = CREAM
  ctx.fillText(title, W / 2, 158)
  ctx.shadowBlur = 0
  ctx.font = `400 33px ${ONEST}`
  ctx.fillStyle = MUTED
  ctx.fillText(subtitle, W / 2, 232)

  drawPhone(ctx, images.orders, 130, 420, 560, 1190, -0.09)
  drawPhone(ctx, images.studio, 430, 560, 580, 1230, 0.05)

  const mark = 44
  const markX = W / 2 - 92
  const markY = 1840
  ctx.save()
  roundRect(ctx, markX, markY - mark / 2, mark, mark, 12)
  ctx.clip()
  ctx.drawImage(images.icon, markX, markY - mark / 2, mark, mark)
  ctx.restore()
  ctx.textAlign = "left"
  ctx.font = `700 30px ${ONEST_BOLD}`
  ctx.fillStyle = colorWithAlpha(CREAM, 0.9)
  ctx.fillText("Dress Book", markX + mark + 16, markY + 1)

  writeFileSync(join(outDir, "screenshot-5-dual-1080x1920.png"), canvas.toBuffer("image/png"))
}

/* -------------------------------------------------------------------- run */

feature()
store.captions.forEach((caption, index) => screenshot(index, caption))
dualFrame()

for (const file of ["feature-graphic-1024x500.png", ...store.captions.map((c, i) => `screenshot-${i + 1}-${c.source}-1080x1920.png`), "screenshot-5-dual-1080x1920.png"]) {
  const size = statSync(join(outDir, file)).size
  console.log(file, (size / 1024 / 1024).toFixed(2) + " MB")
}
console.log("done →", outDir)
