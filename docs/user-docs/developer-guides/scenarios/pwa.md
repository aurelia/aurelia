# Progressive Web App (PWA)

Build a Progressive Web App with Aurelia 2 using modern tooling and 2025 best practices. PWAs provide native-like experiences with offline functionality, push notifications, and app-like installation.

## Installation

Install the Vite PWA plugin for zero-config PWA setup:

```bash
npm install -D vite-plugin-pwa
```

## Vite Configuration

Update your `vite.config.ts` to include PWA capabilities:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [
    aurelia(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.yourapp\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Aurelia PWA',
        short_name: 'AureliaPWA',
        description: 'My Aurelia Progressive Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
});
```

## Service Worker Integration

The Vite PWA plugin automatically handles service worker registration. To add update prompts in your Aurelia app:

```typescript
// src/pwa-service.ts
import { DI, Registration } from '@aurelia/kernel';
import { registerSW } from 'virtual:pwa-register';

export const IPWAService = DI.createInterface<IPWAService>('IPWAService');

export interface IPWAService {
  updateAvailable: boolean;
  updateApp(): Promise<void>;
}

export class PWAService implements IPWAService {
  updateAvailable = false;
  private updateSW?: (reloadPage?: boolean) => Promise<void>;

  constructor() {
    this.updateSW = registerSW({
      onNeedRefresh: () => {
        this.updateAvailable = true;
      },
      onOfflineReady: () => {
        console.log('App ready to work offline');
      }
    });
  }

  async updateApp(): Promise<void> {
    if (this.updateSW) {
      await this.updateSW(true);
    }
  }
}

export const PWAServiceRegistration = Registration.singleton(IPWAService, PWAService);
```

Register the service in your app:

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { PWAServiceRegistration } from './pwa-service';
import { MyApp } from './my-app';

const au = new Aurelia();
au.register(
  StandardConfiguration,
  PWAServiceRegistration
);

au.app({ host: document.querySelector('my-app'), component: MyApp });
await au.start();
```

## Update Component

Create a component to handle PWA updates:

```typescript
// src/components/pwa-update.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IPWAService } from '../pwa-service';

@customElement('pwa-update')
export class PWAUpdate {
  private readonly pwaService: IPWAService = resolve(IPWAService);

  get updateAvailable() {
    return this.pwaService.updateAvailable;
  }

  async updateApp() {
    await this.pwaService.updateApp();
  }
}
```

```html
<!-- src/components/pwa-update.html -->
<div if.bind="updateAvailable" class="update-banner">
  <p>New version available!</p>
  <button click.trigger="updateApp()">Update</button>
</div>
```

## Icon Setup

Create properly sized icons for your PWA. The plugin expects icons in `/public/icons/`:

```
public/
└── icons/
    ├── pwa-192x192.png    # Required: 192x192 icon
    ├── pwa-512x512.png    # Required: 512x512 icon (also used as maskable)
    ├── apple-touch-icon.png
    └── favicon.ico
```

### Maskable Icons

Create maskable icons with proper safe zone padding. Use [maskable.app](https://maskable.app) to test your icons. The important content should be within a circular area with 40% radius from the center.

## Development and Testing

### Development Mode

Enable PWA features in development:

```typescript
// vite.config.ts - add to VitePWA options
devOptions: {
  enabled: true,
  type: 'module'
}
```

### Testing Your PWA

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Serve the built app:**
   ```bash
   npm run preview
   ```

3. **Test PWA features:**
   - Use Chrome DevTools → Lighthouse for PWA audit
   - Check Application tab for manifest and service worker
   - Test offline functionality by toggling network
   - Verify installation prompt appears

### Advanced Caching Strategies

For custom caching needs, create a custom service worker:

```typescript
// vite.config.ts
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  // ... other options
})
```

```typescript
// src/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache'
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      {
        cacheMaxEntries: 50,
        cacheMaxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }
    ]
  })
);
```

## Best Practices

- **HTTPS Required** - PWAs only work over HTTPS (or localhost for development)
- **Responsive Design** - Ensure your app works on all screen sizes
- **Performance** - Optimize Core Web Vitals for app-like experience
- **Offline Fallbacks** - Provide meaningful offline pages and functionality
- **Update Strategy** - Choose between `autoUpdate` and `prompt` based on user experience needs

Your Aurelia 2 app is now a fully-featured PWA with modern caching strategies, update management, and native-like installation capabilities.
