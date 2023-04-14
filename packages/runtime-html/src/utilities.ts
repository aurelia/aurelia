import type { ISignaler, ISubscriber } from '@aurelia/runtime';
import type { ISVGAnalyzer } from './observation/svg-analyzer';

const O = Object;

/** @internal */ export const safeString = String;

/** @internal */ export const baseObjectPrototype = O.prototype;

/** @internal */ export const createLookup = <T = unknown>() => O.create(null) as Record<string, T>;

/** @internal */ export const createError = (message: string) => new Error(message);

/** @internal */ export const hasOwnProperty = baseObjectPrototype.hasOwnProperty;

/** @internal */ export const objectFreeze = O.freeze;

/** @internal */ export const objectAssign = O.assign;

/** @internal */ export const getOwnPropertyNames = O.getOwnPropertyNames;

/** @internal */ export const objectKeys = O.keys;

const IsDataAttribute: Record<string, boolean> = createLookup();

/** @internal */ export const isDataAttribute = (obj: Node, key: PropertyKey, svgAnalyzer: ISVGAnalyzer): boolean => {
  if (IsDataAttribute[key as string] === true) {
    return true;
  }
  if (!isString(key)) {
    return false;
  }
  const prefix = key.slice(0, 5);
  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
  return IsDataAttribute[key] =
    prefix === 'aria-' ||
    prefix === 'data-' ||
    svgAnalyzer.isStandardSvgAttribute(obj, key);
};

/** @internal */ export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;
/** @internal */ export const isArray = <T>(v: unknown): v is T[] => v instanceof Array;

// eslint-disable-next-line @typescript-eslint/ban-types
/** @internal */ export const isFunction = <K extends Function>(v: unknown): v is K => typeof v === 'function';

/** @internal */ export const isString = (v: unknown): v is string => typeof v === 'string';
/** @internal */ export const isNumber = (v: unknown): v is number => typeof v === 'number';
/** @internal */ export const defineProp = O.defineProperty;
/** @internal */ export const rethrow = (err: unknown) => { throw err; };
/** @internal */ export const areEqual = O.is;

/** @internal */
export const def = Reflect.defineProperty;

/** @internal */
export const defineHiddenProp = <T>(obj: object, key: PropertyKey, value: T): T => {
  def(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
  return value;
};

/** @internal */
export const addSignalListener = (signaler: ISignaler, signal: string, listener: ISubscriber) => signaler.addSignalListener(signal, listener);
/** @internal */
export const removeSignalListener = (signaler: ISignaler, signal: string, listener: ISubscriber) => signaler.removeSignalListener(signal, listener);
