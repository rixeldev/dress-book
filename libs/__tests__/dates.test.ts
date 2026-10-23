import { daysUntil, fromIsoString, parseLegacyTimestamp, toIsoString } from "../dates"

describe("dates", () => {
  it("parses the legacy timestamp format", () => {
    const parsed = parseLegacyTimestamp("1/2/2026 2:30 PM")
    expect(parsed?.getFullYear()).toBe(2026)
    expect(parsed?.getMonth()).toBe(0)
    expect(parsed?.getDate()).toBe(2)
    expect(parsed?.getHours()).toBe(14)
    expect(parsed?.getMinutes()).toBe(30)
  })

  it("returns null for an invalid legacy timestamp", () => {
    expect(parseLegacyTimestamp("not a date")).toBeNull()
  })

  it("round-trips ISO strings", () => {
    const date = new Date("2026-01-02T14:30:00.000Z")
    expect(toIsoString(date)).toBe(date.toISOString())
    expect(fromIsoString(date.toISOString())?.getTime()).toBe(date.getTime())
  })

  it("calculates whole-day distance", () => {
    const future = new Date(Date.now() + 2 * 86_400_000).toISOString()
    expect(daysUntil(future)).toBeGreaterThanOrEqual(1)
  })
})
