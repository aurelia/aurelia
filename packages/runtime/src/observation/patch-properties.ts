import { LifecycleFlags } from '../flags';
import { AccessorOrObserver, CollectionKind, ICollectionObserver, IObserversLookup } from '../observation';

export function mayHaveObservers(value: unknown): value is { $observers: IObserversLookup; $observer: ICollectionObserver<CollectionKind.indexed | CollectionKind.keyed> } {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if the provided value is an object and whether it has any observers declared on it.
 * If so, then patch all of its properties recursively. This is essentially a dirty check.
 */
export function patchProperties(value: unknown, flags: LifecycleFlags): void {
  if (mayHaveObservers(value)) {
    if (value.$observers !== undefined) {
      const observers = value.$observers;
      let key: string;
      let observer: AccessorOrObserver;
      for (key in observers) {
        observer = observers[key];
        if (observer.$patch !== undefined) {
          observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance);
        }
      }
    } else if (value.$observer !== undefined && value.$observer.$patch !== undefined) {
      value.$observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
}

export function patchProperty(value: unknown, key: string, flags: LifecycleFlags): void {
  if (mayHaveObservers(value) && value.$observers !== undefined) {
    const observer = value.$observers[key];
    if (observer && observer.$patch !== undefined) {
      observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
}
