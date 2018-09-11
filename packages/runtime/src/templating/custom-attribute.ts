import {
  Constructable,
  IContainer,
  Omit,
  PLATFORM,
  Registration,
  Writable,
  Immutable
} from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { BindingMode } from '../binding/binding-mode';
import { IBindScope } from '../binding/observation';
import { INode } from '../dom';
import { IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { IBindableDescription } from './bindable';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export interface ICustomAttributeSource {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
  bindables?: Record<string, IBindableDescription>;
}

export type AttributeDefinition = Immutable<Required<ICustomAttributeSource>> | null;

export type ICustomAttributeType = IResourceType<ICustomAttributeSource, ICustomAttribute>;

export interface ICustomAttribute extends IBindScope, IAttach {
  readonly $scope: IScope;
  $hydrate(renderingEngine: IRenderingEngine): void;
}

/*@internal*/
export interface IInternalCustomAttributeImplementation extends Writable<ICustomAttribute> {
  $behavior: IRuntimeBehavior;
  $child: IAttach;
}


/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(nameOrSource: string | ICustomAttributeSource) {
  return function<T extends Constructable>(target: T) {
    return CustomAttributeResource.define(nameOrSource, target);
  }
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(nameOrSource: string | Omit<ICustomAttributeSource, 'isTemplateController'>) {
  return function<T extends Constructable>(target: T) {
    let source: ICustomAttributeSource;

    if (typeof nameOrSource === 'string') {
      source = {
        name: nameOrSource,
        isTemplateController: true
      };
    } else {
      source = { isTemplateController: true, ...nameOrSource };
    }

    return CustomAttributeResource.define(source, target);
  }
}

export const CustomAttributeResource: IResourceKind<ICustomAttributeSource, ICustomAttributeType> = {
  name: 'custom-attribute',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & ICustomAttributeType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | ICustomAttributeSource, ctor: T): T & ICustomAttributeType {
    const Type = ctor as ICustomAttributeType & T;
    const proto: ICustomAttribute = Type.prototype;
    const description = createCustomAttributeDescription(
      typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource,
      Type
    );

    (Type as Writable<ICustomAttributeType>).kind = CustomAttributeResource;
    (Type as Writable<ICustomAttributeType>).description = description;
    Type.register = register;

    proto.$hydrate = hydrate;
    proto.$bind = bind;
    proto.$attach = attach;
    proto.$detach = detach;
    proto.$unbind = unbind;

    return Type;
  }
};

function register(this: ICustomAttributeType, container: IContainer): void {
  const description = this.description;
  const resourceKey = CustomAttributeResource.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));

  for(let i = 0, ii = aliases.length; i < ii; ++i) {
    container.register(Registration.alias(resourceKey, aliases[i]));
  }
}

function hydrate(this: IInternalCustomAttributeImplementation, renderingEngine: IRenderingEngine): void {
  this.$isAttached = false;
  this.$isBound = false;
  this.$scope = null;
  this.$child = this.$child || null;

  renderingEngine.applyRuntimeBehavior(
    this.constructor as ICustomAttributeType,
    this
  );

  if (this.$behavior.hasCreated) {
    (this as any).created();
  }
}

function bind(this: IInternalCustomAttributeImplementation, flags: BindingFlags, scope: IScope): void {
  if (this.$isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags | BindingFlags.fromBind);
  }

  this.$scope = scope;
  this.$isBound = true;

  if (this.$behavior.hasBound) {
    (this as any).bound(flags | BindingFlags.fromBind, scope);
  }
}

function unbind(this: IInternalCustomAttributeImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    this.$isBound = false;

    if (this.$behavior.hasUnbound) {
      (this as any).unbound(flags | BindingFlags.fromUnbind);
    }
  }
}

function attach(this: IInternalCustomAttributeImplementation, encapsulationSource: INode, lifecycle: AttachLifecycle): void {
  if (this.$isAttached) {
    return;
  }

  if (this.$behavior.hasAttaching) {
    (this as any).attaching(encapsulationSource);
  }

  if (this.$child !== null) {
    this.$child.$attach(encapsulationSource, lifecycle);
  }

  this.$isAttached = true;

  if (this.$behavior.hasAttached) {
    lifecycle.queueAttachedCallback(this);
  }
}

function detach(this: IInternalCustomAttributeImplementation, lifecycle: DetachLifecycle): void {
  if (this.$isAttached) {
    if (this.$behavior.hasDetaching) {
      (this as any).detaching();
    }

    if (this.$child !== null) {
      this.$child.$detach(lifecycle);
    }

    this.$isAttached = false;

    if (this.$behavior.hasDetached) {
      lifecycle.queueDetachedCallback(this);
    }
  }
}

/*@internal*/
export function createCustomAttributeDescription(attributeSource: ICustomAttributeSource, Type: ICustomAttributeType): ResourceDescription<ICustomAttributeSource> {
  return {
    name: attributeSource.name,
    aliases: attributeSource.aliases || PLATFORM.emptyArray,
    defaultBindingMode: attributeSource.defaultBindingMode || BindingMode.toView,
    isTemplateController: attributeSource.isTemplateController || false,
    bindables: {...(Type as any).bindables, ...attributeSource.bindables}
  };
}
