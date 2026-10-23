export type LengthUnit = "cm" | "in" | "yd" | "m"

export const CM_PER_UNIT: Record<LengthUnit, number> = {
  cm: 1,
  in: 2.54,
  yd: 91.44,
  m: 100,
}

export function toCanonicalCm(value: number, unit: LengthUnit): number {
  return value * CM_PER_UNIT[unit]
}

export function fromCanonicalCm(value: number, unit: LengthUnit): number {
  return value / CM_PER_UNIT[unit]
}

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  return toCanonicalCm(value, from) / CM_PER_UNIT[to]
}

export function roundMeasurement(value: number, precision = 2): number {
  return Math.round(value * 10 ** precision) / 10 ** precision
}

export function formatLength(value: number, unit: LengthUnit, locale = "en-US"): string {
  const rounded = roundMeasurement(value)
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(rounded) + ` ${unit}`
}

export function getUnitLabel(unit: LengthUnit): string {
  const labels: Record<LengthUnit, string> = {
    cm: "cm",
    in: "in",
    yd: "yd",
    m: "m",
  }
  return labels[unit]
}

export function getPreferredUnit(type: "Clothes" | "Curtains" | "Others" | null | undefined): LengthUnit {
  switch (type) {
    case "Clothes":
      return "cm"
    case "Curtains":
      return "yd"
    case "Others":
      return "in"
    default:
      return "cm"
  }
}
