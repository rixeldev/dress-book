import { formatTime } from "../formatTime"

describe("formatTime", () => {
  it("pads seconds below ten", () => {
    expect(formatTime(5)).toBe("0:05")
  })

  it("formats minutes and seconds", () => {
    expect(formatTime(65)).toBe("1:05")
    expect(formatTime(600)).toBe("10:00")
  })

  it("handles zero", () => {
    expect(formatTime(0)).toBe("0:00")
  })
})
