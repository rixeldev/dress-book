import { collection, doc, getDocs, getFirestore, setDoc, deleteDoc } from "@react-native-firebase/firestore"
import type { Fabric } from "@/interfaces/Fabric"
import { createId } from "@/libs/ids"
import { fabricSchema } from "@/libs/schemas"
import { readCache, writeCache, clearCache } from "@/libs/cache"

const db = getFirestore()

export async function createFabric(userId: string, input: Omit<Fabric, "id" | "userId" | "updatedAt">): Promise<Fabric> {
  const parsed = fabricSchema.parse(input)
  const fabric: Fabric = {
    id: createId("fabric"),
    userId,
    name: parsed.name,
    supplier: parsed.supplier ?? null,
    sku: parsed.sku ?? null,
    color: parsed.color ?? null,
    composition: parsed.composition ?? null,
    width: parsed.width ?? null,
    unit: parsed.unit,
    quantity: parsed.quantity ?? null,
    lowStockThreshold: parsed.lowStockThreshold ?? null,
    cost: parsed.cost ?? null,
    location: parsed.location ?? null,
    photoUrl: parsed.photoUrl ?? null,
    updatedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, "users", userId, "fabrics", fabric.id), fabric)
  await clearCache(`cache:fabrics:${userId}`)
  return fabric
}

export async function getFabrics(userId: string): Promise<Fabric[]> {
  const cacheKey = `cache:fabrics:${userId}`
  const cached = await readCache<Fabric[]>(cacheKey)
  if (cached) return cached
  const snapshot = await getDocs(collection(db, "users", userId, "fabrics"))
  const items = snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({ ...(snapshotDoc.data() as Fabric), id: snapshotDoc.id }))
    .sort((left: Fabric, right: Fabric) => left.name.localeCompare(right.name))
  await writeCache(cacheKey, items)
  return items
}

export async function updateFabric(
  userId: string,
  fabricId: string,
  input: Partial<Omit<Fabric, "id" | "userId" | "updatedAt">>,
): Promise<void> {
  await setDoc(doc(db, "users", userId, "fabrics", fabricId), { ...input, updatedAt: new Date().toISOString() }, { merge: true })
  await clearCache(`cache:fabrics:${userId}`)
}

export async function deleteFabric(userId: string, fabricId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "fabrics", fabricId))
  await clearCache(`cache:fabrics:${userId}`)
}
