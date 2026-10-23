# AGENTS.md

## Stack

Expo SDK 54 / React Native 0.81 / React 19, expo-router v6, TypeScript `strict`, pnpm (hoisted `nodeLinker`). Single app, not a monorepo. New Architecture is enabled.

## Commands

```bash
pnpm install --config.dangerouslyAllowAllBuilds=true  # plain `pnpm install` fails with ERR_PNPM_IGNORED_BUILDS on pnpm 12
pnpm start            # Metro
pnpm android          # expo run:android (local dev build, not Expo Go)
pnpm ios
pnpm lint             # expo lint; exits 0 with no output on success
pnpm lint:fix
pnpm typecheck        # tsc --noEmit
pnpm test             # jest (jest-expo preset)
pnpm test:watch
pnpm test:ci          # jest --ci --runInBand
pnpm test:rules       # Firestore emulator + rules tests (needs JDK 21+)
pnpm emulators        # start the Firestore emulator only
npx prettier --write <files>   # no format script
```

- Tests use `jest-expo` + `@testing-library/react-native`; add pure/unit tests under `libs/__tests__/` and component tests next to the component. React Native Firebase mocks are not set up yet, so keep tests free of native module imports until they are.
- Firestore rules tests live in `db/rules/__tests__/` and use the Firebase emulator. `firebase-tools` requires JDK 21+; if your default `JAVA_HOME` is older, point it at a 21 JDK for that command.
- The dev-only `firebase` package is pinned to `12.4.0` to match `@react-native-firebase/app` and keep the compat modules deduped for rules tests. Do not bump it independently.
- CI lives in `.github/workflows/ci.yml` and runs install, lint, typecheck, Jest, and the Firestore rules tests.
- `android/` and `ios/` are gitignored prebuild output (`/android`, `/ios` in `.gitignore`). Make committed config changes in `app.config.js` (there is no `app.json`) or plugin config, then rerun `expo run:*`/EAS. Do not hand-edit generated native files and expect them in git.
- Expo Go cannot run this app: `@react-native-firebase/*`, `react-native-google-mobile-ads`, and Google Sign-In are native modules. Use `expo run:*` or an EAS dev build. The `web` script is configured, but verify features on Android, not web.
- Formatting: no semicolons, double quotes, 100 columns (`.prettierrc`, and `semi` is enforced by ESLint). `react-hooks/exhaustive-deps` is deliberately off.

## Required but gitignored files

- `db/firebaseConfig.ts`, `google-services.json`, and `GoogleService-Info.plist` are imported but gitignored. A fresh clone will not compile until they are restored. Never commit them.
- `db/firebaseConfig.example.ts` is the tracked template. CI copies it to `db/firebaseConfig.ts` for lint/typecheck/test; do not put real credentials in it.
- `db/firebaseConfig.ts` must keep exporting `auth`, `storage`, `appVersionId`, `adBannerId`, and `adInterstitialId`; these are used across auth, uploads, version checks, and ads.

## Firebase security

- Rules live in `db/rules/firestore.rules` and `db/rules/storage.rules`; indexes live in `firestore.indexes.json`. `firebase.json` and `.firebaserc` point the Firebase CLI at them. They are deployed to `dress-book-24977`.
- Deploy with `pnpm exec firebase deploy --only firestore:rules,firestore:indexes,storage` after `firebase login`/`firebase use`.
- Emulator tests in `db/rules/__tests__/` run in CI and cover owner-only reads/writes, cross-user denial, unconstrained-query denial, and public version reads. Add a case for every new collection.
- Firestore access is owner-scoped: legacy `regs` docs require `userId == request.auth.uid`; future data lives under `users/{uid}`. Keep new collections owner-scoped when adding them.

## Google Sign-In fingerprints

Google Sign-In needs the SHA-1 and SHA-256 of every signing key registered in the Firebase console.

- Local debug key: `cd android && ./gradlew signingReport`.
- EAS-managed keys: `eas credentials` (Android → keystore).
- Add each fingerprint to Firebase → Project settings → Your apps → Android app, then re-download `google-services.json`.

## Architecture

- Entry is `expo-router/entry`; routes live in `app/`. `app/_layout.tsx` wraps the app in `ThemeProvider` and `AuthProvider`, initializes i18n/ads/fonts, and gates rendering on auth state, email verification, and forced app update. `(auth)` owns sign-in/sign-up/verification; `(app)` guards verified users and owns tabs, settings, and details. Keep public paths `/`, `/settings`, and `/details` stable.
- The old hard-coded admin UID bypass is gone. Every account must verify its email; do not reintroduce a bypass without a custom-claims design.
- `components/ErrorBoundary.tsx` catches render errors and offers a retry. Crashlytics is not wired up yet.
- `@/*` resolves from the repo root (see `tsconfig.json`). `tsconfig.json` also remaps `@firebase/auth` to its React Native build; keep that alias.
- Data is local-first. Records are cached in AsyncStorage under key `"regs"` as a JSON array and mirrored to the Firestore `"regs"` collection. `synced: false` means pending upload; `app/(tabs)/index.tsx` push/merges local and remote data.
- The first Phase 2 data path is `features/clients/repository.ts`: clients live at `users/{uid}/clients/{clientId}` and use ISO timestamps. The onboarding flow writes its profile defaults to `users/{uid}` and creates the first client. Every new owner-scoped subcollection needs an emulator rules case.
- `app/details.tsx` reads only from AsyncStorage, so a record must be in the local cache before navigating to `/details?id=...`.
- After creating or deleting a record, emit `REG_ADDED_EVENT` / `REG_DELETED_EVENT` from `components/ui/TabBar.tsx` via `DeviceEventEmitter`; list and profile screens refetch on those events.
- `Regs.timestamp` is a legacy locale-formatted string (`M/D/YYYY h:mm AM/PM`), parsed by `libs/dates.ts`. New domain data must use ISO strings and the `libs/units.ts`, `libs/money.ts`, and `libs/schemas.ts` helpers.
- Firestore rejects `undefined`; strip empty measurement fields before writes (see `cleanMeasurementsForFirebase` in `app/details.tsx`).
- Account deletion lives in `services/account.ts` and is triggered from `app/settings.tsx`. It deletes `regs` docs, the `users/{uid}` root, and `Profiles/{uid}`, then the Auth user. Firebase requires a recent sign-in, so the service checks `lastSignInTime` before deleting data; on failure the UI asks the user to sign out/in and retry.
- Measurement units are per record type: Clothes = cm, Curtains = yd, Others = in. Categories/fields are defined in `interfaces/FullBodyMeasurements.ts`; type-specific measurement screens must stay in sync with it.

## UI and i18n conventions

- Read the live theme with `useAppTheme()` → `{ Theme, isDark, themeMode, setThemeMode }`. Do not import the static `Theme` from `consts/Theme.ts` for screen UI. Build styles with `useMemo(() => createStyles(Theme), [Theme])`.
- Use the semantic tokens for new UI: `Theme.semantic.bg|text|accent|state|border`, `Theme.spacing`, `Theme.radius`, `Theme.fontSizes`, `Theme.lineHeights`, `Theme.motion`, and `Theme.elevation`. Legacy `Theme.colors.*` aliases remain for existing screens; migrate them as screens are touched.
- Fonts are `Theme.fonts.onest`, `Theme.fonts.onestBold`, and `Theme.fonts.display` (Fraunces SemiBold). Only the 600 weight of Fraunces is loaded; import it from `@expo-google-fonts/fraunces/600SemiBold` so the other weights stay out of the bundle.
- Icons come from `icons/Icons.tsx`; their default color is the light theme's text color, so pass `color={Theme.colors...}` explicitly.
- Build new UI from the primitives in `components/ui/` and import them from `@/components/ui`: `Button`, `IconButton`, `Card`, `ListRow`, `TextField`/`TextArea`, `Badge`, `Chip`, `SectionHeader`, `EmptyState`, `ErrorState`, `Skeleton`, and `OfflinePill`. Do not re-roll pressable, card, or text-input styling in screens. Add new primitives to `components/ui/index.ts`.
- `OfflinePill` is rendered at the root and observes `useNetworkStatus`; use `ErrorState` for retryable screen errors and `Skeleton` for list loading rather than centered spinners.
- `SettingsButton` is a `ListRow`; `CustomModal` is built from `Card` and `Button`; `RegsCard` uses `Badge`. Component tests live beside their components under `__tests__/`; `jest.config.js` maps `@/` to the repo root.
- Brand assets are generated, not hand-edited: edit the SVGs in `assets/brand/`, then run `pnpm icons`. `app.config.js`, the adaptive icon, splash, favicon, and `assets/icons/ic_brand.png` all read from the generated files. `components/ui/SplashScreen.tsx` animates the mark; it no longer uses the Lottie file.
- i18n resources are statically imported in `services/i18next.ts`. Add every new key to both `locales/en.json` and `locales/es.json`; keys are not typed.
- `app/settings.tsx` imports `app.config.js` for the app version. Keep it as `export default` with `expo.android.version` when changing versions.
