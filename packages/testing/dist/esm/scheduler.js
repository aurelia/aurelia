import { BrowserPlatform } from '@aurelia/runtime-html';
export function ensureTaskQueuesEmpty(platform) {
    if (!platform) {
        platform = BrowserPlatform.getOrCreate(globalThis);
    }
    // canceling pending heading to remove the sticky tasks
    platform.taskQueue.flush();
    platform.taskQueue['pending'].forEach((x) => x.cancel());
    platform.domWriteQueue.flush();
    platform.domWriteQueue['pending'].forEach((x) => x.cancel());
    platform.domReadQueue.flush();
    platform.domReadQueue['pending'].forEach((x) => x.cancel());
}
//# sourceMappingURL=scheduler.js.map