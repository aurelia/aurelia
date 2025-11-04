# Notification/Toast System

A complete notification system with auto-dismiss, multiple types, animations, and queue management.

## Features Demonstrated

- **Dependency Injection** - Singleton service pattern
- **Event Aggregator** - Global notification triggering
- **Animations** - CSS transitions for enter/leave
- **Timers** - Auto-dismiss with setTimeout
- **Array manipulation** - Add/remove notifications
- **Dynamic CSS classes** - Type-based styling
- **Conditional rendering** - Show/hide based on array length

## Code

### Service (notification-service.ts)

```typescript
// src/services/notification-service.ts
import { DI } from '@aurelia/kernel';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number; // milliseconds, 0 = no auto-dismiss
  dismissible: boolean;
  timestamp: Date;
  expiresAt?: number;
  remaining?: number;
}

export const INotificationService = DI.createInterface<INotificationService>(
  'INotificationService',
  x => x.singleton(NotificationService)
);

export interface INotificationService {
  readonly notifications: Notification[];
  show(options: Partial<Notification>): string;
  success(title: string, message: string, duration?: number): string;
  error(title: string, message: string, duration?: number): string;
  warning(title: string, message: string, duration?: number): string;
  info(title: string, message: string, duration?: number): string;
  dismiss(id: string): void;
  clear(): void;
}

class NotificationService implements INotificationService {
  notifications: Notification[] = [];
  private nextId = 1;
  private timers = new Map<string, number>();
  private progressTimers = new Map<string, number>();

  show(options: Partial<Notification>): string {
    const notification: Notification = {
      id: `notification-${this.nextId++}`,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : 5000,
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      timestamp: new Date(),
      remaining: options.duration ?? 5000,
      expiresAt: options.duration ? Date.now() + options.duration : undefined
    };

    // Add to beginning of array (newest first)
    this.notifications.unshift(notification);

    // Auto-dismiss if duration > 0
    if (notification.duration > 0) {
      const timer = window.setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);

      this.timers.set(notification.id, timer);

      const progress = window.setInterval(() => {
        if (!notification.expiresAt) return;
        const remaining = Math.max(notification.expiresAt - Date.now(), 0);
        notification.remaining = remaining;
        if (remaining <= 0) {
          window.clearInterval(progress);
          this.progressTimers.delete(notification.id);
        }
      }, 100);
      this.progressTimers.set(notification.id, progress);
    }

    return notification.id;
  }

  success(title: string, message: string, duration = 5000): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 0): string {
    // Errors don't auto-dismiss by default
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration = 7000): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration = 5000): string {
    return this.show({ type: 'info', title, message, duration });
  }

  dismiss(id: string): void {
    // Clear timer if exists
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    const progress = this.progressTimers.get(id);
    if (progress) {
      clearInterval(progress);
      this.progressTimers.delete(id);
    }

    // Remove notification
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.progressTimers.forEach(interval => clearInterval(interval));
    this.progressTimers.clear();

    // Clear all notifications
    this.notifications = [];
  }
}
```

### Component (notification-container.ts)

```typescript
// src/components/notification-container.ts
import { resolve } from '@aurelia/kernel';
import { INotificationService } from '../services/notification-service';

export class NotificationContainer {
  private notificationService = resolve(INotificationService);

  get notifications() {
    return this.notificationService.notifications;
  }

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ⓘ';
      default: return '';
    }
  }

  getProgressWidth(notification: any): number {
    if (notification.duration === 0) return 0;
    const remaining = notification.remaining ?? notification.duration;
    return Math.max((remaining / notification.duration) * 100, 0);
  }
}
```

### Template (notification-container.html)

```html
<!-- src/components/notification-container.html -->
<div class="notification-container">
  <div
    repeat.for="notification of notifications"
    class="notification notification-${notification.type}">

      <div class="notification-icon">
        ${getIcon(notification.type)}
      </div>

      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>

        <!-- Progress bar for auto-dismiss -->
        <div
          if.bind="notification.duration > 0"
          class="notification-progress">
          <div
            class="notification-progress-bar"
            style.width.bind="getProgressWidth(notification) + '%'">
          </div>
        </div>
      </div>

      <button
        if.bind="notification.dismissible"
        type="button"
        click.trigger="dismiss(notification.id)"
        class="notification-close"
        aria-label="Dismiss notification">
        ×
      </button>
    </div>
  </div>
```

### Styles (notification-container.css)

```css
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: calc(100% - 2rem);
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.notification-success {
  border-left: 4px solid #4caf50;
}

.notification-success .notification-icon {
  background-color: #4caf50;
  color: white;
}

.notification-error {
  border-left: 4px solid #f44336;
}

.notification-error .notification-icon {
  background-color: #f44336;
  color: white;
}

.notification-warning {
  border-left: 4px solid #ff9800;
}

.notification-warning .notification-icon {
  background-color: #ff9800;
  color: white;
}

.notification-info {
  border-left: 4px solid #2196f3;
}

.notification-info .notification-icon {
  background-color: #2196f3;
  color: white;
}

.notification-content {
  flex-grow: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.notification-message {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #333;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-progress-bar {
  height: 100%;
  background-color: currentColor;
  transition: width 0.1s linear;
}

.notification-success .notification-progress-bar {
  background-color: #4caf50;
}

.notification-error .notification-progress-bar {
  background-color: #f44336;
}

.notification-warning .notification-progress-bar {
  background-color: #ff9800;
}

.notification-info .notification-progress-bar {
  background-color: #2196f3;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 100%;
    width: 100%;
    border-radius: 0;
  }

  .notification {
    border-radius: 0;
    border-left: none;
    border-top: 4px solid;
  }
}
```

### Registration (main.ts)

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { NotificationContainer } from './components/notification-container';
import { INotificationService } from './services/notification-service';

Aurelia
  .register(NotificationContainer, INotificationService)
  .app(component)
  .start();
```

### Usage in Root Component (my-app.html)

```html
<!-- src/my-app.html -->
<notification-container></notification-container>

<!-- Your app content -->
<au-viewport></au-viewport>
```

### Usage in Any Component

```typescript
// src/pages/dashboard.ts
import { resolve } from '@aurelia/kernel';
import { INotificationService } from '../services/notification-service';

export class Dashboard {
  private notifications = resolve(INotificationService);

  async saveData() {
    try {
      await this.apiClient.save(this.data);

      this.notifications.success(
        'Saved!',
        'Your changes have been saved successfully.'
      );
    } catch (error) {
      this.notifications.error(
        'Error',
        'Failed to save changes. Please try again.',
        0 // Don't auto-dismiss errors
      );
    }
  }

  showWarning() {
    this.notifications.warning(
      'Low Storage',
      'You are running low on storage space.',
      7000
    );
  }

  showInfo() {
    this.notifications.info(
      'Tip',
      'You can use keyboard shortcuts to navigate faster.'
    );
  }
}
```

## How It Works

### Singleton Service Pattern

The `INotificationService` is registered as a singleton, so the same instance is shared across the entire application. Any component can inject it and trigger notifications.

### Auto-Dismiss Timer

When a notification is added with `duration > 0`, a timer is created that automatically dismisses it after the specified time. The timer is stored in a Map so it can be cleared if the user manually dismisses the notification.

### Reactive Array

The `notifications` array is a reactive property. When notifications are added or removed, Aurelia's binding system automatically updates the DOM.

### Progress Bar Animation

The progress bar uses a computed property (`getProgressWidth`) that calculates the percentage remaining based on elapsed time. This creates a smooth countdown animation.

## Variations

### Stacking vs Replacing

Current implementation stacks notifications. For "replacing" behavior (only show one at a time):

```typescript
show(options: Partial<Notification>): string {
  // Clear existing notifications of the same type
  this.notifications = this.notifications.filter(n => n.type !== options.type);

  // ... rest of implementation
}
```

### Position Options

Make position configurable:

```html
<div class="notification-container notification-container-${position}">
```

```css
.notification-container-top-right { top: 1rem; right: 1rem; }
.notification-container-top-left { top: 1rem; left: 1rem; }
.notification-container-bottom-right { bottom: 1rem; right: 1rem; }
.notification-container-bottom-left { bottom: 1rem; left: 1rem; }
```

### Action Buttons

Add action buttons to notifications:

```typescript
export interface NotificationAction {
  label: string;
  callback: () => void | Promise<void>;
}

export interface Notification {
  // ... existing properties
  actions?: NotificationAction[];
}
```

```html
<div if.bind="notification.actions" class="notification-actions">
  <button
    repeat.for="action of notification.actions"
    type="button"
    click.trigger="action.callback()"
    class="btn btn-small">
    ${action.label}
  </button>
</div>
```

### Pause on Hover

Pause the auto-dismiss timer when hovering:

```typescript
pauseTimer(id: string) {
  const timer = this.timers.get(id);
  if (timer) {
    clearTimeout(timer);
  }
}

resumeTimer(notification: Notification) {
  if (notification.duration > 0) {
    const elapsed = Date.now() - notification.timestamp.getTime();
    const remaining = Math.max(0, notification.duration - elapsed);

    const timer = setTimeout(() => {
      this.dismiss(notification.id);
    }, remaining);

    this.timers.set(notification.id, timer);
  }
}
```

```html
<div
  mouseover.trigger="notifications.pauseTimer(notification.id)"
  mouseout.trigger="notifications.resumeTimer(notification)">
  <!-- notification content -->
</div>
```

## Related

- [Dependency Injection](../../getting-to-know-aurelia/dependency-injection.md) - Singleton services
- [Event Aggregator](../../aurelia-packages/event-aggregator.md) - Alternative global communication
- [Conditional Rendering](../conditional-rendering.md) - `if.bind` documentation
- [List Rendering](../repeats-and-list-rendering.md) - `repeat.for` documentation
