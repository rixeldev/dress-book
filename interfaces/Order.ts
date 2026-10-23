export type OrderStatus =
  | "consultation"
  | "measurements"
  | "cutting"
  | "sewing"
  | "fitting"
  | "delivered"
  | "cancelled"

export interface Order {
  id: string
  clientId: string
  clientName: string
  title: string
  type: "Clothes" | "Curtains" | "Others"
  status: OrderStatus
  dueDate: string | null
  startDate: string | null
  priority: "low" | "normal" | "high"
  price: number | null
  deposit: number | null
  currency: string
  measurementId: string | null
  fabricIds: string[]
  referenceImageUrls: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
  deliveredAt: string | null
}
