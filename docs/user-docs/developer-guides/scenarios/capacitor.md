# Using Aurelia 2 with Capacitor

Build fully native iOS and Android experiences by wrapping your Aurelia 2 application with [Capacitor](https://capacitorjs.com/). This guide walks through creating a project, wiring the build pipeline, and consuming native device APIs without leaving your existing frontend stack.

## Prerequisites

- Node.js 22+ and npm 10+
- Xcode (for iOS) and/or Android Studio (for Android)
- Capacitor CLI: `npm install -D @capacitor/cli`
- A working Aurelia 2 project scaffolded with `npx makes aurelia`

> ℹ️ Cordova/PhoneGap are deprecated and no longer maintained for modern OS releases. If you are migrating from an old Cordova stack, start with a clean Capacitor project and move your web assets over so you benefit from the modern tooling, live reload, and maintained plugin catalog.

## 1. Create or reuse your Aurelia project

```bash
npx makes aurelia my-mobile-app
cd my-mobile-app
npm install
```

Keep the `dist/` output directory (default for Vite/Webpack) because Capacitor will copy that folder into its native shells.

## 2. Install and initialize Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "My Mobile App" com.example.mobile
```

During `cap init`, Capacitor creates a `capacitor.config.ts` file. Make sure it points to your Aurelia build output:

```ts
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.mobile',
  appName: 'My Mobile App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

## 3. Add native platforms

```bash
npx cap add android
npx cap add ios   # Only on macOS
```

This scaffolds `android/` and `ios/` folders that you open with Android Studio or Xcode. Commit these folders so teammates can build locally.

## 4. Build and sync web assets

Run the regular Aurelia build, then copy the output into Capacitor's native projects with `cap sync`:

```bash
npm run build
npx cap sync
```

During development you can use `npx cap run android --livereload --external` to serve the Vite dev server straight to the device, keeping hot-module replacement intact.

## 5. Access native plugins from Aurelia

Capacitor exposes most device capabilities through JavaScript modules. You can call them directly inside any Aurelia component or service. Example: capture images and locations.

```ts
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export class MobileFeatures {
  async takePicture() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      quality: 85,
      allowEditing: false
    });
    return photo.webPath;
  }

  async getPosition() {
    const { coords } = await Geolocation.getCurrentPosition();
    return { lat: coords.latitude, lng: coords.longitude };
  }
}
```

When you need dependency injection for your own services (for example, to broadcast network changes), use Aurelia's `resolve()` helper:

```ts
import { resolve } from '@aurelia/kernel';
import { INetworkStatus } from '../resources/network-status';
import { Network } from '@capacitor/network';

export class ConnectivityService {
  private status = resolve(INetworkStatus);

  async attached() {
    const result = await Network.getStatus();
    this.status.update(result.connected);
    Network.addListener('networkStatusChange', ({ connected }) => {
      this.status.update(connected);
    });
  }
}
```

## 6. Handling push notifications (high-level)

1. Install the push plugin: `npm install @capacitor/push-notifications`
2. Configure Firebase Cloud Messaging (Android) and Apple Push Notification service (iOS)
3. Request permissions in Aurelia, then register the device token:

```ts
import { PushNotifications } from '@capacitor/push-notifications';

export class PushService {
  async enable() {
    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    PushNotifications.addListener('registration', ({ value }) => {
      // POST value to your API so it can send pushes
    });

    PushNotifications.addListener('pushNotificationReceived', notif => {
      // surface the message inside Aurelia UI
    });
  }
}
```

4. Use your backend to send notifications through FCM/APNs with the stored token list.

## 7. Debugging tips

- Use Chrome DevTools (`chrome://inspect`) for Android and Safari DevTools for iOS simulators.
- Run `npx cap sync` whenever package.json changes so native projects pick up new plugins.
- Prefer Capacitor community plugins first; if none exist, bridge native code by creating a custom plugin (`npx cap generate plugin`).
- Keep `android/app/src/main/assets/public` and `ios/App/App/public` out of source control; they are rebuilt whenever you run `npx cap copy`.

## 8. Deployment checklist

- Automate `npm run build && npx cap sync` in CI before generating release builds.
- Use separate app identifiers per environment (e.g., `com.example.mobile.dev`).
- Store signing keys securely (`gradle.properties`, Xcode automatic signing, or fastlane match).
- Configure Splash Screens and Icons via `npx @capacitor/assets generate`.

## Additional resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugin Directory](https://capacitorjs.com/docs/plugins)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)
