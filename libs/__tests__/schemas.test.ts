import { clientSchema, orderSchema } from "../schemas"

describe("schemas", () => {
  it("trims and validates a client", () => {
    const result = clientSchema.parse({ name: "  Ana  ", email: "ana@example.com", tags: ["vip"] })
    expect(result.name).toBe("Ana")
    expect(result.email).toBe("ana@example.com")
  })

  it("rejects an invalid client email", () => {
    expect(() => clientSchema.parse({ name: "Ana", email: "not-an-email" })).toThrow()
  })

  it("validates an order with a delivery date", () => {
    const result = orderSchema.parse({
      clientId: "client-1",
      clientName: "Ana",
      title: "Wedding dress",
      type: "Clothes",
      status: "consultation",
      dueDate: "2026-05-01T12:00:00.000Z",
      currency: "USD",
    })
    expect(result.priority).toBe("normal")
    expect(result.dueDate).toBe("2026-05-01T12:00:00.000Z")
  })

  it("rejects an unknown order status", () => {
    expect(() =>
      orderSchema.parse({
        clientId: "client-1",
        clientName: "Ana",
        title: "Wedding dress",
        type: "Clothes",
        status: "in-progress",
      }),
    ).toThrow()
  })
})
