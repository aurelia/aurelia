import { BrowserPlatform } from '@aurelia/platform-browser';
import { IPlatform } from '@aurelia/runtime-html';

export function ensureTaskQueuesEmpty(platform?: IPlatform): void {
  if (!platform) {
    platform = BrowserPlatform.getOrCreate(globalThis);
  }
}
