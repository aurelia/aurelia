import { bound, PLATFORM } from 'aurelia';


export function queue(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      const originalFn = descriptor.value;
      const wrappedFn = function (this: any, ...args: unknown[]) {
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
