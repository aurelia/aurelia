import { Constructable, Decoratable, Decorated, IContainer, Immutable, Omit, PLATFORM, Registration, Writable } from '@aurelia/kernel';
import { BindingMode } from '../binding/binding-mode';
import { AttributeDefinition, customAttributeKey, customAttributeName, IAttributeDefinition } from '../definitions';
import { Hooks, IAttach, IBindScope, ILifecycleHooks, ILifecycleUnbindAfterDetach, IRenderable, IState } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { $attachAttribute, $cacheAttribute, $detachAttribute } from './lifecycle-attach';
import { $bindAttribute, $unbindAttribute } from './lifecycle-bind';
import { $hydrateAttribute, IRenderingEngine } from './lifecycle-render';

type OptionalHooks = ILifecycleHooks & Omit<IRenderable, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$scope'>> & IState;

type CustomAttributeStaticProperties = Pick<AttributeDefinition, 'bindables'>;

export type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;

export interface ICustomAttributeType extends
  IResourceType<IAttributeDefinition, ICustomAttribute>,
  Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> { }

export interface ICustomAttribute extends Partial<IChangeTracker>, IBindScope, ILifecycleUnbindAfterDetach, IAttach, OptionalHooks, RequiredLifecycleProperties {
  $hydrate(renderingEngine: IRenderingEngine): void;
}

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

  define<T extends Constructable>(nameOrDefinition: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType {
    const Type = ctor as T & Writable<ICustomAttributeType>;
    const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, <T & ICustomAttributeType>Type);
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

    proto.$nextUnbindAfterDetach = null;

    proto.$scope = null;
    proto.$hooks = 0;
    proto.$state = 0;

    if ('flush' in proto) {
      proto.$nextFlush = null;
    }

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
  const aliases = def. aliases;
  const defaultBindingMode = def.defaultBindingMode;
  return {
    name: def.name,
    aliases: aliases === undefined || aliases === null ? PLATFORM.emptyArray : aliases,
    defaultBindingMode: defaultBindingMode === undefined || defaultBindingMode === null ? BindingMode.toView : defaultBindingMode,
    isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
    bindables: {...Type.bindables, ...def.bindables}
  };
}
