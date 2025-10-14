import { createLookup } from '@aurelia/kernel';
import { rtDef } from './utilities';

import type {
  IObservable,
  IObserver
} from './interfaces';

/**
 * @internal
 */
export const getObserverLookup = <T extends IObserver>(instance: object): Record<PropertyKey, T> => {
  let lookup = (instance as IObservable).$observers as Record<PropertyKey, T>;
  if (lookup === void 0) {
    rtDef(instance, '$observers', { value: lookup = createLookup() });
  }
  return lookup;
};
