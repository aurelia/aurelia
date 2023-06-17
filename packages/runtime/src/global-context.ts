import { DI, IContainer, IPlatform, IServiceLocator, Registration, optional } from '@aurelia/kernel';
import { objectAssign, objectCreate, objectFreeze, objectFromEntries } from './utilities';

export const globalNames = objectFreeze([
  // https://262.ecma-international.org/#sec-value-properties-of-the-global-object
  'globalThis',
  'Infinity',
  'NaN',

  // https://262.ecma-international.org/#sec-function-properties-of-the-global-object
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  // https://262.ecma-international.org/#sec-constructor-properties-of-the-global-object
  'AggregateError',
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',

  // https://262.ecma-international.org/#sec-other-properties-of-the-global-object
  'Atomics',
  'JSON',
  'Math',
  'Reflect',
] as const);

export type IGlobalContext = {
  readonly [key in string]: unknown;
} & {
  readonly [key in (typeof globalNames)[number]]: typeof globalThis[key];
};

const IGlobalContext = DI.createInterface<IGlobalContext>('IGlobalContext');

export const getGlobalContext = (c: IServiceLocator) => c.get(optional(IGlobalContext));

export const registerGlobalContext = (c: IContainer) => c.register(Registration.cachedCallback(IGlobalContext, c => {
  const g = c.get(IPlatform).globalThis;
  return objectFreeze(objectAssign(objectCreate(null), objectFromEntries(globalNames.map(k => [k, g[k]]))));
}));
