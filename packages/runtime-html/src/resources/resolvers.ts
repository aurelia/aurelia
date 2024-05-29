import { Key, IResolver, own } from '@aurelia/kernel';
import { IHydrationContext } from '../templating/controller';

/**
 * Create a resolver for a given key that will only resolve from the nearest hydration context.
 */
export const fromHydrationContext = <T extends Key>(key: T): IResolver<T | undefined> => ({
  $isResolver: true,
  resolve(_, requestor) {
    return requestor.get(IHydrationContext).controller.container.get(own(key));
  }
});
