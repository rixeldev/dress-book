const fs = require("fs")
const path = require("path")
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing")
const {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} = require("firebase/firestore")

const projectId = "dress-book-rules-test"
let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync(path.join(process.cwd(), "db/rules/firestore.rules"), "utf8"),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

const seedReg = async (id, userId, extra = {}) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "regs", id), {
      userId,
      title: "Test record",
      ...extra,
    })
  })
}

describe("regs", () => {
  test("an owner can create, read, update, and delete their own record", async () => {
    const db = testEnv.authenticatedContext("alice").firestore()
    const regRef = doc(db, "regs", "alice-reg")

    await assertSucceeds(setDoc(regRef, { userId: "alice", title: "Dress" }))
    await assertSucceeds(getDoc(regRef))
    await assertSucceeds(setDoc(regRef, { userId: "alice", title: "Updated dress" }))
    await assertSucceeds(deleteDoc(regRef))
  })

  test("a user cannot read another user's record", async () => {
    await seedReg("alice-reg", "alice")
    const bobDb = testEnv.authenticatedContext("bob").firestore()

    await assertFails(getDoc(doc(bobDb, "regs", "alice-reg")))
  })

  test("a user cannot create a record for another user", async () => {
    const bobDb = testEnv.authenticatedContext("bob").firestore()

    await assertFails(setDoc(doc(bobDb, "regs", "spoofed"), { userId: "alice" }))
  })

  test("a user cannot change a record's owner", async () => {
    await seedReg("alice-reg", "alice")
    const aliceDb = testEnv.authenticatedContext("alice").firestore()

    await assertFails(setDoc(doc(aliceDb, "regs", "alice-reg"), { userId: "bob", title: "Stolen" }))
  })

  test("a user cannot delete another user's record", async () => {
    await seedReg("alice-reg", "alice")
    const bobDb = testEnv.authenticatedContext("bob").firestore()

    await assertFails(deleteDoc(doc(bobDb, "regs", "alice-reg")))
  })

  test("an owner-scoped query succeeds", async () => {
    await seedReg("alice-reg", "alice")
    await seedReg("bob-reg", "bob")
    const aliceDb = testEnv.authenticatedContext("alice").firestore()

    await assertSucceeds(
      getDocs(query(collection(aliceDb, "regs"), where("userId", "==", "alice"))),
    )
  })

  test("a query for another user's records fails", async () => {
    await seedReg("alice-reg", "alice")
    const bobDb = testEnv.authenticatedContext("bob").firestore()

    await assertFails(getDocs(query(collection(bobDb, "regs"), where("userId", "==", "alice"))))
  })

  test("an unconstrained collection read fails", async () => {
    await seedReg("alice-reg", "alice")
    await seedReg("bob-reg", "bob")
    const aliceDb = testEnv.authenticatedContext("alice").firestore()

    await assertFails(getDocs(collection(aliceDb, "regs")))
  })

  test("signed-out users cannot read records", async () => {
    await seedReg("alice-reg", "alice")
    const anonDb = testEnv.unauthenticatedContext().firestore()

    await assertFails(getDoc(doc(anonDb, "regs", "alice-reg")))
  })
})

describe("version", () => {
  test("is publicly readable but not writable", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "version", "current"), { android: "1.1.0" })
    })

    const anonDb = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(getDoc(doc(anonDb, "version", "current")))
    await assertFails(setDoc(doc(anonDb, "version", "current"), { android: "2.0.0" }))
  })
})

describe("users", () => {
  test("a user can read and write only their own profile document", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore()
    const bobDb = testEnv.authenticatedContext("bob").firestore()

    await assertSucceeds(setDoc(doc(aliceDb, "users", "alice"), { name: "Alice" }))
    await assertSucceeds(getDoc(doc(aliceDb, "users", "alice")))
    await assertFails(getDoc(doc(bobDb, "users", "alice")))
    await assertFails(setDoc(doc(bobDb, "users", "alice"), { name: "Mallory" }))
  })

  test("a user can access their client subcollection but not another user's clients", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore()
    const bobDb = testEnv.authenticatedContext("bob").firestore()
    const aliceClient = doc(aliceDb, "users", "alice", "clients", "client-1")

    await assertSucceeds(setDoc(aliceClient, { name: "Alice's client" }))
    await assertSucceeds(getDoc(aliceClient))
    await assertFails(getDoc(doc(bobDb, "users", "alice", "clients", "client-1")))
    await assertFails(
      setDoc(doc(bobDb, "users", "alice", "clients", "client-2"), { name: "Spoofed" }),
    )
  })
})
