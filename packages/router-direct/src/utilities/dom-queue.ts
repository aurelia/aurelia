import { IPlatform } from '@aurelia/runtime-html';
import { TaskQueue } from './abstract-task-queue';
import { DI, resolve } from '@aurelia/kernel';

export const IDomQueue = /*@__PURE__*/ DI.createInterface<IDomQueue>('IDomQueue', x => x.singleton(DomQueue));
export interface IDomQueue {
    queue: TaskQueue;
}

class DomQueue {
    private readonly platform = resolve(IPlatform);
    public readonly queue: TaskQueue = (() => {
      let domRequested: boolean = false;
      let domHandle: number = -1;

      const requestFlush = (): void => {
        domRequested = true;
        if (domHandle === -1) {
          domHandle = this.platform.requestAnimationFrame(flushQueue);
        }
      };

      const cancelFlush = (): void => {
        domRequested = false;
        if (domHandle > -1) {
          this.platform.cancelAnimationFrame(domHandle);
          domHandle = -1;
        }
      };

      const flushQueue = (): void => {
        domHandle = -1;
        if (domRequested === true) {
          domRequested = false;
          domQueue.flush();
        }
      };

      const domQueue = new TaskQueue(this.platform, requestFlush, cancelFlush);
      return domQueue;
    })();
}
