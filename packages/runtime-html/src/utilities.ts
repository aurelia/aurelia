import { AccessorType, type ISubscriber } from '@aurelia/runtime';
import { type ISVGAnalyzer } from './observation/svg-analyzer';
import { type ISignaler } from './signaler';

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

const IsDataAttribute: Record<string, boolean> = /*@__PURE__*/createLookup();

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
/** @internal */ export const isSet = <T>(v: unknown): v is Set<T> => v instanceof Set;
/** @internal */ export const isMap = <T, K>(v: unknown): v is Map<T, K> => v instanceof Map;

// eslint-disable-next-line @typescript-eslint/ban-types
/** @internal */ export const isFunction = <K extends Function>(v: unknown): v is K => typeof v === 'function';

/** @internal */ export const isObject = (v: unknown): v is object => v instanceof O;
/** @internal */ export const isString = (v: unknown): v is string => typeof v === 'string';
/** @internal */ export const isSymbol = (v: unknown): v is string => typeof v === 'symbol';
/** @internal */ export const isNumber = (v: unknown): v is number => typeof v === 'number';
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

/** ExpressionType */
/** @internal */ export const etInterpolation = 'Interpolation' as const;
/** @internal */ export const etIsIterator = 'IsIterator' as const;
/** @internal */ export const etIsFunction = 'IsFunction' as const;
/** @internal */ export const etIsProperty = 'IsProperty' as const;

/** TaskStatus */
/** @internal */ export const tsPending = 'pending' as const;
/** @internal */ export const tsRunning = 'running' as const;

/** AccessorType */
/** @internal */ export const atObserver: AccessorType = AccessorType.Observer;
/** @internal */ export const atNode: AccessorType = AccessorType.Node;
/** @internal */ export const atLayout: AccessorType = AccessorType.Layout;
