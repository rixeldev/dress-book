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
pnpm exec tsc --noEmit
npx prettier --write <files>   # no format script
```

- There are no tests and no test runner. Do not invent test commands.
- `android/` and `ios/` are gitignored prebuild output (`/android`, `/ios` in `.gitignore`). Make committed config changes in `app.config.js` (there is no `app.json`) or plugin config, then rerun `expo run:*`/EAS. Do not hand-edit generated native files and expect them in git.
- Expo Go cannot run this app: `@react-native-firebase/*`, `react-native-google-mobile-ads`, and Google Sign-In are native modules. Use `expo run:*` or an EAS dev build. The `web` script is configured, but verify features on Android, not web.
- Formatting: no semicolons, double quotes, 100 columns (`.prettierrc`, and `semi` is enforced by ESLint). `react-hooks/exhaustive-deps` is deliberately off.

## Required but gitignored files

- `db/firebaseConfig.ts`, `google-services.json`, and `GoogleService-Info.plist` are imported but gitignored. A fresh clone will not compile until they are restored. Never commit them.
- `db/firebaseConfig.ts` must keep exporting `auth`, `storage`, `appVersionId`, `adBannerId`, and `adInterstitialId`; these are used across auth, uploads, version checks, and ads.

## Architecture

- Entry is `expo-router/entry`; routes live in `app/`. `app/_layout.tsx` wraps the app in `ThemeProvider`, initializes i18n/ads/fonts, and gates rendering on auth state, email verification, and forced app update.
- `app/_layout.tsx` hard-codes an admin UID that bypasses the email-verification gate. Treat it as intentional and ask before removing it.
- `@/*` resolves from the repo root (see `tsconfig.json`). `tsconfig.json` also remaps `@firebase/auth` to its React Native build; keep that alias.
- Data is local-first. Records are cached in AsyncStorage under key `"regs"` as a JSON array and mirrored to the Firestore `"regs"` collection. `synced: false` means pending upload; `app/(tabs)/index.tsx` push/merges local and remote data.
- `app/details.tsx` reads only from AsyncStorage, so a record must be in the local cache before navigating to `/details?id=...`.
- After creating or deleting a record, emit `REG_ADDED_EVENT` / `REG_DELETED_EVENT` from `components/ui/TabBar.tsx` via `DeviceEventEmitter`; list and profile screens refetch on those events.
- `Regs.timestamp` is a locale-formatted string (`M/D/YYYY h:mm AM/PM`), parsed by hand in several screens. Keep that format or date sorting/statistics break.
- Firestore rejects `undefined`; strip empty measurement fields before writes (see `cleanMeasurementsForFirebase` in `app/details.tsx`).
- Measurement units are per record type: Clothes = cm, Curtains = yd, Others = in. Categories/fields are defined in `interfaces/FullBodyMeasurements.ts`; type-specific measurement screens must stay in sync with it.

## UI and i18n conventions

- Read the live theme with `useAppTheme()` → `{ Theme, isDark, themeMode, setThemeMode }`. Do not import the static `Theme` from `consts/Theme.ts` for screen UI. Build styles with `useMemo(() => createStyles(Theme), [Theme])`.
- Fonts are `Theme.fonts.onest` and `Theme.fonts.onestBold`, loaded in `app/_layout.tsx`.
- Icons come from `icons/Icons.tsx`; their default color is the light theme's text color, so pass `color={Theme.colors...}` explicitly.
- i18n resources are statically imported in `services/i18next.ts`. Add every new key to both `locales/en.json` and `locales/es.json`; keys are not typed.
- `app/settings.tsx` imports `app.config.js` for the app version. Keep it as `export default` with `expo.android.version` when changing versions.
