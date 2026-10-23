import type { Regs } from "@/interfaces/Regs"
import type { Client } from "@/interfaces/Client"
import type { Order } from "@/interfaces/Order"
import type { Measurement } from "@/interfaces/Measurement"

export interface MigrationResult {
  clients: Client[]
  orders: Order[]
  measurements: Measurement[]
  skippedRegIds: string[]
}

export function migrateRegsToDomain(
  regs: Regs[],
  userId: string,
  now = new Date().toISOString(),
): MigrationResult {
  const clientsByName = new Map<string, Client>()
  const orders: Order[] = []
  const measurements: Measurement[] = []
  const skippedRegIds: string[] = []

  for (const reg of regs) {
    const clientName = reg.title?.trim() || "Walk-in client"
    let client = clientsByName.get(clientName)
    if (!client) {
      const newClient = {
        id: `client_${reg.id}`,
        userId,
        name: clientName,
        phone: null,
        email: null,
        notes: reg.description?.trim() || null,
        tags: [],
        customFields: {},
        avatarUrl: reg.thumbnail ?? null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      }
      client = newClient
      clientsByName.set(clientName, client)
    }

    const measurementId = `measurement_${reg.id}`
    const order: Order = {
      id: reg.id,
      clientId: client.id,
      clientName: client.name,
      title: reg.title,
      type: reg.type,
      status: reg.delivered ? "delivered" : "consultation",
      dueDate: null,
      startDate: null,
      priority: "normal",
      price: null,
      deposit: null,
      currency: "USD",
      measurementId,
      fabricIds: [],
      referenceImageUrls: reg.thumbnail ? [reg.thumbnail] : [],
      notes: reg.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deliveredAt: reg.delivered ? now : null,
    }
    orders.push(order)

    measurements.push({
      id: measurementId,
      clientId: client.id,
      version: 1,
      unit: reg.type === "Curtains" ? "yd" : reg.type === "Others" ? "in" : "cm",
      values: reg.measurements,
      source: "designer",
      takenAt: now,
      notes: null,
      createdAt: now,
    })
  }

  return {
    clients: [...clientsByName.values()],
    orders,
    measurements,
    skippedRegIds,
  }
}
