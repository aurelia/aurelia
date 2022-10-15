import { DI, Registration } from '@aurelia/kernel';

/** @internal */
export const createInterface = DI.createInterface;

/** @internal */
export const singletonRegistration = Registration.singleton;

/** @internal */
export const instanceRegistration = Registration.instance;

/** @internal */
export const callbackRegistration = Registration.callback;
