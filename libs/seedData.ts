import { createId } from "@/libs/ids"
import type { Client } from "@/interfaces/Client"
import type { Order } from "@/interfaces/Order"

export interface SeedData {
  clients: Client[]
  orders: Order[]
}

export function generateSeedData(userId: string, now = new Date()): SeedData {
  const iso = (daysOffset: number) => new Date(now.getTime() + daysOffset * 86_400_000).toISOString()

  const clients: Client[] = [
    {
      id: createId("client"),
      userId,
      name: "Ana García",
      phone: "+1 555 0101",
      email: "ana@example.com",
      notes: "Bridal client",
      tags: ["bridal", "vip"],
      customFields: { "Bust preference": "fitted" },
      avatarUrl: null,
      archived: false,
      createdAt: iso(-30),
      updatedAt: iso(-1),
    },
    {
      id: createId("client"),
      userId,
      name: "María López",
      phone: "+1 555 0102",
      email: null,
      notes: "Alterations",
      tags: ["alteration"],
      customFields: {},
      avatarUrl: null,
      archived: false,
      createdAt: iso(-20),
      updatedAt: iso(-2),
    },
  ]

  const orders: Order[] = [
    {
      id: createId("order"),
      clientId: clients[0].id,
      clientName: clients[0].name,
      title: "Wedding gown",
      type: "Clothes",
      status: "fitting",
      dueDate: iso(7),
      startDate: iso(-14),
      priority: "high",
      price: 1200,
      deposit: 400,
      currency: "USD",
      measurementId: null,
      fabricIds: [],
      referenceImageUrls: [],
      notes: "Final fitting scheduled.",
      createdAt: iso(-14),
      updatedAt: iso(-1),
      deliveredAt: null,
    },
    {
      id: createId("order"),
      clientId: clients[1].id,
      clientName: clients[1].name,
      title: "Curtain set",
      type: "Curtains",
      status: "cutting",
      dueDate: iso(14),
      startDate: iso(-7),
      priority: "normal",
      price: 320,
      deposit: 100,
      currency: "USD",
      measurementId: null,
      fabricIds: [],
      referenceImageUrls: [],
      notes: null,
      createdAt: iso(-7),
      updatedAt: iso(-1),
      deliveredAt: null,
    },
  ]

  return { clients, orders }
}
