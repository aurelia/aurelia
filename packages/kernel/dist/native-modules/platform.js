import { DI } from './di.js';
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
export const emptyArray = Object.freeze([]);
export const emptyObject = Object.freeze({});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() { }
export const IPlatform = DI.createInterface('IPlatform');
//# sourceMappingURL=platform.js.map