export interface Appointment {
  id: string
  userId: string
  clientId: string | null
  orderId: string | null
  title: string
  startsAt: string
  endsAt: string | null
  location: string | null
  notes: string | null
  createdAt: string
}
