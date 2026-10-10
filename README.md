# Pastiya

A medication reminder app for iPhone built with Expo (SDK 57) and Expo Router. Track doses, see a live timer since the last dose, and get a local notification when the next dose is allowed.

## Run it

```bash
yarn install
cp .env.example .env.local   # fill in your Expo account, EAS project ID and bundle ID
yarn start
```

Account-specific values (`EXPO_OWNER`, `EAS_PROJECT_ID`, `IOS_BUNDLE_IDENTIFIER`) are read from `.env.local` by `app.config.ts` and are not committed. For cloud builds on EAS, set the same variables as EAS environment variables.

Then scan the QR code with the Camera app on your iPhone to open it in **Expo Go**. If you run from WSL and the phone cannot reach the dev server, try `yarn start --tunnel`.

Only Expo Go compatible modules are used, so no native build is needed during development.

## Scripts

- `yarn test` unit tests (jest-expo)
- `yarn typecheck` TypeScript
- `yarn lint` ESLint

## Use it on your iPhone without the dev server

The app is published to Expo's servers with EAS Update. Expo Go downloads it from there, so your computer doesn't need to be running.

Publish the current code:

```bash
yarn release -m "what changed"
```

Open it on the phone:

1. Install **Expo Go** from the App Store and sign in with the same Expo account as `EXPO_OWNER`.
2. Open `https://expo.dev/accounts/<owner>/projects/pastiya/updates` on any device, pick the latest update, and scan its **Preview** QR code with the iPhone camera. Expo Go then lists the project under **Projects**, so you only need the QR code once.

Expo Go checks for a newer update each time the app launches. If you don't see your change, force-close and reopen it.

Notes:

- `runtimeVersion` follows the `version` in `app.json` (`appVersion` policy). Keep it unchanged while you publish to Expo Go.
- If the Expo SDK is upgraded, the App Store version of Expo Go must support the new SDK before the update will load.

### Standalone build (needs a paid Apple Developer account)

A standalone build runs without Expo Go or a dev server. iOS apps can't be built on Linux/WSL, so the build runs in the cloud on EAS and is installed on your phone over the internet (ad hoc / internal distribution).

Requirements:

- A paid Apple Developer Program membership ($99/yr). A free Apple ID can't sign ad hoc builds.
- A free Expo account (https://expo.dev/signup).
- `IOS_BUNDLE_IDENTIFIER` in `.env.local` set to something unique to you (for example `com.<yourname>.pastiya`).

One-time setup:

```bash
npx eas-cli@latest login
npx eas-cli@latest init            # links the project; copy the printed project ID into EAS_PROJECT_ID in .env.local
npx eas-cli@latest device:create   # open the link/QR on the iPhone and install the profile to register its UDID
```

On the iPhone, enable **Settings → Privacy & Security → Developer Mode** (iOS 16+). The phone restarts.

Build and install:

```bash
npx eas-cli@latest build -p ios --profile preview
```

EAS asks for your Apple ID login and creates the certificate and provisioning profile. When the build finishes, open the install link/QR it prints on the iPhone. Only devices registered **before** the build can install it. If you register another device, run `npx eas-cli@latest build:resign` or rebuild.

Ad hoc builds stay valid for as long as the provisioning profile (up to a year). To ship updates, bump the version and rebuild. The `production` profile plus `npx eas-cli@latest submit -p ios` is the route to TestFlight / the App Store.

## Known limitations

- Editing a dose in the history lets you set a time in the future (the picker has no `maximumDate`). A future dose counts towards the timer and cap rules.
- Only `src/lib/doseStatus.ts` and `src/lib/format.ts` have unit tests. The store, persistence and notification scheduling are untested.
- Not yet verified on a device: whether notifications fire on time, the permission prompt, haptics, the drawer, the date picker, dark mode, and persistence across restarts.
- `useNow` always ticks at 1s regardless of the interval argument.

## Dose rules

A medication is blocked until `max(lastTaken + minInterval, capOkAt)`, where the cap applies when the number of doses in the last 24h reaches the max: `capOkAt` is the time the first of the latest N doses leaves the 24h window. See `src/lib/doseStatus.ts`.

## Layout

- `src/app` routes: `(drawer)/index` (medications), `(drawer)/history`, `add-medication` (modal)
- `src/store` zustand store persisted to AsyncStorage
- `src/lib` pure logic (dose status, formatting, notifications)
- `src/components`, `src/hooks`
