// Global Jest setup for React Native Firebase mocks.
jest.mock("@react-native-firebase/app", () => ({
  __esModule: true,
  default: () => ({ name: "[DEFAULT]" }),
  getApp: () => ({ name: "[DEFAULT]" }),
}))

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: () => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendEmailVerification: jest.fn(),
  }),
  getApp: () => ({ name: "[DEFAULT]" }),
}))

jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: () => ({}),
  getFirestore: () => ({}),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(async () => ({ docs: [], forEach: jest.fn() })),
  setDoc: jest.fn(async () => undefined),
  deleteDoc: jest.fn(async () => undefined),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
}))

jest.mock("@react-native-firebase/storage", () => ({
  __esModule: true,
  default: () => ({}),
  getStorage: () => ({}),
  ref: jest.fn(),
  uploadBytes: jest.fn(async () => undefined),
  getDownloadURL: jest.fn(async () => "https://example.com/file.jpg"),
  deleteObject: jest.fn(async () => undefined),
}))

jest.mock("react-native-google-mobile-ads", () => ({
  __esModule: true,
  default: () => ({ initialize: jest.fn(async () => undefined), setRequestConfiguration: jest.fn(async () => undefined) }),
  MaxAdContentRating: { PG: "PG" },
  BannerAd: () => null,
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: "ANCHORED_ADAPTIVE_BANNER" },
  TestIds: { ADAPTIVE_BANNER: "test-banner" },
  useForeground: jest.fn(),
}))

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { addEventListener: jest.fn(() => jest.fn()) },
}))

jest.mock("react-native-device-info", () => ({
  getVersion: jest.fn(() => "1.0.0"),
}))