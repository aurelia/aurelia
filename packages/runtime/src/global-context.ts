import { objectFreeze } from './utilities';

export const globalNames = objectFreeze([
  'Infinity',
  'NaN',

  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  'Array',
  'BigInt',
  'Boolean',
  'Date',
  'Map',
  'Number',
  'Object',
  'RegExp',
  'Set',
  'String',

  'JSON',
  'Math',
  'Intl',
] as const);
