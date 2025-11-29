import { FullBodyMeasurements } from "./FullBodyMeasurements"

export type RegType = "Clothes" | "Curtains" | "Others"

export interface Regs {
  id: string
  userId: string
  title: string
  thumbnail: string | null
  description: string
  measurements: FullBodyMeasurements
  timestamp: string
  synced?: boolean
  type: RegType
  deliveryDeadline?: string | null
  delivered?: boolean
}
