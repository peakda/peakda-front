# Capacitor Android setup

The Android shell loads the deployed Next.js app through Capacitor's `server.url` mode.
The production frontend domain must be confirmed before syncing or building a release.

## Required environment

Set these variables in the shell that runs Capacitor:

```powershell
$env:CAPACITOR_SERVER_URL = 'https://your-production-domain.example'
$env:ANDROID_VERSION_CODE = '1'          # optional; positive integer, default 1
$env:ANDROID_VERSION_NAME = '0.1.0'      # optional; default 0.1.0
```

`CAPACITOR_SERVER_URL` must be an HTTPS origin without a path, query, or fragment.
The normal sync, run, and build commands reject a missing or invalid URL. When it is
omitted, Capacitor can only be synchronized with `pnpm cap:sync:local`; this loads the
local `capacitor-web` setup screen and is not a releasable Peakda app.

## Commands

```powershell
pnpm cap:sync
pnpm cap:open:android
pnpm cap:run:android
pnpm android:build:debug
pnpm android:build:bundle
```

`android:build:debug` produces a debug APK. `android:build:bundle` produces an
unsigned release AAB until the release signing configuration is added. Android builds
require Node.js 22 or newer and a configured Android SDK.

## Defaults already configured

- HTTPS-only remote origin and cleartext/mixed-content blocking
- WebView zoom and release web-content debugging disabled
- Debug-only Capacitor logging
- Local network error page with a retry action
- Native splash screen and light status bar defaults
- Android application backup disabled
- Keyboard resize behavior enabled
- Signing files, Firebase configuration, local SDK paths, and build outputs ignored by Git

The generated launcher and splash artwork are placeholders. Replace them when final
design assets are available.

The native package ID is currently `com.peakda.app`. Because changing the value only in
`capacitor.config.ts` does not rename an existing Android project, confirm it before Play
Console registration and change the native namespace/application ID together if needed.

After Android Studio opens, verify on an emulator and a physical device:

- The production site loads and navigation works.
- Kakao Map renders.
- Social login returns to the app.
- The authenticated cookie remains attached to subsequent API requests.

Do not commit `google-services.json`, signing keystores, or local environment files.
