import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "@react-native-firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "@react-native-firebase/storage"
import type { Design } from "@/interfaces/Design"
import { createId } from "@/libs/ids"
import { designSchema } from "@/libs/schemas"
import { readCache, writeCache, clearCache } from "@/libs/cache"

const db = getFirestore()
const storage = getStorage()

export async function createDesign(
  userId: string,
  input: { title: string; tags: string[]; notes: string | null; orderId: string | null; imageUris: string[] },
): Promise<Design> {
  const parsed = designSchema.parse({
    title: input.title,
    tags: input.tags,
    imageUrls: [],
    notes: input.notes,
    orderId: input.orderId,
  })

  const uploadedUrls: string[] = []
  for (const uri of input.imageUris) {
    const response = await fetch(uri)
    const blob = await response.blob()
    const storageRef = ref(storage, `users/${userId}/designs/${createId("design")}.jpg`)
    await uploadBytes(storageRef, blob)
    uploadedUrls.push(await getDownloadURL(storageRef))
  }

  const design: Design = {
    id: createId("design"),
    userId,
    title: parsed.title,
    tags: parsed.tags,
    imageUrls: uploadedUrls,
    notes: parsed.notes ?? null,
    orderId: parsed.orderId ?? null,
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, "users", userId, "designs", design.id), design)
  await clearCache(`cache:designs:${userId}`)
  return design
}

export async function getDesigns(userId: string): Promise<Design[]> {
  const cacheKey = `cache:designs:${userId}`
  const cached = await readCache<Design[]>(cacheKey)
  if (cached) return cached
  const snapshot = await getDocs(collection(db, "users", userId, "designs"))
  const items = snapshot.docs
    .map((snapshotDoc: { id: string; data: () => unknown }) => ({ ...(snapshotDoc.data() as Design), id: snapshotDoc.id }))
    .sort((left: Design, right: Design) => right.createdAt.localeCompare(left.createdAt))
  await writeCache(cacheKey, items)
  return items
}

export async function deleteDesign(userId: string, design: Design): Promise<void> {
  await Promise.all(
    design.imageUrls.map(async (url) => {
      try {
        await deleteObject(ref(storage, url))
      } catch {
        // Ignore storage deletion failures; Firestore deletion still proceeds.
      }
    }),
  )
  await deleteDoc(doc(db, "users", userId, "designs", design.id))
  await clearCache(`cache:designs:${userId}`)
}
