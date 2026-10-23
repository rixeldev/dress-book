export interface Client {
  id: string
  userId: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[]
  customFields: Record<string, string>
  avatarUrl: string | null
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type NewClient = Pick<Client, "name"> &
  Partial<Pick<Client, "phone" | "email" | "notes" | "tags" | "customFields" | "avatarUrl">>
