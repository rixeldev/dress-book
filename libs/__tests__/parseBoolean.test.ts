import { parseBoolean } from "../parseBoolean"

describe("parseBoolean", () => {
  it("passes through booleans", () => {
    expect(parseBoolean(true)).toBe(true)
    expect(parseBoolean(false)).toBe(false)
  })

  it("accepts common true strings", () => {
    for (const value of ["true", "TRUE", "1", "yes", "on", " true "]) {
      expect(parseBoolean(value)).toBe(true)
    }
  })

  it("accepts common false strings", () => {
    for (const value of ["false", "FALSE", "0", "no", "off", "", "  "]) {
      expect(parseBoolean(value)).toBe(false)
    }
  })

  it("falls back to truthiness for other values", () => {
    expect(parseBoolean(null)).toBe(false)
    expect(parseBoolean(undefined)).toBe(false)
    expect(parseBoolean(1)).toBe(true)
  })
})
