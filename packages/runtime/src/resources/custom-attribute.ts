import {
  Class,
  Constructable,
  IContainer,
  Immutable,
  IResourceKind,
  IResourceType,
  IServiceLocator,
  Omit,
  PLATFORM,
  Registration,
  ResourceDescription,
  Writable
} from '@aurelia/kernel';
import {
  customAttributeKey,
  customAttributeName,
  IAttributeDefinition
} from '../definitions';
import { INode } from '../dom';
import { BindingMode, ensureValidStrategy, Hooks, LifecycleFlags } from '../flags';
import {
  IComponent,
  ILifecycleHooks,
  IRenderable
} from '../lifecycle';
import { IChangeTracker } from '../observation';
import {
  $attachAttribute,
  $cacheAttribute,
  $detachAttribute
} from '../templating/lifecycle-attach';
import {
  $bindAttribute,
  $patch,
  $unbindAttribute
} from '../templating/lifecycle-bind';
import { $hydrateAttribute } from '../templating/lifecycle-render';

type CustomAttributeStaticProperties = Pick<Immutable<Required<IAttributeDefinition>>, 'bindables'>;

export type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;

export interface ICustomAttributeType<T extends INode = INode> extends
  IResourceType<IAttributeDefinition, ICustomAttribute<T>>,
  CustomAttributeStaticProperties { }

export interface ICustomAttribute<T extends INode = INode> extends
  Partial<IChangeTracker>,
  ILifecycleHooks,
  IComponent,
  IRenderable<T> {

  $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator): void;
}

export interface ICustomAttributeResource<T extends INode = INode> extends
  IResourceKind<IAttributeDefinition, ICustomAttribute<T>, Class<ICustomAttribute<T>> & CustomAttributeStaticProperties> {
}

/** @internal */
export function registerAttribute(this: ICustomAttributeType, container: IContainer): void {
  const description = this.description;
  const resourceKey = this.kind.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));

  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    const aliasKey = this.kind.keyFrom(aliases[i]);
    container.register(Registration.alias(resourceKey, aliasKey));
  }
}

/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(name: string): CustomAttributeDecorator;
export function customAttribute(definition: IAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(nameOrDefinition, target);
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(name: string): CustomAttributeDecorator;
export function templateController(definition: IAttributeDefinition): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(
    typeof nameOrDefinition === 'string'
    ? { isTemplateController: true , name: nameOrDefinition }
    : { isTemplateController: true, ...nameOrDefinition },
    target);
}

type HasDynamicOptions = Pick<IAttributeDefinition, 'hasDynamicOptions'>;

function dynamicOptionsDecorator<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions> {
  target.hasDynamicOptions = true;
  return target as T & Required<HasDynamicOptions>;
}

/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export function dynamicOptions(): typeof dynamicOptionsDecorator;
/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export function dynamicOptions<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions>;
export function dynamicOptions<T extends Constructable>(target?: T & HasDynamicOptions): T & Required<HasDynamicOptions> | typeof dynamicOptionsDecorator {
  return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator<T>(target);
}

function isType<T>(this: ICustomAttributeResource, Type: T & Partial<ICustomAttributeType>): Type is T & ICustomAttributeType {
  return Type.kind === this;
}

function define<T extends Constructable>(this: ICustomAttributeResource, name: string, ctor: T): T & ICustomAttributeType;
function define<T extends Constructable>(this: ICustomAttributeResource, definition: IAttributeDefinition, ctor: T): T & ICustomAttributeType;
function define<T extends Constructable>(this: ICustomAttributeResource, nameOrDefinition: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType {
  const Type = ctor as T & Writable<ICustomAttributeType>;
  const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type as T & ICustomAttributeType);
  const proto: Writable<ICustomAttribute> = Type.prototype;

  Type.kind = CustomAttributeResource;
  Type.description = description;
  Type.register = registerAttribute;

  proto.$hydrate = $hydrateAttribute;
  proto.$bind = $bindAttribute;
  proto.$patch = $patch;
  proto.$attach = $attachAttribute;
  proto.$detach = $detachAttribute;
  proto.$unbind = $unbindAttribute;
  proto.$cache = $cacheAttribute;

  proto.$prevComponent = null;
  proto.$nextComponent = null;
  proto.$nextPatch = null;

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

  return Type as ICustomAttributeType & T;
}

export const CustomAttributeResource: ICustomAttributeResource = {
  name: customAttributeName,
  keyFrom: customAttributeKey,
  isType,
  define
};

/** @internal */
export function createCustomAttributeDescription(def: IAttributeDefinition, Type: ICustomAttributeType): ResourceDescription<IAttributeDefinition> {
  const aliases = def. aliases;
  const defaultBindingMode = def.defaultBindingMode;
  return {
    name: def.name,
    aliases: aliases === undefined || aliases === null ? PLATFORM.emptyArray : aliases,
    defaultBindingMode: defaultBindingMode === undefined || defaultBindingMode === null ? BindingMode.toView : defaultBindingMode,
    hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
    isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
    bindables: {...Type.bindables, ...def.bindables},
    strategy: ensureValidStrategy(def.strategy)
  };
}

export type CustomAttributeDecorator = <T extends Constructable>(target: T) => T & ICustomAttributeType;
