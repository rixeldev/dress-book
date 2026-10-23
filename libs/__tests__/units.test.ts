import {
  CM_PER_UNIT,
  convertLength,
  fromCanonicalCm,
  getPreferredUnit,
  roundMeasurement,
  toCanonicalCm,
} from "../units"

describe("units", () => {
  it("converts measurement units through canonical centimeters", () => {
    expect(toCanonicalCm(1, "in")).toBeCloseTo(2.54)
    expect(fromCanonicalCm(2.54, "in")).toBeCloseTo(1)
    expect(convertLength(1, "yd", "cm")).toBeCloseTo(91.44)
  })

  it("rounds measurements without floating-point residue", () => {
    expect(roundMeasurement(2.34567)).toBe(2.35)
  })

  it("selects the legacy default unit by record type", () => {
    expect(getPreferredUnit("Curtains")).toBe("yd")
    expect(getPreferredUnit("Others")).toBe("in")
    expect(getPreferredUnit(null)).toBe("cm")
  })

  it("exposes the conversion constants", () => {
    expect(CM_PER_UNIT.cm).toBe(1)
  })
})
