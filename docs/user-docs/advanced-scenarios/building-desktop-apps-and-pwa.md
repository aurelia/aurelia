---
description: Build cross-platform desktop applications and Progressive Web Apps with Aurelia using Electron, Tauri, and modern PWA technologies.
---

# Building Desktop Apps and PWAs

Deploy your Aurelia application beyond the browser—as installable Progressive Web Apps (PWAs) that work offline, or as native desktop applications for Windows, macOS, and Linux using Electron or Tauri. This guide covers strategies for building, packaging, and distributing cross-platform applications.

## Why This Is an Advanced Scenario

Desktop and PWA deployment involves:
- **Platform adaptation** - Tailoring UX for desktop vs. web
- **Native integrations** - File system, system tray, notifications
- **Distribution complexity** - App stores, auto-updates, code signing
- **Security considerations** - Sandbox escaping, IPC security
- **Performance optimization** - Bundle size, startup time, memory usage
- **Offline capabilities** - Service workers, local data, sync strategies
- **Multi-platform testing** - Windows, macOS, Linux variations

Advanced topics:
- Custom protocols and deep linking
- Native module integration
- Hardware access (USB, Bluetooth, Serial)
- System-level permissions
- Crash reporting and analytics
- Auto-update mechanisms

## Technology Overview

### Progressive Web Apps (PWAs)
Web applications with native-like capabilities:
- **Pros:** No installation friction, automatic updates, cross-platform
- **Cons:** Limited system access, browser dependency
- **Best for:** Customer-facing apps, content-heavy applications

### Electron
Chromium + Node.js for desktop apps:
- **Pros:** Full Node.js access, mature ecosystem, extensive APIs
- **Cons:** Large bundle size (~150MB), slower startup
- **Best for:** Feature-rich applications, enterprise software

### Tauri
Rust + WebView for lightweight desktop apps:
- **Pros:** Tiny bundles (~5MB), fast startup, memory efficient, secure
- **Cons:** Younger ecosystem, less plugins
- **Best for:** Performant apps, resource-conscious deployments

---

## Part 1: Progressive Web Apps (PWAs)

### Complete PWA Guide

For comprehensive PWA documentation including service workers, caching strategies, manifest configuration, and offline functionality:

**See the complete guide:** [Progressive Web Apps (PWA)](../developer-guides/scenarios/pwa.md)

### PWA Quick Start

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    aurelia(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Aurelia App',
        short_name: 'Aurelia',
        theme_color: '#814c9e',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

### PWA Best Practices

1. **Offline-First Architecture**
2. **App-like Navigation** - No URL bar, custom chrome
3. **Background Sync** - Queue actions when offline
4. **Push Notifications** - Re-engagement strategy
5. **Install Prompts** - Strategic timing for install banners

---

## Part 2: Electron Desktop Apps

### Installing Electron

```bash
npm install --save-dev electron electron-builder
npm install --save-dev concurrently wait-on cross-env
```

### Project Structure

```
my-aurelia-electron-app/
├── src/                    # Aurelia application
├── electron/
│   ├── main.js            # Electron main process
│   ├── preload.js         # Secure IPC bridge
│   └── menu.js            # Application menu
├── dist/                   # Built Aurelia app
├── build/                  # Electron build output
├── package.json
└── electron-builder.yml   # Distribution config
```

### Main Process Setup

```javascript
// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false, // Security best practice
      enableRemoteModule: false
    },
    title: 'Aurelia Desktop App',
    icon: path.join(__dirname, '../build/icon.png')
  });

  // Load Aurelia app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
});
```

### Preload Script (Secure IPC)

```javascript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
```

### Using Electron APIs in Aurelia

```typescript
// src/services/electron-service.ts
export class ElectronService {
  private api: any;

  constructor() {
    this.api = (window as any).electronAPI;
  }

  get isElectron(): boolean {
    return !!this.api;
  }

  async getVersion(): Promise<string> {
    if (!this.isElectron) return 'web';
    return await this.api.getAppVersion();
  }

  async readFile(path: string): Promise<string> {
    if (!this.isElectron) {
      throw new Error('File system access requires Electron');
    }
    return await this.api.readFile(path);
  }
}
```

```typescript
// src/my-component.ts
import { resolve } from '@aurelia/kernel';
import { ElectronService } from './services/electron-service';

export class MyComponent {
  private electron = resolve(ElectronService);
  version = '';

  async attached() {
    if (this.electron.isElectron) {
      this.version = await this.electron.getVersion();
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder"
  }
}
```

### Electron Builder Configuration

```yaml
# electron-builder.yml
appId: com.yourcompany.aureliaapp
productName: Aurelia Desktop App
directories:
  output: release
  buildResources: build

files:
  - dist/**/*
  - electron/**/*
  - package.json

mac:
  category: public.app-category.productivity
  icon: build/icon.icns
  target:
    - dmg
    - zip

win:
  icon: build/icon.ico
  target:
    - nsis
    - portable

linux:
  icon: build/icon.png
  category: Office
  target:
    - AppImage
    - deb
    - rpm
```

### Auto-Updates

```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  createWindow();

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-ready');
  });
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});
```

---

## Part 3: Tauri Desktop Apps

### Installing Tauri

```bash
npm install --save-dev @tauri-apps/cli
npm install @tauri-apps/api
```

Initialize Tauri:
```bash
npx tauri init
```

### Project Structure

```
my-aurelia-tauri-app/
├── src/                    # Aurelia application
├── src-tauri/
│   ├── src/
│   │   └── main.rs        # Rust backend
│   ├── tauri.conf.json    # Tauri configuration
│   ├── Cargo.toml         # Rust dependencies
│   └── icons/             # App icons
├── dist/                   # Built Aurelia app
└── package.json
```

### Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:3000",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "package": {
    "productName": "Aurelia Desktop App",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/*"]
      },
      "dialog": {
        "open": true,
        "save": true
      },
      "shell": {
        "open": true
      }
    },
    "windows": [
      {
        "title": "Aurelia Desktop App",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

### Rust Backend (main.rs)

```rust
// src-tauri/src/main.rs
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}!", name)
}

#[tauri::command]
async fn process_data(data: Vec<i32>) -> Result<Vec<i32>, String> {
  // Expensive computation in Rust
  Ok(data.iter().map(|x| x * 2).collect())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, process_data])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Using Tauri APIs in Aurelia

```typescript
// src/services/tauri-service.ts
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

export class TauriService {
  async greet(name: string): Promise<string> {
    return await invoke('greet', { name });
  }

  async processData(data: number[]): Promise<number[]> {
    return await invoke('process_data', { data });
  }

  async openFile(): Promise<string | null> {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Text',
        extensions: ['txt', 'md']
      }]
    });

    if (selected && typeof selected === 'string') {
      return await readTextFile(selected);
    }
    return null;
  }

  async saveFile(content: string, path: string): Promise<void> {
    await writeTextFile(path, content);
  }
}
```

```typescript
// src/my-component.ts
import { resolve } from '@aurelia/kernel';
import { TauriService } from './services/tauri-service';

export class MyComponent {
  private tauri = resolve(TauriService);
  greeting = '';

  async attached() {
    this.greeting = await this.tauri.greet('Aurelia User');
  }

  async handleOpenFile() {
    const content = await this.tauri.openFile();
    if (content) {
      console.log('File content:', content);
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Building for Distribution

```bash
# Development
npm run tauri:dev

# Production builds
npm run tauri:build
```

Outputs:
- **Windows:** `.exe` installer, `.msi`
- **macOS:** `.app`, `.dmg`
- **Linux:** `.AppImage`, `.deb`, `.rpm`

---

## Comparison: Electron vs. Tauri

| Feature | Electron | Tauri |
|---------|----------|-------|
| **Bundle Size** | ~150MB | ~5MB |
| **Memory** | 100-200MB base | 30-50MB base |
| **Startup Time** | 1-3 seconds | <1 second |
| **Backend Language** | Node.js (JavaScript) | Rust |
| **Maturity** | Very mature | Growing |
| **Plugin Ecosystem** | Extensive | Growing |
| **Security** | Good (with care) | Excellent |
| **Auto-Updates** | Built-in | Third-party |
| **Learning Curve** | JavaScript only | Requires Rust |

---

## Common Patterns

### Environment Detection

```typescript
export class PlatformService {
  get isElectron(): boolean {
    return !!(window as any).electronAPI;
  }

  get isTauri(): boolean {
    return !!(window as any).__TAURI__;
  }

  get isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  get isWeb(): boolean {
    return !this.isElectron && !this.isTauri && !this.isPWA;
  }

  get platform(): 'electron' | 'tauri' | 'pwa' | 'web' {
    if (this.isElectron) return 'electron';
    if (this.isTauri) return 'tauri';
    if (this.isPWA) return 'pwa';
    return 'web';
  }
}
```

### Cross-Platform File Operations

```typescript
export class FileService {
  private platform = resolve(PlatformService);
  private electron = resolve(ElectronService);
  private tauri = resolve(TauriService);

  async readFile(path: string): Promise<string> {
    switch (this.platform.platform) {
      case 'electron':
        return this.electron.readFile(path);
      case 'tauri':
        return this.tauri.readTextFile(path);
      case 'pwa':
      case 'web':
        throw new Error('File system access not available in browser');
    }
  }
}
```

### System Notifications

```typescript
// Works across all platforms
export class NotificationService {
  async notify(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }
}
```

---

## Distribution & Deployment

### Code Signing

**macOS:**
```bash
# Electron
electron-builder --mac --publish never
```

**Windows:**
```bash
# Requires code signing certificate
electron-builder --win --publish never
```

### App Stores

- **Microsoft Store:** Package as MSIX
- **Mac App Store:** Notarization required
- **Snap Store (Linux):** Snapcraft packaging

### Auto-Updates

**Electron + electron-updater:**
```javascript
const server = 'https://your-update-server.com';
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
autoUpdater.setFeedURL(feed);
```

**Tauri:** Use external update servers or GitHub releases

---

## Security Best Practices

1. **Disable Node Integration** (Electron)
2. **Enable Context Isolation** (Electron)
3. **Use Preload Scripts** for IPC
4. **Validate All IPC Messages**
5. **Allowlist Required APIs** (Tauri)
6. **Keep Dependencies Updated**
7. **Implement CSP Headers**
8. **Code Sign All Releases**

---

## Performance Optimization

### Bundle Size

- Tree-shake unused code
- Code split large dependencies
- Compress assets
- Use native modules sparingly

### Startup Time

- Lazy load heavy components
- Defer non-critical initialization
- Cache computed values
- Optimize Electron/Tauri window creation

### Memory Usage

- Dispose subscriptions properly
- Use virtual scrolling for lists
- Implement pagination
- Profile with DevTools

---

## Testing Desktop Apps

```typescript
// src/services/__tests__/electron-service.spec.ts
import { ElectronService } from '../electron-service';

describe('ElectronService', () => {
  let service: ElectronService;

  beforeEach(() => {
    // Mock Electron API
    (window as any).electronAPI = {
      getAppVersion: () => Promise.resolve('1.0.0'),
      readFile: (path: string) => Promise.resolve('mock content')
    };
    service = new ElectronService();
  });

  it('detects Electron environment', () => {
    expect(service.isElectron).toBe(true);
  });

  it('gets app version', async () => {
    const version = await service.getVersion();
    expect(version).toBe('1.0.0');
  });
});
```

---

## Resources

### PWA
- [PWA Complete Guide](../developer-guides/scenarios/pwa.md)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)

### Electron
- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [electron-updater](https://www.electron.build/auto-update)

### Tauri
- [Tauri Documentation](https://tauri.app/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Rust Book](https://doc.rust-lang.org/book/)

### Deployment
- [Microsoft Store Submission](https://docs.microsoft.com/en-us/windows/uwp/publish/)
- [Mac App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Snapcraft Documentation](https://snapcraft.io/docs)
