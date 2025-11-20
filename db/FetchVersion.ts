import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore"
import { appVersionId } from "@/db/firebaseConfig"

interface VersionData {
  version: string
}

const db = getFirestore()

export const FetchVersion = async (): Promise<VersionData | null> => {
  try {
    const docRef = doc(db, "version", appVersionId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as VersionData
    } else {
      return null
    }
  } catch (error: any) {
    console.log("Error fetching app version: ", error)
    return null
  }
}
