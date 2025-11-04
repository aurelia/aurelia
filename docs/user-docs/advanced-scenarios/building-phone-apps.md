---
description: Learn how to build native mobile applications for iOS and Android using Aurelia with Capacitor.
---

# Building Phone Apps

Transform your Aurelia web application into a native mobile app for iOS and Android. This advanced scenario covers wrapping your Aurelia app with native containers, accessing device APIs, and optimizing for mobile performance.

## Why This Is an Advanced Scenario

Mobile app development with Aurelia involves:
- **Native container integration** - Capacitor wrapping
- **Device API access** - Camera, geolocation, contacts, file system
- **Platform-specific considerations** - iOS vs Android differences
- **Build pipeline configuration** - Multiple target platforms
- **Performance optimization** - Mobile hardware constraints
- **App store deployment** - Signing, provisioning, submission process
- **Offline-first architecture** - Network unreliability on mobile
- **Touch interactions** - Gestures, haptics, mobile UX patterns

Advanced topics include:
- Native plugin development
- Background processing and notifications
- Secure storage and biometric authentication
- App updates and hot-reload
- Performance profiling on devices
- Platform-specific UI adaptations

## Complete Guide

For comprehensive documentation on building mobile apps with Aurelia, including:
- Installing and configuring Capacitor
- Setting up iOS and Android development environments
- Creating and building native shells
- Accessing device APIs (camera, GPS, contacts, etc.)
- Handling platform-specific code
- Testing on emulators and real devices
- Debugging mobile applications
- App store preparation and deployment workflows

**See the complete guide:** [Using Aurelia 2 with Capacitor](../developer-guides/scenarios/capacitor.md)

## Capacitor architecture at a glance

Capacitor hosts your Aurelia bundle inside native Android and iOS shells while exposing JavaScript access to device APIs:
- **Web runtime** – ships a WebView that loads `dist/` output from your Aurelia build.
- **Plugin layer** – official and community plugins expose camera, geolocation, biometrics, network, push, and more via JavaScript modules.
- **Bridge** – if a plugin does not exist, create one with `npx cap generate plugin` and call native Swift/Kotlin directly.
- **Tooling** – `npx cap sync` keeps native projects updated; `npx cap run --livereload` connects devices to the Aurelia dev server for rapid iteration.

## Quick Example: Capacitor Setup

```bash
# Create Aurelia app
npx makes aurelia my-mobile-app
cd my-mobile-app

# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Initialize Capacitor
npx cap init

# Build your Aurelia app
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Open in native IDE
npx cap open android
npx cap open ios
```

## Device API Access

Capacitor provides plugins for native features:

```typescript
import { resolve } from '@aurelia/kernel';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export class MobileFeatures {
  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });
    return image.webPath;
  }

  async getCurrentPosition() {
    const position = await Geolocation.getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  }
}
```

## What You'll Learn

The complete Capacitor guide covers:

1. **Environment Setup** - Installing Capacitor, Android Studio, Xcode, and CLI tooling
2. **Project Structure** - Wiring Aurelia's build output into Capacitor's `android/` and `ios/` shells
3. **Build Configuration** - Vite/Webpack tweaks plus `capacitor.config.ts`
4. **Plugin APIs** - Camera, GPS, file system, biometrics, push notifications
5. **Testing** - Emulators, simulators, physical devices, and live reload
6. **Debugging** - Chrome DevTools, Safari Web Inspector, and native logs
7. **Performance** - Bundle size control, offline caching, memory considerations
8. **Deployment** - Automating `npx cap sync`, signing, and publishing to app stores

## Common Mobile Patterns

### Responsive Mobile UI
```html
<div class="mobile-container">
  <header class="mobile-header">
    <button click.trigger="goBack()">←</button>
    <h1>${title}</h1>
  </header>

  <main class="mobile-content">
    <router-view></router-view>
  </main>

  <nav class="mobile-nav">
    <a href="#/home">Home</a>
    <a href="#/profile">Profile</a>
    <a href="#/settings">Settings</a>
  </nav>
</div>
```

### Offline Support
```typescript
import { resolve } from '@aurelia/kernel';
import { Network } from '@capacitor/network';

export class OfflineService {
  isOnline = true;

  async attached() {
    // Check initial status
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // Listen for changes
    Network.addListener('networkStatusChange', status => {
      this.isOnline = status.connected;
      if (status.connected) {
        this.syncOfflineData();
      }
    });
  }

  async syncOfflineData() {
    // Sync data that was queued while offline
  }
}
```

### Native Navigation
```typescript
import { App } from '@capacitor/app';

export class BackButtonHandler {
  attached() {
    App.addListener('backButton', () => {
      // Handle Android back button
      if (this.canGoBack()) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  }
}
```

## Platform-Specific Considerations

### iOS
- **Requirements:** macOS, Xcode, Apple Developer account
- **Bundle ID:** Must be unique (com.company.appname)
- **Provisioning:** Code signing and certificates required
- **Review:** App Store review process can take days

### Android
- **Requirements:** Android SDK, Java/Kotlin
- **Package Name:** Must be unique (com.company.appname)
- **Signing:** Keystore generation and management
- **Distribution:** Google Play or direct APK distribution

## Performance Tips

1. **Minimize bundle size** - Code splitting, tree shaking
2. **Optimize images** - Use WebP, lazy loading
3. **Virtual scrolling** - For long lists (use ui-virtualization)
4. **Cache aggressively** - Service workers, local storage
5. **Reduce animations** - Mobile CPUs/GPUs are limited
6. **Test on real devices** - Emulators don't show real performance

## Migration from Aurelia 1

Aurelia 2 mobile apps are significantly faster due to:
- Smaller bundle sizes
- Better tree-shaking
- Improved runtime performance
- Modern JavaScript features

Most Capacitor plugins work identically between Aurelia versions.

---

**Ready to build mobile apps?** Head to the [complete Capacitor guide](../developer-guides/scenarios/capacitor.md).

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Capacitor Plugins Directory](https://capacitorjs.com/docs/plugins)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Capacitor Live Reload Guide](https://capacitorjs.com/docs/guides/live-reload)
