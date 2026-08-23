import { type Constructable, type IContainer, type IRegistry, type MaybePromise, registrableMetadataKey } from '@aurelia/kernel';
import { objectFreeze } from '../utilities';
import { createInterface, instanceRegistration, singletonRegistration } from '../utilities-di';
import type { CustomElementDefinition } from './custom-element';

export const ITemplateSourceResolver = /*@__PURE__*/createInterface<ITemplateSourceResolver>('ITemplateSourceResolver');
export interface ITemplateSourceResolver {
  resolveTemplateSource(
    definition: CustomElementDefinition,
    template: string | Node | null,
    container: IContainer,
  ): MaybePromise<string | Node | null | undefined>;
}

export const TemplateSourceResolvers = objectFreeze({
  none: Object.freeze([]) as readonly ITemplateSourceResolver[],

  define<K extends ITemplateSourceResolver, T extends Constructable<K>>(Type: T): IRegistry {
    return {
      register(container: IContainer): void {
        singletonRegistration(ITemplateSourceResolver, Type).register(container);
      }
    };
  },

  findAll(container: IContainer): readonly ITemplateSourceResolver[] {
    const root = container.root;
    return container === root
      ? root.getAll(ITemplateSourceResolver, false)
      : container.has(ITemplateSourceResolver, false)
        ? container.getAll(ITemplateSourceResolver, false).concat(root.getAll(ITemplateSourceResolver, false))
        : root.getAll(ITemplateSourceResolver, false);
  },
});

export function useTemplateSourceResolvers(target: IContainer, source: IContainer): void {
  if (source === target || source === source.root || !source.has(ITemplateSourceResolver, false)) {
    return;
  }
  for (const resolver of source.getAll(ITemplateSourceResolver, false)) {
    target.register(instanceRegistration(ITemplateSourceResolver, resolver));
  }
}

export function templateSourceResolver<T extends Constructable<ITemplateSourceResolver>>(target: T, context: ClassDecoratorContext): T {
  const metadata = context?.metadata ?? (target[Symbol.metadata] ??= Object.create(null));
  metadata[registrableMetadataKey] = TemplateSourceResolvers.define(target);
  return target;
}
