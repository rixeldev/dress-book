import { calculateBalance, formatMoney } from "../money"

describe("money", () => {
  it("formats null amounts as an em dash", () => {
    expect(formatMoney(null, "USD")).toBe("—")
    expect(formatMoney(undefined, "EUR")).toBe("—")
  })

  it("formats a positive balance", () => {
    expect(formatMoney(120.5, "USD")).toBe("$120.50")
  })

  it("calculates balance after deposit", () => {
    expect(calculateBalance(100, 35)).toBe(65)
    expect(calculateBalance(100, null)).toBeNull()
  })
})
