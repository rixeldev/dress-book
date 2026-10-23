import { migrateRegsToDomain } from "../migration"
import type { Regs } from "@/interfaces/Regs"

describe("migration", () => {
  it("groups regs by title into clients and preserves order ids", () => {
    const regs: Regs[] = [
      {
        id: "reg-1",
        userId: "user-1",
        title: "Ana",
        thumbnail: null,
        description: "Bridal gown",
        measurements: {} as any,
        timestamp: "1/2/2026 2:30 PM",
        synced: true,
        type: "Clothes",
        deliveryDeadline: "2026-05-01",
        delivered: false,
      },
      {
        id: "reg-2",
        userId: "user-1",
        title: "Ana",
        thumbnail: null,
        description: "Evening dress",
        measurements: {} as any,
        timestamp: "1/3/2026 2:30 PM",
        synced: true,
        type: "Clothes",
        deliveryDeadline: null,
        delivered: true,
      },
    ]

    const result = migrateRegsToDomain(regs, "user-1")

    expect(result.clients).toHaveLength(1)
    expect(result.clients[0].name).toBe("Ana")
    expect(result.orders).toHaveLength(2)
    expect(result.orders[0].id).toBe("reg-1")
    expect(result.orders[1].status).toBe("delivered")
    expect(result.measurements).toHaveLength(2)
    expect(result.measurements[0].clientId).toBe(result.clients[0].id)
  })

  it("creates a walk-in client for untitled records", () => {
    const regs: Regs[] = [
      {
        id: "reg-3",
        userId: "user-1",
        title: "",
        thumbnail: null,
        description: "",
        measurements: {} as any,
        timestamp: "1/2/2026 2:30 PM",
        synced: false,
        type: "Others",
        deliveryDeadline: null,
        delivered: false,
      },
    ]

    const result = migrateRegsToDomain(regs, "user-1")

    expect(result.clients[0].name).toBe("Walk-in client")
    expect(result.measurements[0].unit).toBe("in")
  })
})
