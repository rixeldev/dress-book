export interface Design {
  id: string
  userId: string
  title: string
  tags: string[]
  imageUrls: string[]
  notes: string | null
  orderId: string | null
  createdAt: string
}

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
