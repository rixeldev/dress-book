import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from "@react-native-firebase/firestore"
import type { Client, NewClient } from "@/interfaces/Client"

const db = getFirestore()

const createClientId = () => `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export async function createClient(userId: string, input: NewClient): Promise<Client> {
  const now = new Date().toISOString()
  const client: Client = {
    id: createClientId(),
    userId,
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    notes: input.notes?.trim() || null,
    tags: input.tags ?? [],
    avatarUrl: input.avatarUrl ?? null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(doc(db, "users", userId, "clients", client.id), client)
  return client
}

export async function getClient(userId: string, clientId: string): Promise<Client | null> {
  const snapshot = await getDoc(doc(db, "users", userId, "clients", clientId))
  if (!snapshot.exists()) return null
  return { ...(snapshot.data() as Client), id: snapshot.id }
}

export async function archiveClient(userId: string, clientId: string): Promise<void> {
  await setDoc(
    doc(db, "users", userId, "clients", clientId),
    { archived: true, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}

export async function getClients(userId: string): Promise<Client[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "clients"))

  const clients = snapshot.docs.map(
    (snapshotDoc: { id: string; data: () => unknown }) =>
      ({ ...(snapshotDoc.data() as Client), id: snapshotDoc.id }) as Client,
  )

  return clients
    .filter((client: Client) => !client.archived)
    .sort((left: Client, right: Client) => left.name.localeCompare(right.name))
}
