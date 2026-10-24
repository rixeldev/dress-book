const timestampPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i

export function parseLegacyTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = value.match(timestampPattern)
  if (!match) return null

  const [, month, day, year, hour = "0", minute = "0", meridian] = match
  let normalizedHour = Number(hour)
  if (meridian) {
    if (meridian.toUpperCase() === "PM" && normalizedHour < 12) normalizedHour += 12
    if (meridian.toUpperCase() === "AM" && normalizedHour === 12) normalizedHour = 0
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    normalizedHour,
    Number(minute),
  )

  return Number.isNaN(date.getTime()) ? null : date
}

export function toIsoString(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null
}

export function fromIsoString(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatIsoDate(value: string | null | undefined, locale = "en-US"): string {
  const date = fromIsoString(value)
  if (!date) return ""
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function formatIsoTime(value: string | null | undefined, locale = "en-US"): string {
  const date = fromIsoString(value)
  if (!date) return ""
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function daysUntil(value: string | null | undefined): number | null {
  const date = fromIsoString(value)
  if (!date) return null
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000)
}
