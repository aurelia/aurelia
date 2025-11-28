import { IPlatform } from '@aurelia/runtime-html';
import { TaskQueue } from './abstract-task-queue';
import { DI, resolve } from '@aurelia/kernel';

export const IDomQueue = /*@__PURE__*/ DI.createInterface<IDomQueue>('IDomQueue', x => x.singleton(DomQueue));
export interface IDomQueue {
    queueTask: TaskQueue['queueTask'];
    flush: TaskQueue['flush'];
    yield: TaskQueue['yield'];
}

class DomQueue extends TaskQueue implements IDomQueue {
  public constructor() {
    const platform = resolve(IPlatform);
    let domRequested: boolean = false;
    let domHandle: number = -1;

    const requestFlush = (): void => {
      domRequested = true;
      if (domHandle === -1) {
        domHandle = platform.requestAnimationFrame(flushQueue);
      }
    };

    const cancelFlush = (): void => {
      domRequested = false;
      if (domHandle > -1) {
        platform.cancelAnimationFrame(domHandle);
        domHandle = -1;
      }
    };

    const flushQueue = (): void => {
      domHandle = -1;
      if (domRequested === true) {
        domRequested = false;
        this.flush();
      }
    };

    super(platform, requestFlush, cancelFlush);
  }
}
