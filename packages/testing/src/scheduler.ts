import { IPlatform, BrowserPlatform, ITask } from '@aurelia/runtime-html';

export function ensureTaskQueuesEmpty(platform?: IPlatform): void {
  if (!platform) {
    platform = BrowserPlatform.getOrCreate(globalThis);
  }

  // canceling pending heading to remove the sticky tasks

  platform.taskQueue.flush();
  platform.taskQueue['pending'].forEach((x: ITask) => x.cancel());

  platform.domWriteQueue.flush();
  platform.domWriteQueue['pending'].forEach((x: ITask) => x.cancel());

  platform.domReadQueue.flush();
  platform.domReadQueue['pending'].forEach((x: ITask) => x.cancel());
}
