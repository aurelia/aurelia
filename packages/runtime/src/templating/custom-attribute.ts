import {
  Constructable,
  Decoratable,
  Decorated,
  IContainer,
  Immutable,
  Omit,
  PLATFORM,
  Registration,
  Writable
} from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { BindingMode } from '../binding/binding-mode';
import { IBindScope } from '../binding/observation';
import { INode } from '../dom';
import { IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';
import { IAttach, IAttachLifecycle, IDetachLifecycle, ILifecycleHooks, LifecycleHooks } from './lifecycle';
import { IRenderable, IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export interface IAttributeDefinition {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
  bindables?: Record<string, IBindableDescription>;
}

export type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;

export interface ICustomAttributeType extends
  IResourceType<IAttributeDefinition, ICustomAttribute>,
  Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> { }

type OptionalLifecycleHooks = Omit<ILifecycleHooks, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$isAttached' | '$isBound' | '$scope'>>;

export interface ICustomAttribute extends IBindScope, IAttach, OptionalLifecycleHooks, RequiredLifecycleProperties {
  $hydrate(renderingEngine: IRenderingEngine): void;
}

/*@internal*/
export interface IInternalCustomAttributeImplementation extends Writable<ICustomAttribute> {
  $behavior: IRuntimeBehavior;
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
  name: 'custom-attribute',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable & Partial<ICustomAttributeType>>(Type: T): Type is T & ICustomAttributeType {
    return Type.kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType {
    const Type = ctor as Writable<ICustomAttributeType> & T;
    const proto: ICustomAttribute = Type.prototype;
    const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, <T & ICustomAttributeType>Type);

    Type.kind = CustomAttributeResource;
    Type.description = description;
    Type.register = register;

    proto.$hydrate = hydrate;
    proto.$bind = bind;
    proto.$attach = attach;
    proto.$detach = detach;
    proto.$unbind = unbind;
    proto.$cache = cache;

    return <ICustomAttributeType & T>Type;
  }
};

function register(this: ICustomAttributeType, container: IContainer): void {
  const description = this.description;
  const resourceKey = CustomAttributeResource.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));

  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    const aliasKey = CustomAttributeResource.keyFrom(aliases[i]);
    container.register(Registration.alias(resourceKey, aliasKey));
  }
}

function hydrate(this: IInternalCustomAttributeImplementation, renderingEngine: IRenderingEngine): void {
  const Type = this.constructor as ICustomAttributeType;

  this.$isAttached = false;
  this.$isBound = false;
  this.$scope = null;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$behavior.hooks & LifecycleHooks.hasCreated) {
    this.created();
  }
}

function bind(this: IInternalCustomAttributeImplementation, flags: BindingFlags, scope: IScope): void {
  flags |= BindingFlags.fromBind;

  if (this.$isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }

  const hooks = this.$behavior.hooks;
  this.$scope = scope;

  if (hooks & LifecycleHooks.hasBinding) {
    this.binding(flags);
  }

  this.$isBound = true;

  if (hooks & LifecycleHooks.hasBound) {
    this.bound(flags);
  }
}

function unbind(this: IInternalCustomAttributeImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    const hooks = this.$behavior.hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & LifecycleHooks.hasUnbinding) {
      this.unbinding(flags);
    }

    this.$isBound = false;

    if (this.$behavior.hooks & LifecycleHooks.hasUnbound) {
      this.unbound(flags);
    }
  }
}

function attach(this: IInternalCustomAttributeImplementation, encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
  if (this.$isAttached) {
    return;
  }
  const hooks = this.$behavior.hooks;

  if (hooks & LifecycleHooks.hasAttaching) {
    this.attaching(encapsulationSource, lifecycle);
  }

  this.$isAttached = true;

  if (hooks & LifecycleHooks.hasAttached) {
    lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
}

function detach(this: IInternalCustomAttributeImplementation, lifecycle: IDetachLifecycle): void {
  if (this.$isAttached) {
    const hooks = this.$behavior.hooks;
    if (hooks & LifecycleHooks.hasDetaching) {
      this.detaching(lifecycle);
    }

    this.$isAttached = false;

    if (hooks & LifecycleHooks.hasDetached) {
      lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
  }
}

function cache(this: IInternalCustomAttributeImplementation): void {
  if (this.$behavior.hooks & LifecycleHooks.hasCaching) {
    this.caching();
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
