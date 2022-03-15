import { Metadata } from '@aurelia/metadata';

/** @internal */ export const getOwnMetadata = Metadata.getOwn;
/** @internal */ export const hasOwnMetadata = Metadata.hasOwn;
/** @internal */ export const defineMetadata = Metadata.define;

/** @internal */ export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;

// eslint-disable-next-line @typescript-eslint/ban-types
/** @internal */ export const isFunction = <T extends Function>(v: unknown): v is T => typeof v === 'function';

/** @internal */ export const isString = (v: unknown): v is string => typeof v === 'string';
/** @internal */ export const createObject = <T extends object>() => Object.create(null) as T;
