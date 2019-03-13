import { LifecycleFlags } from '../flags';
import { AccessorOrObserver, CollectionKind, ICollectionObserver, IObserversLookup } from '../observation';

/** @internal */
export function mayHaveObservers(value: unknown): value is { $observers: IObserversLookup; $observer: ICollectionObserver<CollectionKind.indexed | CollectionKind.keyed> } {
  return value instanceof Object;
}

/**
 * Checks if the provided value is an object and whether it has any observers declared on it.
 * If so, then patch all of its properties recursively. This is essentially a dirty check.
 * @internal
 */
export function patchProperties(value: unknown, flags: LifecycleFlags): void {
  if (mayHaveObservers(value)) {
    if (value.$observers != null) {
      const observers = value.$observers;
      let key: string;
      let observer: AccessorOrObserver;
      for (key in observers) {
        observer = observers[key as keyof typeof observers] as AccessorOrObserver;
        if (observer.$patch != null) {
          observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush);
        }
      }
    } else if (value.$observer != null && value.$observer.$patch != null) {
      value.$observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush);
    }
  }
}

/** @internal */
export function patchProperty(value: unknown, key: string, flags: LifecycleFlags): void {
  if (mayHaveObservers(value) && value.$observers != null) {
    const observer = value.$observers[key as keyof typeof value['$observers']] as AccessorOrObserver;
    if (observer != null && observer.$patch != null) {
      observer.$patch(flags | LifecycleFlags.patchStrategy | LifecycleFlags.updateTargetInstance | LifecycleFlags.fromFlush);
    }
  }
}
