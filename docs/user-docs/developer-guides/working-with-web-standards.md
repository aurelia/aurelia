# Working with Web Standards

Aurelia's philosophy is simple: enhance the web platform, don't replace it. This guide demonstrates how to leverage modern web standards and APIs within Aurelia applications, showing how the framework's features—dependency injection, reactivity, and lifecycle management—make working with native browser APIs even more powerful.

## Why Web Standards Matter

The web platform provides a rich set of APIs that solve real problems: fetching data, managing state, observing elements, handling files, and much more. These APIs are:

- **Battle-tested** by millions of developers
- **Well-documented** with extensive resources
- **Forward-compatible** as browsers evolve
- **Framework-agnostic** so your knowledge transfers

When you master web standards, you're not just learning Aurelia—you're becoming a better web developer, period. Your skills compound rather than expire when frameworks change.

## The Aurelia Advantage

While you can use any web API directly in Aurelia, the framework provides enhancements that make common patterns easier:

- **Dependency Injection**: Create reusable services that wrap web APIs
- **Reactive Binding**: Connect web API state directly to your templates
- **Lifecycle Hooks**: Initialize and cleanup web APIs at the right time
- **Observable Properties**: Automatically update UI when web API state changes

{% hint style="success" %}
**No Virtual DOM = Zero Conflicts**

Unlike React, Vue, or other virtual DOM frameworks, Aurelia works **directly with the actual browser DOM**. This means you can freely use DOM APIs, third-party DOM libraries, and direct DOM manipulation without any conflicts, bridges, wrappers, or special hooks. The DOM you see in DevTools is the DOM Aurelia uses. No reconciliation, no timing issues, no "fighting the framework"—just pure, performant web standards.
{% endhint %}

Let's explore how to use various web standards effectively within Aurelia applications.

## Fetch API

The Fetch API provides a modern interface for making HTTP requests. While Aurelia provides the `@aurelia/fetch-client` package with additional features, understanding native `fetch` is valuable.

### Basic Usage

```typescript
import { customElement } from 'aurelia';

@customElement({ name: 'user-profile', template: `
  <div if.bind="loading">Loading...</div>
  <div else>
    <h2>\${user.name}</h2>
    <p>\${user.email}</p>
  </div>
` })
export class UserProfile {
  user = null;
  loading = false;

  async attached() {
    this.loading = true;
    try {
      const response = await fetch('https://api.example.com/user/1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.user = await response.json();
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

### Creating a Fetch Service

Wrap fetch in a DI service for better reusability and testing:

```typescript
// src/services/api-client.ts
import { DI } from '@aurelia/kernel';

export interface IApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

export const IApiClient = DI.createInterface<IApiClient>('IApiClient');

export class ApiClient implements IApiClient {
  private baseUrl = 'https://api.example.com';

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
```

Register and use it:

```typescript
// main.ts
import { Aurelia } from 'aurelia';
import { ApiClient, IApiClient } from './services/api-client';

Aurelia
  .register(IApiClient.register(ApiClient))
  .app(component)
  .start();

// In a component
import { resolve } from '@aurelia/kernel';
import { IApiClient } from './services/api-client';

export class ProductList {
  private api = resolve(IApiClient);
  products = [];

  async attached() {
    this.products = await this.api.get('/products');
  }
}
```

## History API

The History API lets you manipulate browser history and URLs. While Aurelia's router handles most navigation, you can use the History API directly for custom scenarios.

### Using History API Directly

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'step-wizard',
  template: `
    <div>
      <h2>Step \${currentStep}</h2>
      <button click.trigger="goBack()" disabled.bind="currentStep === 1">Previous</button>
      <button click.trigger="goNext()" disabled.bind="currentStep === maxSteps">Next</button>
    </div>
  `
})
export class StepWizard {
  currentStep = 1;
  maxSteps = 5;

  constructor() {
    // Listen for browser back/forward buttons
    window.addEventListener('popstate', this.handlePopState);
  }

  handlePopState = (event: PopStateEvent) => {
    this.currentStep = event.state?.step ?? 1;
  };

  goNext() {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
      history.pushState({ step: this.currentStep }, '', `?step=${this.currentStep}`);
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      history.pushState({ step: this.currentStep }, '', `?step=${this.currentStep}`);
    }
  }

  detaching() {
    window.removeEventListener('popstate', this.handlePopState);
  }
}
```

## Custom Events & EventTarget

Custom events enable component communication without tight coupling. Aurelia's binding system works seamlessly with standard DOM events.

### Dispatching Custom Events

```typescript
// child-component.ts
import { customElement } from 'aurelia';

@customElement({
  name: 'rating-widget',
  template: `
    <div class="rating">
      <button repeat.for="star of stars"
              click.trigger="rate(star)">\${star}</button>
    </div>
  `
})
export class RatingWidget {
  stars = [1, 2, 3, 4, 5];

  rate(value: number) {
    // Dispatch a standard custom event
    this.element.dispatchEvent(
      new CustomEvent('rating-changed', {
        detail: { rating: value },
        bubbles: true,
        composed: true
      })
    );
  }
}
```

### Listening to Custom Events

```typescript
// parent-component.ts
export class ProductReview {
  currentRating = 0;

  handleRatingChange(event: CustomEvent) {
    this.currentRating = event.detail.rating;
    console.log('New rating:', this.currentRating);
  }
}
```

```html
<!-- parent-component.html -->
<rating-widget rating-changed.trigger="handleRatingChange($event)"></rating-widget>
<p>Current rating: ${currentRating}</p>
```

### EventTarget for Service Communication

Use EventTarget for services that need to emit events:

```typescript
// src/services/notification-service.ts
import { DI } from '@aurelia/kernel';

export interface INotificationService extends EventTarget {
  notify(message: string, type: 'info' | 'error' | 'success'): void;
}

export const INotificationService = DI.createInterface<INotificationService>('INotificationService');

export class NotificationService extends EventTarget implements INotificationService {
  notify(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.dispatchEvent(
      new CustomEvent('notification', {
        detail: { message, type, timestamp: Date.now() }
      })
    );
  }
}

// Usage in a component
import { resolve } from '@aurelia/kernel';
import { INotificationService } from './services/notification-service';

export class Dashboard {
  private notificationService = resolve(INotificationService);
  notifications = [];

  attached() {
    this.notificationService.addEventListener('notification', this.handleNotification);
  }

  handleNotification = (event: CustomEvent) => {
    this.notifications.push(event.detail);
  };

  detaching() {
    this.notificationService.removeEventListener('notification', this.handleNotification);
  }
}
```

## FormData API

The FormData API simplifies working with forms, especially for file uploads and multipart data.

### Basic FormData Usage

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'contact-form',
  template: `
    <form submit.trigger="handleSubmit($event)">
      <input type="text" name="name" value.bind="formData.name">
      <input type="email" name="email" value.bind="formData.email">
      <textarea name="message" value.bind="formData.message"></textarea>
      <input type="file" name="attachment" ref="fileInput">
      <button type="submit">Send</button>
    </form>
  `
})
export class ContactForm {
  formData = { name: '', email: '', message: '' };
  fileInput: HTMLInputElement;

  async handleSubmit(event: Event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('email', this.formData.email);
    formData.append('message', this.formData.message);

    // Add file if present
    if (this.fileInput.files?.[0]) {
      formData.append('attachment', this.fileInput.files[0]);
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData // Browser sets correct Content-Type with boundary
      });

      if (response.ok) {
        console.log('Form submitted successfully');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  }
}
```

## Web Storage (localStorage & sessionStorage)

Web Storage provides simple key-value storage in the browser. Wrap it in a service for type safety and reactivity.

### Storage Service with Type Safety

```typescript
// src/services/storage-service.ts
import { DI } from '@aurelia/kernel';

export interface IStorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export const IStorageService = DI.createInterface<IStorageService>('IStorageService');

export class LocalStorageService implements IStorageService {
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  }

  set<T>(key: string, value: T): void {
    const stringValue = typeof value === 'string'
      ? value
      : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

// Session storage variant
export class SessionStorageService implements IStorageService {
  get<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  }

  set<T>(key: string, value: T): void {
    const stringValue = typeof value === 'string'
      ? value
      : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
```

### Usage Example: Persisting User Preferences

```typescript
import { resolve } from '@aurelia/kernel';
import { observable } from 'aurelia';
import { IStorageService } from './services/storage-service';

export class UserSettings {
  private storage = resolve(IStorageService);

  @observable theme: 'light' | 'dark' = 'light';
  @observable fontSize: number = 16;

  attached() {
    // Load saved preferences
    this.theme = this.storage.get('theme') ?? 'light';
    this.fontSize = this.storage.get('fontSize') ?? 16;
  }

  themeChanged(newValue: string) {
    this.storage.set('theme', newValue);
    document.body.className = newValue;
  }

  fontSizeChanged(newValue: number) {
    this.storage.set('fontSize', newValue);
    document.documentElement.style.setProperty('--font-size', `${newValue}px`);
  }
}
```

## Intersection Observer API

The Intersection Observer API efficiently detects when elements enter or leave the viewport, perfect for lazy loading, infinite scroll, and animations.

### Lazy Loading Images

```typescript
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'lazy-image',
  template: `
    <img ref="img"
         src.bind="isVisible ? src : placeholder"
         alt.bind="alt"
         class="lazy-image">
  `
})
export class LazyImage {
  @bindable src: string;
  @bindable alt: string = '';
  @bindable placeholder: string = 'data:image/svg+xml,...'; // Inline SVG placeholder

  img: HTMLImageElement;
  isVisible = false;
  observer: IntersectionObserver;

  attached() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isVisible) {
            this.isVisible = true;
            this.observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    this.observer.observe(this.img);
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

### Infinite Scroll

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'infinite-list',
  template: `
    <div class="list">
      <div repeat.for="item of items" class="list-item">\${item.name}</div>
      <div ref="sentinel" class="sentinel"></div>
      <div if.bind="loading">Loading more...</div>
    </div>
  `
})
export class InfiniteList {
  items = [];
  loading = false;
  page = 1;
  sentinel: HTMLElement;
  observer: IntersectionObserver;

  async attached() {
    await this.loadMore();

    this.observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !this.loading) {
          await this.loadMore();
        }
      },
      { threshold: 1.0 }
    );

    this.observer.observe(this.sentinel);
  }

  async loadMore() {
    this.loading = true;
    try {
      const response = await fetch(`/api/items?page=${this.page}`);
      const newItems = await response.json();
      this.items.push(...newItems);
      this.page++;
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      this.loading = false;
    }
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

## Resize Observer API

The Resize Observer API detects when elements change size, useful for responsive components and dynamic layouts.

### Responsive Chart Component

```typescript
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'responsive-chart',
  template: `
    <div ref="container" class="chart-container">
      <canvas ref="canvas"></canvas>
      <p>Dimensions: \${width} x \${height}</p>
    </div>
  `
})
export class ResponsiveChart {
  @bindable data = [];

  container: HTMLElement;
  canvas: HTMLCanvasElement;
  observer: ResizeObserver;

  width = 0;
  height = 0;

  attached() {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const size = entry.contentBoxSize[0];
          this.width = size.inlineSize;
          this.height = size.blockSize;
        } else {
          // Fallback for browsers without contentBoxSize
          this.width = entry.contentRect.width;
          this.height = entry.contentRect.height;
        }

        this.redrawChart();
      }
    });

    this.observer.observe(this.container);
  }

  redrawChart() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // Draw chart based on new dimensions
    const ctx = this.canvas.getContext('2d');
    // ... chart rendering logic
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

## URL & URLSearchParams

The URL and URLSearchParams APIs make parsing and manipulating URLs straightforward.

### Query String Service

```typescript
// src/services/query-service.ts
import { DI } from '@aurelia/kernel';

export interface IQueryService {
  get(key: string): string | null;
  getAll(key: string): string[];
  set(key: string, value: string): void;
  delete(key: string): void;
  toString(): string;
}

export const IQueryService = DI.createInterface<IQueryService>('IQueryService');

export class QueryService implements IQueryService {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams(window.location.search);
  }

  get(key: string): string | null {
    return this.params.get(key);
  }

  getAll(key: string): string[] {
    return this.params.getAll(key);
  }

  set(key: string, value: string): void {
    this.params.set(key, value);
    this.updateUrl();
  }

  delete(key: string): void {
    this.params.delete(key);
    this.updateUrl();
  }

  toString(): string {
    return this.params.toString();
  }

  private updateUrl(): void {
    const newUrl = `${window.location.pathname}?${this.params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }
}
```

### Filtering with URL Parameters

```typescript
import { resolve } from '@aurelia/kernel';
import { observable } from 'aurelia';
import { IQueryService } from './services/query-service';

export class ProductFilter {
  private queryService = resolve(IQueryService);

  @observable category = '';
  @observable priceRange = '';
  @observable sortBy = 'name';

  attached() {
    // Initialize from URL
    this.category = this.queryService.get('category') ?? '';
    this.priceRange = this.queryService.get('price') ?? '';
    this.sortBy = this.queryService.get('sort') ?? 'name';
  }

  categoryChanged(newValue: string) {
    if (newValue) {
      this.queryService.set('category', newValue);
    } else {
      this.queryService.delete('category');
    }
  }

  priceRangeChanged(newValue: string) {
    if (newValue) {
      this.queryService.set('price', newValue);
    } else {
      this.queryService.delete('price');
    }
  }

  sortByChanged(newValue: string) {
    this.queryService.set('sort', newValue);
  }
}
```

## Geolocation API

The Geolocation API provides access to the user's location (with permission).

### Location Service

```typescript
// src/services/geolocation-service.ts
import { DI } from '@aurelia/kernel';

export interface IGeolocationService {
  getCurrentPosition(): Promise<GeolocationPosition>;
  watchPosition(callback: PositionCallback): number;
  clearWatch(id: number): void;
}

export const IGeolocationService = DI.createInterface<IGeolocationService>('IGeolocationService');

export class GeolocationService implements IGeolocationService {
  getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  watchPosition(callback: PositionCallback, options?: PositionOptions): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(callback, null, options);
  }

  clearWatch(id: number): void {
    navigator.geolocation.clearWatch(id);
  }
}
```

### Store Locator Example

```typescript
import { resolve } from '@aurelia/kernel';
import { IGeolocationService } from './services/geolocation-service';

export class StoreLocator {
  private geo = resolve(IGeolocationService);

  userLocation: { lat: number; lng: number } | null = null;
  nearbyStores = [];
  loading = false;
  error = '';

  async findNearbyStores() {
    this.loading = true;
    this.error = '';

    try {
      const position = await this.geo.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });

      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Fetch nearby stores using the location
      const response = await fetch(
        `/api/stores?lat=${this.userLocation.lat}&lng=${this.userLocation.lng}`
      );
      this.nearbyStores = await response.json();
    } catch (err) {
      if (err.code === err.PERMISSION_DENIED) {
        this.error = 'Location access denied. Please enable location services.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        this.error = 'Location information unavailable.';
      } else if (err.code === err.TIMEOUT) {
        this.error = 'Location request timed out.';
      } else {
        this.error = 'An error occurred while getting your location.';
      }
    } finally {
      this.loading = false;
    }
  }
}
```

## Page Visibility API

The Page Visibility API detects when a page is visible or hidden, useful for pausing activities when the user switches tabs.

### Auto-Pause Video Player

```typescript
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'smart-video-player',
  template: `
    <video ref="video"
           src.bind="src"
           controls.bind="true">
    </video>
  `
})
export class SmartVideoPlayer {
  @bindable src: string;
  video: HTMLVideoElement;
  wasPlaying = false;

  attached() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden
      this.wasPlaying = !this.video.paused;
      if (this.wasPlaying) {
        this.video.pause();
      }
    } else {
      // Page is visible
      if (this.wasPlaying) {
        this.video.play();
      }
    }
  };

  detaching() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
```

### Analytics Service

```typescript
// src/services/analytics-service.ts
import { DI } from '@aurelia/kernel';

export const IAnalyticsService = DI.createInterface<IAnalyticsService>('IAnalyticsService');

export class AnalyticsService {
  private sessionStart = Date.now();
  private activeTime = 0;
  private lastActiveTimestamp = Date.now();

  constructor() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      // Calculate active time before tab was hidden
      this.activeTime += Date.now() - this.lastActiveTimestamp;
      this.sendAnalytics('page_hidden', {
        activeTime: this.activeTime,
        timestamp: Date.now()
      });
    } else {
      // Tab became visible again
      this.lastActiveTimestamp = Date.now();
      this.sendAnalytics('page_visible', {
        timestamp: Date.now()
      });
    }
  };

  private sendAnalytics(event: string, data: unknown) {
    // Send to your analytics service
    console.log('Analytics:', event, data);
  }
}
```

## Clipboard API

The Clipboard API provides secure access to the clipboard for copying and pasting.

### Copy to Clipboard Component

```typescript
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'copy-button',
  template: `
    <button click.trigger="copy()" class="copy-btn">
      <span if.bind="!copied">Copy</span>
      <span if.bind="copied">Copied!</span>
    </button>
  `
})
export class CopyButton {
  @bindable text: string;
  copied = false;

  async copy() {
    try {
      await navigator.clipboard.writeText(this.text);
      this.copied = true;

      // Reset after 2 seconds
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
```

### Paste Handler

```typescript
export class TextEditor {
  content = '';

  async handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    try {
      // Modern async clipboard API
      const text = await navigator.clipboard.readText();
      this.insertText(text);
    } catch (err) {
      // Fallback to event.clipboardData
      const text = event.clipboardData?.getData('text/plain');
      if (text) {
        this.insertText(text);
      }
    }
  }

  insertText(text: string) {
    this.content += text;
  }
}
```

## File API & Drag and Drop

The File API combined with drag-and-drop provides excellent file upload experiences.

### Drag and Drop File Uploader

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'file-drop-zone',
  template: `
    <div ref="dropZone"
         class="drop-zone \${isDragging ? 'dragging' : ''}"
         dragover.trigger="handleDragOver($event)"
         dragleave.trigger="handleDragLeave($event)"
         drop.trigger="handleDrop($event)">

      <p if.bind="!files.length">Drag files here or click to select</p>

      <div if.bind="files.length" repeat.for="file of files" class="file-preview">
        <img if.bind="isImage(file)" src.bind="file.preview" alt.bind="file.name">
        <div class="file-info">
          <p>\${file.name}</p>
          <p>\${formatSize(file.size)}</p>
        </div>
      </div>

      <input type="file"
             ref="fileInput"
             change.trigger="handleFileSelect($event)"
             multiple
             style="display: none;">
    </div>
  `
})
export class FileDropZone {
  dropZone: HTMLElement;
  fileInput: HTMLInputElement;
  files = [];
  isDragging = false;

  attached() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    this.processFiles(droppedFiles);
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);
    this.processFiles(selectedFiles);
  }

  processFiles(files: File[]) {
    files.forEach(file => {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null,
        file
      };

      // Create preview for images
      if (this.isImage(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.files.push(fileData);
    });
  }

  isImage(file: File | { type: string }): boolean {
    return file.type.startsWith('image/');
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async upload() {
    const formData = new FormData();
    this.files.forEach((fileData, index) => {
      formData.append(`file${index}`, fileData.file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Upload successful');
        this.files = [];
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
}
```

## Canvas API

The Canvas API provides a powerful 2D drawing surface. Aurelia's lifecycle hooks make it easy to manage canvas rendering.

### Signature Pad

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'signature-pad',
  template: `
    <div class="signature-container">
      <canvas ref="canvas"
              mousedown.trigger="startDrawing($event)"
              mousemove.trigger="draw($event)"
              mouseup.trigger="stopDrawing()"
              touchstart.trigger="startDrawing($event)"
              touchmove.trigger="draw($event)"
              touchend.trigger="stopDrawing()">
      </canvas>
      <div class="controls">
        <button click.trigger="clear()">Clear</button>
        <button click.trigger="save()">Save</button>
      </div>
    </div>
  `
})
export class SignaturePad {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isDrawing = false;
  lastX = 0;
  lastY = 0;

  attached() {
    this.canvas.width = 600;
    this.canvas.height = 200;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const point = this.getPoint(event, rect);
    [this.lastX, this.lastY] = [point.x, point.y];
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    event.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const point = this.getPoint(event, rect);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [point.x, point.y];
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  getPoint(event: MouseEvent | TouchEvent, rect: DOMRect) {
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  save() {
    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataUrl;
    link.click();
  }
}
```

## Notification API

The Notification API displays system notifications to users (with permission).

### Notification Service

```typescript
// src/services/notification-service.ts
import { DI } from '@aurelia/kernel';

export interface INotificationService {
  requestPermission(): Promise<NotificationPermission>;
  show(title: string, options?: NotificationOptions): Promise<Notification | null>;
}

export const INotificationService = DI.createInterface<INotificationService>('INotificationService');

export class BrowserNotificationService implements INotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    return await Notification.requestPermission();
  }

  async show(title: string, options?: NotificationOptions): Promise<Notification | null> {
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    return new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });
  }
}
```

### Usage in Components

```typescript
import { resolve } from '@aurelia/kernel';
import { INotificationService } from './services/notification-service';

export class MessageList {
  private notifications = resolve(INotificationService);

  async attached() {
    // Request permission on load
    await this.notifications.requestPermission();
  }

  async newMessageReceived(message: { from: string; text: string }) {
    // Only show notification if page is hidden
    if (document.hidden) {
      await this.notifications.show(
        `New message from ${message.from}`,
        {
          body: message.text,
          tag: 'message-notification',
          requireInteraction: false
        }
      );
    }
  }
}
```

## Mutation Observer API

The Mutation Observer API watches for changes to the DOM tree, useful for advanced scenarios like tracking third-party library changes.

### Content Change Detector

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'mutation-tracker',
  template: `
    <div ref="target" class="tracked-content">
      <slot></slot>
    </div>
    <div class="mutation-log">
      <p>Mutations detected: \${mutationCount}</p>
      <div repeat.for="mutation of recentMutations">
        <small>\${mutation.type}: \${mutation.detail}</small>
      </div>
    </div>
  `
})
export class MutationTracker {
  target: HTMLElement;
  observer: MutationObserver;
  mutationCount = 0;
  recentMutations = [];

  attached() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        this.mutationCount++;

        let detail = '';
        if (mutation.type === 'childList') {
          detail = `Added ${mutation.addedNodes.length}, removed ${mutation.removedNodes.length}`;
        } else if (mutation.type === 'attributes') {
          detail = `Attribute ${mutation.attributeName} changed`;
        }

        this.recentMutations.unshift({
          type: mutation.type,
          detail,
          timestamp: new Date().toISOString()
        });

        // Keep only last 5 mutations
        if (this.recentMutations.length > 5) {
          this.recentMutations.pop();
        }
      });
    });

    this.observer.observe(this.target, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeOldValue: true,
      characterData: true
    });
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

## Web Animations API

The Web Animations API provides powerful, performant animations with JavaScript control.

### Animated List Item

```typescript
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'animated-list-item',
  template: `
    <div ref="item" class="list-item">
      <slot></slot>
    </div>
  `
})
export class AnimatedListItem {
  @bindable onRemove: () => void;
  item: HTMLElement;
  animation: Animation;

  attached() {
    // Entrance animation
    this.animation = this.item.animate([
      { opacity: 0, transform: 'translateX(-100%)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  async remove() {
    // Exit animation
    this.animation = this.item.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(100%)' }
    ], {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards'
    });

    // Wait for animation to complete
    await this.animation.finished;

    // Call parent's remove callback
    this.onRemove?.();
  }

  detaching() {
    this.animation?.cancel();
  }
}
```

## Direct DOM Access: No Virtual DOM, No Conflicts

One of Aurelia's most powerful advantages is **direct DOM manipulation**. Unlike frameworks with virtual DOM abstractions, Aurelia works directly with the actual browser DOM. This means:

- **Zero conflicts** when using DOM APIs directly
- **No bridges or wrappers** needed for third-party libraries
- **No reconciliation** overhead or timing issues
- **Direct access** to elements without special refs or hooks
- **Performance benefits** from eliminating the virtual DOM layer

You can freely mix Aurelia's reactive system with direct DOM manipulation, web APIs, and third-party DOM libraries without worrying about conflicts or "fighting the framework." The DOM you see in DevTools is the DOM Aurelia uses—what you see is what you get.

## Advanced Integration with Aurelia Features

Now let's explore how to combine web standards with Aurelia's advanced internal features for even more powerful patterns.

### Using TaskQueue for Coordinated DOM Updates

Aurelia's task queue system (from `@aurelia/runtime`) lets you schedule work to run after the current rendering cycle completes. This is perfect for coordinating web API operations with Aurelia's update cycle.

```typescript
import { queueTask, tasksSettled } from '@aurelia/runtime';
import { customElement } from 'aurelia';

@customElement({
  name: 'scroll-spy',
  template: `
    <nav>
      <a repeat.for="section of sections"
         href="#\${section.id}"
         class="\${section.active ? 'active' : ''}">\${section.title}</a>
    </nav>
    <div ref="content" class="content">
      <slot></slot>
    </div>
  `
})
export class ScrollSpy {
  content: HTMLElement;
  sections = [];
  observer: IntersectionObserver;

  attached() {
    // Discover sections after Aurelia renders slotted content
    queueTask(() => {
      this.discoverSections();
      this.setupIntersectionObserver();
    });
  }

  discoverSections() {
    const headings = this.content.querySelectorAll('h2[id], h3[id]');
    this.sections = Array.from(headings).map(h => ({
      id: h.id,
      title: h.textContent,
      active: false,
      element: h
    }));
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const section = this.sections.find(s => s.element === entry.target);
          if (section) {
            // Update in next micro-task to batch with other updates
            queueTask(() => {
              section.active = entry.isIntersecting;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    this.sections.forEach(section => {
      this.observer.observe(section.element);
    });
  }

  async scrollToSection(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });

    // Wait for all pending Aurelia updates to complete
    await tasksSettled();

    // Then perform post-scroll operations
    console.log('Scroll complete, DOM fully updated');
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

### Coordinating Multiple Async Operations

Use `tasksSettled()` to wait for all Aurelia tasks to complete before proceeding:

```typescript
import { tasksSettled } from '@aurelia/runtime';

export class DataVisualizer {
  chartContainer: HTMLElement;
  data = [];
  loading = false;

  async loadAndRender() {
    this.loading = true;
    this.data = await fetch('/api/data').then(r => r.json());
    this.loading = false;

    // Wait for Aurelia to update the DOM and remove loading spinner
    await tasksSettled();

    // Now we know the chartContainer is ready and visible
    this.renderChart();
  }

  renderChart() {
    // Direct DOM manipulation - no conflicts with Aurelia
    const canvas = this.chartContainer.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    // Draw directly to canvas - Aurelia won't interfere
    this.data.forEach((point, i) => {
      ctx.fillRect(i * 10, point.value, 8, 20);
    });
  }
}
```

### IEventAggregator for Web API Event Coordination

Use Aurelia's event aggregator to create a centralized event system that coordinates web API events across your application.

```typescript
// src/services/network-monitor.ts
import { DI } from '@aurelia/kernel';
import { IEventAggregator } from '@aurelia/kernel';
import { resolve } from '@aurelia/kernel';

export const INetworkMonitor = DI.createInterface<INetworkMonitor>('INetworkMonitor');

// Event classes for type safety
export class NetworkStatusChanged {
  constructor(public readonly online: boolean) {}
}

export class ConnectionTypeChanged {
  constructor(
    public readonly type: string,
    public readonly effectiveType: string,
    public readonly downlink: number
  ) {}
}

export class NetworkMonitor implements INetworkMonitor {
  private ea = resolve(IEventAggregator);
  private connection: any;

  start() {
    // Monitor online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Monitor connection changes (modern browsers)
    this.connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (this.connection) {
      this.connection.addEventListener('change', this.handleConnectionChange);
    }

    // Publish initial state
    this.ea.publish(new NetworkStatusChanged(navigator.onLine));
  }

  private handleOnline = () => {
    this.ea.publish(new NetworkStatusChanged(true));
  };

  private handleOffline = () => {
    this.ea.publish(new NetworkStatusChanged(false));
  };

  private handleConnectionChange = () => {
    this.ea.publish(new ConnectionTypeChanged(
      this.connection.type,
      this.connection.effectiveType,
      this.connection.downlink
    ));
  };

  stop() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.connection?.removeEventListener('change', this.handleConnectionChange);
  }
}
```

Now components can subscribe to network events in a type-safe, decoupled way:

```typescript
import { resolve } from '@aurelia/kernel';
import { IEventAggregator, IDisposable } from '@aurelia/kernel';
import { NetworkStatusChanged, ConnectionTypeChanged } from './services/network-monitor';

export class OfflineIndicator {
  private ea = resolve(IEventAggregator);
  private subscriptions: IDisposable[] = [];

  isOnline = navigator.onLine;
  connectionQuality = 'unknown';

  attached() {
    this.subscriptions.push(
      this.ea.subscribe(NetworkStatusChanged, event => {
        this.isOnline = event.online;
        if (!event.online) {
          // Show notification using Notification API
          this.showOfflineNotification();
        }
      }),

      this.ea.subscribe(ConnectionTypeChanged, event => {
        this.connectionQuality = event.effectiveType;
        // Adjust app behavior based on connection quality
        if (event.effectiveType === 'slow-2g' || event.effectiveType === '2g') {
          this.enableDataSaverMode();
        }
      })
    );
  }

  showOfflineNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('You are offline', {
        body: 'Some features may be limited',
        icon: '/offline-icon.png'
      });
    }
  }

  enableDataSaverMode() {
    // Disable auto-loading images, videos, etc.
    console.log('Data saver mode enabled');
  }

  detaching() {
    this.subscriptions.forEach(s => s.dispose());
  }
}
```

### IObservation for Reactive Web API Integration

Use Aurelia's observation system to create reactive connections to web APIs:

```typescript
import { resolve } from '@aurelia/kernel';
import { IObservation } from '@aurelia/runtime';
import { customElement } from 'aurelia';

@customElement({
  name: 'battery-monitor',
  template: `
    <div class="battery-status">
      <progress value.bind="level" max="100"></progress>
      <p>Battery: \${level}%</p>
      <p if.bind="charging">Charging...</p>
      <p else>Time remaining: \${timeRemaining}</p>
    </div>
  `
})
export class BatteryMonitor {
  private observation = resolve(IObservation);
  private battery: any;
  private effect: any;

  level = 100;
  charging = false;
  timeRemaining = 'calculating...';

  async attached() {
    if ('getBattery' in navigator) {
      this.battery = await (navigator as any).getBattery();

      // Use Aurelia's observation system to watch battery properties
      this.effect = this.observation.watch(
        this.battery,
        // Getter function - dependencies are tracked automatically
        (battery) => ({
          level: Math.floor(battery.level * 100),
          charging: battery.charging,
          timeRemaining: battery.chargingTime || battery.dischargingTime
        }),
        // Callback when values change
        (newValue) => {
          this.level = newValue.level;
          this.charging = newValue.charging;
          this.timeRemaining = this.formatTime(newValue.timeRemaining);
        }
      );

      // Also listen to native events for real-time updates
      this.battery.addEventListener('levelchange', this.handleBatteryChange);
      this.battery.addEventListener('chargingchange', this.handleBatteryChange);
    }
  }

  handleBatteryChange = () => {
    // Trigger observation system to re-evaluate
    // This ensures Aurelia's reactivity stays in sync with the battery API
    this.level = Math.floor(this.battery.level * 100);
    this.charging = this.battery.charging;
  };

  formatTime(seconds: number): string {
    if (seconds === Infinity) return 'calculating...';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  detaching() {
    this.effect?.stop();
    this.battery?.removeEventListener('levelchange', this.handleBatteryChange);
    this.battery?.removeEventListener('chargingchange', this.handleBatteryChange);
  }
}
```

### Creating Custom Attributes for Web APIs

Custom attributes are perfect for encapsulating web API functionality in a reusable, declarative way:

```typescript
// src/attributes/auto-save.ts
import { customAttribute, bindable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { INode } from '@aurelia/runtime-html';

@customAttribute('auto-save')
export class AutoSaveCustomAttribute {
  @bindable key: string;
  @bindable debounce: number = 1000;

  private element: HTMLInputElement = resolve(INode) as HTMLInputElement;
  private timeoutId: number;
  private mutationObserver: MutationObserver;

  binding() {
    // Load saved value from localStorage
    const saved = localStorage.getItem(this.key);
    if (saved && !this.element.value) {
      this.element.value = saved;
      // Dispatch input event so Aurelia knows about the change
      this.element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  attached() {
    // Listen to input events
    this.element.addEventListener('input', this.handleInput);

    // Watch for programmatic value changes using MutationObserver
    this.mutationObserver = new MutationObserver(() => {
      this.handleInput();
    });

    this.mutationObserver.observe(this.element, {
      attributes: true,
      attributeFilter: ['value']
    });
  }

  handleInput = () => {
    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      // Save to localStorage
      localStorage.setItem(this.key, this.element.value);

      // Optionally dispatch custom event for other parts of app
      this.element.dispatchEvent(
        new CustomEvent('auto-saved', {
          detail: { key: this.key, value: this.element.value },
          bubbles: true
        })
      );
    }, this.debounce);
  };

  detaching() {
    clearTimeout(this.timeoutId);
    this.element.removeEventListener('input', this.handleInput);
    this.mutationObserver?.disconnect();
  }
}
```

Usage in templates:

```html
<input type="text"
       value.bind="username"
       auto-save="key: username; debounce: 500">

<textarea value.bind="draft"
          auto-save="key: draft-message; debounce: 2000"
          auto-saved.trigger="handleSaved($event)"></textarea>
```

### Custom Attribute for IntersectionObserver

Create a reusable intersection observer attribute:

```typescript
// src/attributes/in-viewport.ts
import { customAttribute, bindable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { INode } from '@aurelia/runtime-html';

@customAttribute('in-viewport')
export class InViewportCustomAttribute {
  @bindable threshold: number = 0;
  @bindable rootMargin: string = '0px';
  @bindable onEnter?: (element: HTMLElement) => void;
  @bindable onLeave?: (element: HTMLElement) => void;

  private element: HTMLElement = resolve(INode) as HTMLElement;
  private observer: IntersectionObserver;
  private isInViewport = false;

  attached() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const wasInViewport = this.isInViewport;
          this.isInViewport = entry.isIntersecting;

          if (this.isInViewport && !wasInViewport) {
            // Entered viewport
            this.element.classList.add('in-viewport');
            this.onEnter?.(this.element);

            // Dispatch custom event that Aurelia can bind to
            this.element.dispatchEvent(
              new CustomEvent('viewport-enter', {
                detail: { entry },
                bubbles: true
              })
            );
          } else if (!this.isInViewport && wasInViewport) {
            // Left viewport
            this.element.classList.remove('in-viewport');
            this.onLeave?.(this.element);

            this.element.dispatchEvent(
              new CustomEvent('viewport-leave', {
                detail: { entry },
                bubbles: true
              })
            );
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    this.observer.observe(this.element);
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

Usage:

```html
<!-- Lazy load images -->
<img in-viewport="threshold: 0.1; on-enter.call: loadImage(element)"
     data-src="large-image.jpg"
     alt="Lazy loaded">

<!-- Trigger animations -->
<div in-viewport="threshold: 0.5"
     viewport-enter.trigger="animateIn()"
     viewport-leave.trigger="animateOut()"
     class="animated-section">
  Content here
</div>

<!-- Track analytics -->
<section in-viewport="on-enter.call: trackView('section-name')">
  Important content
</section>
```

### Platform Abstraction for Testable Web APIs

Use Aurelia's Platform abstraction to make web API code testable:

```typescript
// src/services/geolocation-service.ts
import { DI, resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

export interface IGeolocationService {
  getCurrentPosition(): Promise<GeolocationPosition>;
  watchPosition(callback: PositionCallback): number;
  clearWatch(id: number): void;
}

export const IGeolocationService = DI.createInterface<IGeolocationService>('IGeolocationService');

export class GeolocationService implements IGeolocationService {
  private platform = resolve(IPlatform);

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      // Access navigator through platform for testability
      const nav = this.platform.globalThis.navigator;

      if (!nav.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      nav.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  watchPosition(callback: PositionCallback): number {
    const nav = this.platform.globalThis.navigator;
    if (!nav.geolocation) {
      throw new Error('Geolocation not supported');
    }
    return nav.geolocation.watchPosition(callback);
  }

  clearWatch(id: number): void {
    this.platform.globalThis.navigator.geolocation?.clearWatch(id);
  }
}

// In tests, you can mock the Platform
import { Platform } from '@aurelia/platform';

const mockPlatform = new Platform({
  ...globalThis,
  navigator: {
    geolocation: {
      getCurrentPosition: (success) => {
        success({
          coords: { latitude: 40.7128, longitude: -74.0060 },
          timestamp: Date.now()
        });
      }
    }
  }
} as any);
```

### Combining TaskQueue, EventAggregator, and Web APIs

Here's a sophisticated example that combines multiple Aurelia features with web standards:

```typescript
// src/services/performance-monitor.ts
import { DI, resolve } from '@aurelia/kernel';
import { IEventAggregator } from '@aurelia/kernel';
import { queueTask } from '@aurelia/runtime';
import { IPlatform } from '@aurelia/runtime-html';

export class PerformanceMetric {
  constructor(
    public name: string,
    public duration: number,
    public timestamp: number
  ) {}
}

export const IPerformanceMonitor = DI.createInterface<IPerformanceMonitor>('IPerformanceMonitor');

export class PerformanceMonitor {
  private platform = resolve(IPlatform);
  private ea = resolve(IEventAggregator);
  private observer: PerformanceObserver;
  private metrics: PerformanceMetric[] = [];

  start() {
    const perf = this.platform.globalThis.performance;

    if (!perf || !('PerformanceObserver' in this.platform.globalThis)) {
      console.warn('Performance monitoring not available');
      return;
    }

    // Use PerformanceObserver to track various metrics
    this.observer = new PerformanceObserver((list) => {
      // Queue the processing to run after current Aurelia updates
      queueTask(() => {
        for (const entry of list.getEntries()) {
          const metric = new PerformanceMetric(
            entry.name,
            entry.duration,
            entry.startTime
          );

          this.metrics.push(metric);

          // Publish through event aggregator
          this.ea.publish(metric);

          // Log slow operations
          if (entry.duration > 100) {
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
    });

    // Observe different types of performance entries
    this.observer.observe({
      entryTypes: ['measure', 'navigation', 'resource', 'paint']
    });
  }

  measure(name: string, startMark?: string, endMark?: string) {
    const perf = this.platform.globalThis.performance;

    if (startMark) {
      perf.mark(startMark);
    }

    return () => {
      if (endMark) {
        perf.mark(endMark);
      }
      perf.measure(name, startMark, endMark);
    };
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  stop() {
    this.observer?.disconnect();
  }
}

// Usage in components
import { resolve } from '@aurelia/kernel';
import { IPerformanceMonitor } from './services/performance-monitor';

export class DataLoader {
  private perfMonitor = resolve(IPerformanceMonitor);

  async loadData() {
    const endMeasure = this.perfMonitor.measure('data-load');

    try {
      const response = await fetch('/api/data');
      const data = await response.json();

      // Process data...

      return data;
    } finally {
      endMeasure();
    }
  }
}
```

### Direct DOM Manipulation with Aurelia's Observation

Because Aurelia has no virtual DOM, you can freely manipulate the DOM and Aurelia's observation system will track your changes:

```typescript
import { customElement, observable } from 'aurelia';

@customElement({
  name: 'canvas-editor',
  template: `
    <div ref="container" class="editor">
      <canvas ref="canvas" width="800" height="600"></canvas>
      <div class="toolbar">
        <button click.trigger="addShape('rect')">Rectangle</button>
        <button click.trigger="addShape('circle')">Circle</button>
        <button click.trigger="undo()">Undo</button>
      </div>
      <div class="properties">
        <h3>Selected: \${selectedShape?.type ?? 'None'}</h3>
        <input if.bind="selectedShape"
               type="color"
               value.bind="selectedShape.color"
               input.trigger="redraw()">
      </div>
    </div>
  `
})
export class CanvasEditor {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  @observable selectedShape = null;
  shapes = [];

  attached() {
    this.ctx = this.canvas.getContext('2d');

    // Direct DOM event listeners - no conflicts with Aurelia
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);

    // Use ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Direct DOM manipulation
        this.canvas.width = entry.contentRect.width;
        this.canvas.height = entry.contentRect.height;
        this.redraw();
      }
    });

    resizeObserver.observe(this.container);

    this.redraw();
  }

  // Aurelia's @observable automatically tracks changes
  selectedShapeChanged(newShape, oldShape) {
    // When selection changes, redraw to show selection highlight
    this.redraw();
  }

  addShape(type: 'rect' | 'circle') {
    const shape = {
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: '#3498db'
    };

    this.shapes.push(shape);
    this.selectedShape = shape; // Aurelia tracks this automatically
    this.redraw();
  }

  redraw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all shapes
    this.shapes.forEach(shape => {
      this.ctx.fillStyle = shape.color;

      if (shape.type === 'rect') {
        this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2,
                     shape.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Highlight selected shape
      if (shape === this.selectedShape) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(shape.x - 5, shape.y - 5,
                           shape.width + 10, shape.height + 10);
      }
    });
  }

  handleMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked shape
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      if (x >= shape.x && x <= shape.x + shape.width &&
          y >= shape.y && y <= shape.y + shape.height) {
        this.selectedShape = shape; // Aurelia observes this change
        break;
      }
    }
  };

  handleMouseMove = (e: MouseEvent) => {
    // Implement dragging logic
  };

  handleMouseUp = (e: MouseEvent) => {
    // Implement drop logic
  };

  undo() {
    if (this.shapes.length > 0) {
      this.shapes.pop();
      this.selectedShape = null;
      this.redraw();
    }
  }

  detaching() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}
```

## Additional Web Standards

Aurelia works seamlessly with many other web standards:

### Already Documented
- **Web Components**: See the [Web Components guide](web-components.md)
- **Service Workers & PWA**: See the [PWA recipe](scenarios/pwa.md)
- **Shadow DOM**: See the [Shadow DOM guide](../components/shadow-dom.md)
- **WebSockets**: See the [WebSockets integration](scenarios/websockets.md)
- **Web Workers**: See the [Web Workers integration](scenarios/using-webworkers.md)

### Other Standards to Explore
- **IndexedDB**: For client-side database storage
- **WebRTC**: For real-time communication
- **Web Audio API**: For audio processing and synthesis
- **WebGL**: For 3D graphics
- **Pointer Events**: For unified touch/mouse/pen input
- **Performance API**: For measuring application performance
- **Request Idle Callback**: For scheduling non-critical work
- **Broadcast Channel API**: For cross-tab communication

## Best Practices

When working with web standards in Aurelia:

### Essential Practices

1. **Use Lifecycle Hooks**: Initialize observers and APIs in `attached()`, clean up in `detaching()`
2. **Leverage DI**: Wrap web APIs in services for reusability and testability
3. **Embrace Reactivity**: Use `@observable` to automatically update UI when web API state changes
4. **Handle Errors**: Many web APIs require permissions or can fail—always handle errors gracefully
5. **Clean Up**: Always disconnect observers, remove event listeners, and cancel animations in `detaching()`
6. **Feature Detection**: Check for API support before using newer features
7. **Progressive Enhancement**: Provide fallbacks for unsupported features

### Advanced Patterns

8. **Use TaskQueue for Coordination**: When you need to wait for Aurelia's DOM updates before using web APIs, use `queueTask()` or `await tasksSettled()`
9. **Create Custom Attributes**: Encapsulate reusable web API patterns (like intersection observers or auto-save) as custom attributes
10. **Use IEventAggregator for Decoupling**: Coordinate web API events across your application with type-safe event classes
11. **Use IObservation for Reactivity**: Bridge web API state to Aurelia's reactive system with `observation.watch()`
12. **Platform Abstraction for Testing**: Use `IPlatform` to access global objects, making your web API code fully testable
13. **Direct DOM Manipulation**: Take advantage of Aurelia's lack of virtual DOM—manipulate the DOM directly without conflicts
14. **Combine Features**: Mix TaskQueue, EventAggregator, observation, and web APIs for sophisticated patterns

## Conclusion

Aurelia's philosophy of enhancing web standards rather than replacing them means you can leverage the full power of the web platform. By combining web APIs with Aurelia's features like dependency injection, reactivity, and lifecycle management, you build applications that are both powerful and maintainable.

Your knowledge of web standards compounds over time, making you a better developer regardless of framework. That's the Aurelia way: build on the web, not around it.
