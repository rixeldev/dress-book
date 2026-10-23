import { auth, storage } from "@/db/firebaseConfig"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
} from "@react-native-firebase/firestore"
import { deleteObject, ref } from "@react-native-firebase/storage"

const RECENT_LOGIN_WINDOW_MS = 4 * 60 * 1000
const db = getFirestore()

export const RECENT_LOGIN_REQUIRED = "account/requires-recent-login"

export class RecentLoginRequiredError extends Error {
  code = RECENT_LOGIN_REQUIRED

  constructor() {
    super("A recent sign-in is required to delete this account")
    this.name = "RecentLoginRequiredError"
  }
}

const deleteRemoteData = async (uid: string) => {
  // Current schema: records are top-level `regs` docs tagged with userId.
  const regsQuery = query(collection(db, "regs"), where("userId", "==", uid))
  const regsSnapshot = await getDocs(regsQuery)
  for (const reg of regsSnapshot.docs) {
    await deleteDoc(reg.ref)
  }

  // Future v2 schema keeps user data under users/{uid}. Deleting the root doc is
  // idempotent; subcollections must be deleted explicitly when that schema ships.
  await deleteDoc(doc(db, "users", uid)).catch(() => undefined)

  try {
    await deleteObject(ref(storage, `Profiles/${uid}`))
  } catch (error: any) {
    if (error?.code !== "storage/object-not-found") {
      console.log("Failed to delete profile image:", error)
    }
  }
}

/**
 * Deletes the signed-in user's Firestore/Storage data and then the Auth account.
 *
 * Firebase requires a recent sign-in for account deletion. We check that before
 * removing any data so a failed deletion does not orphan the user's records.
 */
export const deleteAccount = async () => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("auth/no-current-user")
  }

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).getTime()
    : 0

  if (!lastSignIn || Date.now() - lastSignIn > RECENT_LOGIN_WINDOW_MS) {
    throw new RecentLoginRequiredError()
  }

  await deleteRemoteData(user.uid)
  await user.delete()
}
