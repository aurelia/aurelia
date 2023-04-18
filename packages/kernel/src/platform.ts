import { Platform } from '@aurelia/platform';
import { createInterface } from './di';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emptyArray: any[] = Object.freeze<any>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emptyObject: any = Object.freeze({}) as any;
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export interface IPlatform extends Platform {}
export const IPlatform = /*@__PURE__*/createInterface<IPlatform>('IPlatform');
