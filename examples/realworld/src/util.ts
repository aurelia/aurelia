import { bound, PLATFORM } from 'aurelia';


export function queue(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const originalFn = descriptor.value;
      const wrappedFn = function (this: any, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        return PLATFORM.taskQueue.queueTask(originalFn.bind(this, ...args)).result;
      };
      Reflect.defineProperty(this, key, {
        value: wrappedFn,
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable,
      });
      return wrappedFn;
    },
  };
}
