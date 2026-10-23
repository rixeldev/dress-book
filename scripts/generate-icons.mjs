import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = process.cwd()
const brandDir = path.join(root, "assets/brand")
const iconsDir = path.join(root, "assets/icons")

const readSvg = (name) => fs.readFile(path.join(brandDir, name))

const render = async (svg, size, output, { opaque = false } = {}) => {
  await fs.mkdir(path.dirname(output), { recursive: true })
  const pipeline = sharp(svg).resize(size, size, { fit: "contain" })
  if (opaque) pipeline.flatten({ background: "#F7F2EA" }).removeAlpha()
  await pipeline.png().toFile(output)
}

const master = await readSvg("icon-master.svg")
const mark = await readSvg("icon-mark.svg")
const markLight = await readSvg("icon-mark-light.svg")
const monochrome = await readSvg("icon-monochrome.svg")

await render(master, 1024, path.join(brandDir, "icon-1024.png"), { opaque: true })
await render(master, 512, path.join(brandDir, "icon-512.png"), { opaque: true })
await render(mark, 1024, path.join(brandDir, "adaptive-foreground.png"))
await render(monochrome, 1024, path.join(brandDir, "adaptive-monochrome.png"))
await render(mark, 512, path.join(brandDir, "splash-icon.png"))
await render(markLight, 512, path.join(brandDir, "splash-icon-dark.png"))
await render(mark, 192, path.join(brandDir, "favicon.png"))
await render(mark, 512, path.join(iconsDir, "ic_brand.png"))

const densities = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
}

for (const [density, size] of Object.entries(densities)) {
  const dir = path.join(iconsDir, `mipmap-${density}`)
  await render(master, size, path.join(dir, "ic_launcher.png"), { opaque: true })
  await render(master, size, path.join(dir, "ic_launcher_round.png"), { opaque: true })
  await render(mark, size, path.join(dir, "ic_launcher_foreground.png"))
  await render(monochrome, size, path.join(dir, "ic_launcher_monochrome.png"))
}

await render(monochrome, 96, path.join(iconsDir, "notification-icon.png"))

console.log("Generated brand assets.")
