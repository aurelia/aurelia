# Building Progressive Web Apps (PWAs) with Aurelia 2

Progressive Web Apps (PWAs) offer a near-native app experience with web technologies. They are reliable, fast, and engaging. Here's how you can build a PWA using Aurelia 2 with TypeScript and Webpack.

## Setting Up the Service Worker

The service worker is a script that your browser runs in the background, separate from a web page, opening the door to features that don't need a web page or user interaction. To create a PWA, we first need to set up a service worker.

Create a new file `service-worker.ts` in your `src` directory:

```typescript
// src/service-worker.ts

const cacheName = 'aurelia-pwa-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/scripts/bundle.js', // Adjust with your actual app bundle files
  // Add other files you want to cache
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## Registering the Service Worker

Now, we'll register the service worker in our Aurelia app.

Create a service worker registration file `service-worker-registration.ts`:

```typescript
// src/service-worker-registration.ts

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').then((registration) => {
        console.log('SW registered: ', registration);
      }).catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}
```

Import and call this function in your `main.ts`:

```typescript
// src/main.ts

import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';
import { registerServiceWorker } from './service-worker-registration';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();

registerServiceWorker();
```

## Webpack Configuration

Update the `webpack.config.js` to include the service worker file in your build process. Make sure you install the `workbox-webpack-plugin` development dependency.

```javascript
// webpack.config.js

const { AureliaPlugin } = require('aurelia-webpack-plugin');
const path = require('path');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  // ... other configurations ...
  plugins: [
    new AureliaPlugin(),
    // ... other plugins ...
    new GenerateSW({
      swDest: 'service-worker.js',
      clientsClaim: true,
      skipWaiting: true,
    })
  ],
  // ... other configurations ...
};
```

## Manifest File

Create a `manifest.json` in your `src` directory:

```json
// src/manifest.json

{
  "short_name": "Aurelia PWA",
  "name": "Aurelia Progressive Web App",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

Ensure that the manifest is copied to your `dist` directory during the build, and link it in your `index.html`:

```html
<!-- index.html -->

<link rel="manifest" href="/manifest.json">
```

## Testing the PWA

To test your PWA, you need to:

- Run `npm run build` to create the production build.
- Serve your `dist` directory using a static server that supports service workers (e.g., `http-server`).
- Open your app in a browser, and use the Chrome DevTools to audit your app with Lighthouse.

Your Aurelia 2 app should now be a fully functioning PWA! Remember to update the list of files to cache in your service worker as your app grows and changes.
