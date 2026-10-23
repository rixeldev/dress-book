import { daysUntil, formatIsoDate, fromIsoString, parseLegacyTimestamp, toIsoString } from "../dates"

describe("dates timezone safety", () => {
  it("parses ISO strings as UTC instants", () => {
    const parsed = fromIsoString("2026-05-01T12:00:00.000Z")
    expect(parsed?.toISOString()).toBe("2026-05-01T12:00:00.000Z")
  })

  it("returns null for invalid ISO strings", () => {
    expect(fromIsoString("not-a-date")).toBeNull()
    expect(toIsoString(null)).toBeNull()
  })

  it("formats ISO dates without throwing for UTC midnight", () => {
    expect(formatIsoDate("2026-05-01T00:00:00.000Z")).toBeTruthy()
  })

  it("computes days until a future ISO date", () => {
    const future = new Date(Date.now() + 3 * 86_400_000).toISOString()
    expect(daysUntil(future)).toBeGreaterThanOrEqual(2)
  })

  it("returns null for daysUntil with invalid input", () => {
    expect(daysUntil("garbage")).toBeNull()
    expect(daysUntil(null)).toBeNull()
  })

  it("parses legacy timestamps with AM/PM", () => {
    const parsed = parseLegacyTimestamp("12/31/2025 11:59 PM")
    expect(parsed?.getFullYear()).toBe(2025)
    expect(parsed?.getMonth()).toBe(11)
    expect(parsed?.getDate()).toBe(31)
    expect(parsed?.getHours()).toBe(23)
    expect(parsed?.getMinutes()).toBe(59)
  })
})
