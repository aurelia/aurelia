import { Constructable } from '@aurelia/kernel';
import { ChildrenObserverSource, IChildrenObserverDescription, ITemplateDefinition } from '../definitions';

export type HasChildrenObservers = Pick<ITemplateDefinition, 'childrenObservers'>;
export type ChildrenDecorator = <T extends InstanceType<Constructable & Partial<HasChildrenObservers>>>(target: T, prop: string) => void;

/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 * @param config - The overrides
 */
export function children(config?: ChildrenObserverSource): ChildrenDecorator;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 * @param prop - The property name
 */
export function children(prop: string): ClassDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 * @param target - The class
 * @param prop - The property name
 */
export function children<T extends InstanceType<Constructable & Partial<HasChildrenObservers>>>(target: T, prop: string): void;
export function children<T extends InstanceType<Constructable & Partial<HasChildrenObservers>>>(configOrTarget?: ChildrenObserverSource | T, prop?: string): void | ChildrenDecorator | ClassDecorator {
  let config: IChildrenObserverDescription;

  const decorator = function decorate($target: T, $prop: string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @children
      // Invocation with or w/o opts:
      // - @children()
      // - @children({...opts})
      config.property = $prop;
    }

    const childrenObservers =
      ($target.constructor as HasChildrenObservers).childrenObservers || (($target.constructor as HasChildrenObservers).childrenObservers = {});

    if (!config.callback) {
      config.callback = `${config.property}Changed`;
    }

    childrenObservers[config.property!] = config;
  };

  if (arguments.length > 1) {
    // Non invocation:
    // - @children
    config = {};
    decorator(configOrTarget as T, prop!);
    return;
  } else if (typeof configOrTarget === 'string') {
    // ClassDecorator
    // - @children('bar')
    // Direct call:
    // - @children('bar')(Foo)
    config = {};
    return decorator as ChildrenDecorator;
  }

  // Invocation with or w/o opts:
  // - @children()
  // - @children({...opts})
  config = (configOrTarget || {}) as IChildrenObserverDescription;
  return decorator as ChildrenDecorator;
}
