import {
  Class,
  IContainer,
  Registration,
  emptyArray,
} from '@aurelia/kernel';
import { getOwnPropertyDescriptors, Reflect_apply } from './util';

export class Call {
  public readonly instance: any;
  public readonly args: any[];
  public readonly method: PropertyKey;
  public readonly index: number;

  public constructor(
    instance: any,
    args: any[],
    method: PropertyKey,
    index: number,
  ) {
    this.instance = instance;
    this.args = args;
    this.method = method;
    this.index = index;
  }
}

export class CallCollection {
  public readonly calls: Call[];

  public constructor() {
    this.calls = [];
  }

  public static register(container: IContainer): void {
    container.register(Registration.singleton(this, this));
  }

  public addCall(instance: any, method: PropertyKey, ...args: any[]): CallCollection {
    this.calls.push(new Call(instance, args, method, this.calls.length));
    return this;
  }
}

export function recordCalls<TProto extends object>(
  ctor: Class<TProto>,
  calls: CallCollection,
): void {
  const proto = ctor.prototype;
  const properties = getOwnPropertyDescriptors(proto);

  for (const key in properties) {
    const property = properties[key];

    if (
      key !== 'constructor'
      && typeof property.value === 'function'
      && property.configurable === true
      && property.writable === true
    ) {

      const original = property.value;

      const wrapper = function (this: any, ...args: any[]): any {
        calls.addCall(this, key, ...args);
        return Reflect_apply(original, this, args);
      };

      Reflect.defineProperty(
        wrapper,
        'original',
        {
          value: original,
          writable: true,
          configurable: true,
          enumerable: false,
        },
      );
      Reflect.defineProperty(
        proto,
        key,
        {
          value: wrapper,
          writable: property.writable,
          configurable: property.configurable,
          enumerable: property.enumerable,
        },
      );
    } else {
      const { get, set } = property;
      let newGet, newSet;
      if (get) {
        newGet = function (this: any) {
          calls.addCall(this, `get ${key}`, emptyArray);
          return Reflect_apply(get, this, emptyArray);
        };
        Reflect.defineProperty(newGet, 'original', { value: get });
      }
      if (set) {
        newSet = function (this: any, valueToSet: any) {
          calls.addCall(this, `get ${key}`, emptyArray);
          Reflect_apply(set, this, [valueToSet]);
        };
        Reflect.defineProperty(newSet, 'original', { value: set });
      }
      if (get || set) {
        Reflect.defineProperty(
          proto,
          key,
          { ...property, get: newGet, set: newSet });
      }
    }
  }
}

export function stopRecordingCalls<TProto extends object>(
  ctor: Class<TProto>,
): void {
  const proto = ctor.prototype;
  const properties = getOwnPropertyDescriptors(proto);

  for (const key in properties) {
    const property = properties[key];

    if (
      key !== 'constructor'
      && typeof property.value === 'function'
      && property.configurable === true
      && property.writable === true
    ) {
      Reflect.defineProperty(
        proto,
        key,
        {
          value: property.value.original,
          writable: property.writable,
          configurable: property.configurable,
          enumerable: property.enumerable,
        },
      );
    } else {
      const { get, set } = property;
      if (get || set) {
        Reflect.defineProperty(
          proto,
          key,
          {
            ...property,
            get: get && Reflect.get(get, 'original'),
            set: set && Reflect.get(set, 'original')
          });
      }
    }
  }
}

export function trace(calls: CallCollection) {
  return function (ctor: Class<any>, _context: ClassDecoratorContext) {
    recordCalls(ctor, calls);
  };
}
