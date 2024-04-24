import { DI, Registration } from '@aurelia/kernel';

/** @internal */ export const createError = (message: string) => new Error(message);

/** @internal */ export const isString = (v: unknown): v is string => typeof v === 'string';

// this is used inside template literal, since TS errs without String(...value)
/** @internal */ export const safeString = String;

/** @internal */ export const createLookup = <T>(): Record<string, T> => Object.create(null) as Record<string, T>;

/** @internal */ export const createInterface = DI.createInterface;

/** @internal */ export const objectFreeze = Object.freeze;

/** @internal */ export const objectAssign = Object.assign;

/** @internal */ export const { aliasTo: aliasRegistration, singleton: singletonRegistration } = Registration;

/** @internal */ export const def = Reflect.defineProperty;

/** ExpressionType */
/** @internal */ export const etInterpolation = 'Interpolation';
/** @internal */ export const etIsIterator = 'IsIterator';
/** @internal */ export const etIsFunction = 'IsFunction';
/** @internal */ export const etIsProperty = 'IsProperty';

/** @internal */ export const definitionTypeElement = 'custom-element';
/** @internal */ export const definitionTypeAttribute = 'custom-attribute';
