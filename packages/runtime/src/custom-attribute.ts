import { Constructable, Decoratable, Decorated, IContainer, Omit, PLATFORM, Registration, Writable } from '@aurelia/kernel';
import { BindingMode } from './binding/binding-mode';
import { customAttributeKey, customAttributeName, IAttributeDefinition } from './definitions';
import { Hooks } from './lifecycle';
import { $attachAttribute, $cacheAttribute, $detachAttribute } from './lifecycle-attach';
import { $bindAttribute, $unbindAttribute } from './lifecycle-bind';
import { $hydrateAttribute, ICustomAttribute, ICustomAttributeType } from './lifecycle-render';
import { IResourceKind, ResourceDescription } from './resource';

type CustomAttributeDecorator = <T extends Constructable>(target: Decoratable<ICustomAttribute, T>) => Decorated<ICustomAttribute, T> & ICustomAttributeType;
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(nameOrDef: string | IAttributeDefinition): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(nameOrDef, target);
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(nameOrDef: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(
    typeof nameOrDef === 'string'
    ? { isTemplateController: true , name: nameOrDef }
    : { isTemplateController: true, ...nameOrDef },
    target);
}

export const CustomAttributeResource: IResourceKind<IAttributeDefinition, ICustomAttributeType> = {
  name: customAttributeName,

  keyFrom: customAttributeKey,

  isType<T extends Constructable & Partial<ICustomAttributeType>>(Type: T): Type is T & ICustomAttributeType {
    return Type.kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType {
    const Type = ctor as T & Writable<ICustomAttributeType>;
    const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, <T & ICustomAttributeType>Type);
    const proto: Writable<ICustomAttribute> = Type.prototype;

    Type.kind = CustomAttributeResource;
    Type.description = description;
    Type.register = registerAttribute;

    proto.$hydrate = $hydrateAttribute;
    proto.$bind = $bindAttribute;
    proto.$attach = $attachAttribute;
    proto.$detach = $detachAttribute;
    proto.$unbind = $unbindAttribute;
    proto.$cache = $cacheAttribute;

    proto.$prevBind = null;
    proto.$nextBind = null;
    proto.$prevAttach = null;
    proto.$nextAttach = null;

    proto.$scope = null;
    proto.$hooks = 0;
    proto.$state = 0;

    if ('binding' in proto) proto.$hooks |= Hooks.hasBinding;
    if ('bound' in proto) {
      proto.$hooks |= Hooks.hasBound;
      proto.$nextBound = null;
    }

    if ('unbinding' in proto) proto.$hooks |= Hooks.hasUnbinding;
    if ('unbound' in proto) {
      proto.$hooks |= Hooks.hasUnbound;
      proto.$nextUnbound = null;
    }

    if ('created' in proto) proto.$hooks |= Hooks.hasCreated;
    if ('attaching' in proto) proto.$hooks |= Hooks.hasAttaching;
    if ('attached' in proto) {
      proto.$hooks |= Hooks.hasAttached;
      proto.$nextAttached = null;
    }
    if ('detaching' in proto) proto.$hooks |= Hooks.hasDetaching;
    if ('caching' in proto) proto.$hooks |= Hooks.hasCaching;
    if ('detached' in proto) {
      proto.$hooks |= Hooks.hasDetached;
      proto.$nextDetached = null;
    }

    return <ICustomAttributeType & T>Type;
  }
};

/*@internal*/
export function registerAttribute(this: ICustomAttributeType, container: IContainer): void {
  const description = this.description;
  const resourceKey = CustomAttributeResource.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));

  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    const aliasKey = CustomAttributeResource.keyFrom(aliases[i]);
    container.register(Registration.alias(resourceKey, aliasKey));
  }
}

/*@internal*/
export function createCustomAttributeDescription(def: IAttributeDefinition, Type: ICustomAttributeType): ResourceDescription<IAttributeDefinition> {
  return {
    name: def.name,
    aliases: def.aliases || PLATFORM.emptyArray,
    defaultBindingMode: def.defaultBindingMode || BindingMode.toView,
    isTemplateController: def.isTemplateController || false,
    bindables: {...Type.bindables, ...def.bindables}
  };
}
