export interface Fabric {
  id: string
  userId: string
  name: string
  supplier: string | null
  sku: string | null
  color: string | null
  composition: string | null
  width: number | null
  unit: "m" | "yd"
  quantity: number | null
  lowStockThreshold: number | null
  cost: number | null
  location: string | null
  photoUrl: string | null
  updatedAt: string
}
