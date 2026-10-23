import { collection, doc, getDocs, getFirestore, setDoc, deleteDoc } from "@react-native-firebase/firestore"
import type { Fabric } from "@/interfaces/Fabric"
import { createId } from "@/libs/ids"
import { fabricSchema } from "@/libs/schemas"

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
  return fabric
}

export async function getFabrics(userId: string): Promise<Fabric[]> {
  const snapshot = await getDocs(collection(db, "users", userId, "fabrics"))
  return snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({ ...(snapshotDoc.data() as Fabric), id: snapshotDoc.id }))
    .sort((left: Fabric, right: Fabric) => left.name.localeCompare(right.name))
}

export async function deleteFabric(userId: string, fabricId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "fabrics", fabricId))
}
