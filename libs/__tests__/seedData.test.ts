import { generateSeedData } from "../seedData"

describe("seedData", () => {
  it("generates two clients and two orders", () => {
    const seed = generateSeedData("user-1")
    expect(seed.clients).toHaveLength(2)
    expect(seed.orders).toHaveLength(2)
    expect(seed.orders[0].clientName).toBe(seed.clients[0].name)
  })

  it("creates orders with future due dates", () => {
    const seed = generateSeedData("user-1")
    expect(seed.orders.every((order) => order.dueDate && new Date(order.dueDate).getTime() > Date.now())).toBe(true)
  })
})
