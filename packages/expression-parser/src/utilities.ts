/** @internal */
export const createError = (message: string) => new Error(message);

/** @internal */
export const isString = (v: unknown): v is string => typeof v === 'string';

// this is used inside template literal, since TS errs without String(...value)
/** @internal */ export const safeString = String;

/** @internal */ export const createLookup = <T>(): Record<string, T> => Object.create(null) as Record<string, T>;
