import { AccessorType, type ISubscriber } from '@aurelia/runtime';
import { type ISVGAnalyzer } from './observation/svg-analyzer';
import { type ISignaler } from './signaler';
import { createLookup, isPromise, isString } from '@aurelia/kernel';

const O = Object;

/** @internal */ export const safeString = String;

/** @internal */ export const baseObjectPrototype = O.prototype;

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

/** @internal */ export const rethrow = (err: unknown) => { throw err; };

/**
 * Run mandatory cleanup after an operation failed, preserving the original
 * error unless cleanup fails too. The cleanup result remains synchronous when
 * possible and both failures retain their causal order in an AggregateError.
 *
 * @internal
 */
export const cleanupAfterFailure = (
  error: unknown,
  cleanup: () => void | Promise<void>,
  message: string,
): never | Promise<never> => {
  let result: void | Promise<void>;
  try {
    result = cleanup();
  } catch (cleanupError) {
    throw new AggregateError([error, cleanupError], message);
  }
  if (isPromise(result)) {
    return result.then(
      () => { throw error; },
      cleanupError => { throw new AggregateError([error, cleanupError], message); },
    );
  }
  throw error;
};

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
