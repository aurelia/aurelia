import { ensureEmpty } from '@aurelia/platform';
import { BrowserPlatform, ensureDOMQueueEmpty } from '@aurelia/platform-browser';
import { IPlatform } from '@aurelia/runtime-html';

export function ensureTaskQueuesEmpty(platform?: IPlatform): void {
  if (!platform) {
    platform = BrowserPlatform.getOrCreate(globalThis);
  }

  // canceling pending heading to remove the sticky tasks
  ensureEmpty(platform.taskQueue);
  ensureDOMQueueEmpty(platform.domQueue);
}
