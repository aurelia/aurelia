import { Constructable, Decoratable, Decorated, IContainer, Immutable, Omit, PLATFORM, Registration, Writable } from '@aurelia/kernel';
import { BindingMode } from '../binding/binding-mode';
import { IAttributeDefinition } from '../definitions';
import { Hooks, IAttach, IBindScope, ILifecycleHooks, IState, Lifecycle, State } from '../lifecycle';
import { BindingFlags, IScope } from '../observation';
import { IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { IRenderable, IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export interface ICustomAttributeType extends
  IResourceType<IAttributeDefinition, ICustomAttribute>,
  Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> { }

type OptionalHooks = ILifecycleHooks & Omit<IRenderable, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$scope'>> & IState;

export interface ICustomAttribute extends IBindScope, IAttach, OptionalHooks, RequiredLifecycleProperties {
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
  name: 'custom-attribute',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable & Partial<ICustomAttributeType>>(Type: T): Type is T & ICustomAttributeType {
    return Type.kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType {
    const Type = ctor as T & Writable<ICustomAttributeType>;
    const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, <T & ICustomAttributeType>Type);
    const proto: Writable<ICustomAttribute> = Type.prototype;

    Type.kind = CustomAttributeResource;
    Type.description = description;
    Type.register = register;

    proto.$hydrate = $hydrate;
    proto.$bind = $bind;
    proto.$attach = $attach;
    proto.$detach = $detach;
    proto.$unbind = $unbind;
    proto.$cache = $cache;

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
      proto.$boundFlags = 0;
      proto.$nextBound = null;
    }

    if ('unbinding' in proto) proto.$hooks |= Hooks.hasUnbinding;
    if ('unbound' in proto) {
      proto.$hooks |= Hooks.hasUnbound;
      proto.$unboundFlags = 0;
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
export function register(this: ICustomAttributeType, container: IContainer): void {
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
export function $hydrate(this: Writable<ICustomAttribute>, renderingEngine: IRenderingEngine): void {
  const Type = this.constructor as ICustomAttributeType;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
}

/*@internal*/
export function $bind(this: Writable<ICustomAttribute>, flags: BindingFlags, scope: IScope): void {
  flags |= BindingFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this, flags);
  }

  this.$scope = scope;

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  if (hooks & Hooks.hasBound) {
    Lifecycle.unqueueBound();
  }
}

/*@internal*/
export function $unbind(this: Writable<ICustomAttribute>, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this, flags);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.unqueueUnbound();
    }
  }
}

/*@internal*/
export function $attach(this: Writable<ICustomAttribute>): void {
  if (this.$state & State.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching();
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    Lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
}

/*@internal*/
export function $detach(this: Writable<ICustomAttribute>): void {
  if (this.$state & State.isAttached) {
    // add isDetaching flag
    this.$state |= State.isDetaching;

    const hooks = this.$hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching();
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      Lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
  }
}

/*@internal*/
export function $cache(this: Writable<ICustomAttribute>): void {
  if (this.$hooks & Hooks.hasCaching) {
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
