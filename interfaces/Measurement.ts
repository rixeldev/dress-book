import type { FullBodyMeasurements } from "./FullBodyMeasurements"

export interface Measurement {
  id: string
  clientId: string
  version: number
  unit: "cm" | "in" | "yd" | "m"
  values: FullBodyMeasurements
  source: "designer" | "client"
  takenAt: string
  notes: string | null
  createdAt: string
}
