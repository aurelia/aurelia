import { DI, Registration } from '@aurelia/kernel';

/** @internal */ export const tcCreateInterface = DI.createInterface;

/** @internal */ export const tcObjectFreeze = Object.freeze;

/** @internal */ export const { aliasTo: aliasRegistration, singleton: singletonRegistration } = Registration;

/** ExpressionType */
/** @internal */ export const etInterpolation = 'Interpolation';
/** @internal */ export const etIsFunction = 'IsFunction';
/** @internal */ export const etIsProperty = 'IsProperty';

/** @internal */ export const definitionTypeElement = 'custom-element';
/** @internal */ export const definitionTypeAttribute = 'custom-attribute';
