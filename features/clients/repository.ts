import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, startAfter } from "@react-native-firebase/firestore"
import { readCache, writeCache, clearCache } from "@/libs/cache"
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
    customFields: input.customFields ?? {},
    avatarUrl: input.avatarUrl ?? null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(doc(db, "users", userId, "clients", client.id), client)
  await clearCache(`cache:clients:${userId}`)
  return client
}

export async function getClient(userId: string, clientId: string): Promise<Client | null> {
  const snapshot = await getDoc(doc(db, "users", userId, "clients", clientId))
  if (!snapshot.exists()) return null
  return { ...(snapshot.data() as Client), id: snapshot.id }
}

export async function updateClient(
  userId: string,
  clientId: string,
  input: Partial<Omit<Client, "id" | "userId" | "createdAt">>,
): Promise<void> {
  await setDoc(
    doc(db, "users", userId, "clients", clientId),
    { ...input, updatedAt: new Date().toISOString() },
    { merge: true },
  )
  await clearCache(`cache:clients:${userId}`)
}

export async function archiveClient(userId: string, clientId: string): Promise<void> {
  await setDoc(
    doc(db, "users", userId, "clients", clientId),
    { archived: true, updatedAt: new Date().toISOString() },
    { merge: true },
  )
  await clearCache(`cache:clients:${userId}`)
}

export async function getClients(userId: string): Promise<Client[]> {
  const cacheKey = `cache:clients:${userId}`
  const cached = await readCache<Client[]>(cacheKey)
  if (cached) return cached
  const page = await getClientsPage(userId, 200)
  await writeCache(cacheKey, page.items)
  return page.items
}

export async function getClientsPage(
  userId: string,
  pageSize = 30,
  cursor?: Client | null,
): Promise<{ items: Client[]; nextCursor: Client | null; hasMore: boolean }> {
  const pageQuery = cursor
    ? query(collection(db, "users", userId, "clients"), orderBy("name", "asc"), limit(pageSize + 1), startAfter(cursor.name))
    : query(collection(db, "users", userId, "clients"), orderBy("name", "asc"), limit(pageSize + 1))
  const snapshot = await getDocs(pageQuery)
  const docs = snapshot.docs.slice(0, pageSize)
  const items = docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({ ...(snapshotDoc.data() as Client), id: snapshotDoc.id }) as Client)
    .filter((client: Client) => !client.archived)
  const hasMore = snapshot.docs.length > pageSize
  const lastDoc = docs[docs.length - 1]
  const nextCursor = hasMore && lastDoc ? ({ ...(lastDoc.data() as Client), id: lastDoc.id } as Client) : null
  return { items, nextCursor, hasMore }
}
