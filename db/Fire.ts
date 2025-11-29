import { Regs } from "@/interfaces/Regs"
import {
  getFirestore,
  doc,
  getDocs,
  setDoc,
  collection,
  deleteDoc,
  query,
  where,
} from "@react-native-firebase/firestore"

const db = getFirestore()

class Fire {
  insertReg = async (collectionName: string, id: string, data: Regs) => {
    const docRef = doc(db, collectionName, id)
    await setDoc(docRef, data)
  }

  getRegs = async (
    collectionName: string,
    userId: string | null,
  ): Promise<Regs | Regs[] | null> => {
    if (!userId) return null

    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    const regs: Regs[] = []
    querySnapshot.forEach((doc: any) => {
      regs.push({ ...doc.data(), id: doc.id } as Regs)
    })

    return regs
  }

  deleteReg = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
  }
}

export default new Fire()
