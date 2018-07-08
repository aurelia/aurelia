import { IBindScope } from '../binding/observation';
import { IAttach, AttachLifecycle, DetachLifecycle } from './lifecycle';
import { IScope } from '../binding/binding-context';
import { IRenderingEngine } from './rendering-engine';
import { Writable, Constructable, Immutable, Omit } from '../../kernel/interfaces';
import { IRuntimeBehavior } from './runtime-behavior';
import { IRenderSlot } from './render-slot';
import { IResourceType, IResourceKind, ResourceDescription } from '../resource';
import { IContainer, Registration } from '../../kernel/di';
import { INode } from '../dom';
import { PLATFORM } from '../../kernel/platform';
import { BindingMode } from '../binding/binding-mode';
import { IBindableDescription } from './bindable';

export interface ICustomAttributeSource {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
  bindables?: Record<string, IBindableDescription>;
}

export type ICustomAttributeType = IResourceType<ICustomAttributeSource, ICustomAttribute>;

export interface ICustomAttribute extends IBindScope, IAttach { 
  readonly $isBound: boolean;
  readonly $isAttached: boolean;
  readonly $scope: IScope;
  $hydrate(renderingEngine: IRenderingEngine);
}

interface IInternalCustomAttributeImplementation extends Writable<ICustomAttribute> {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IRenderSlot;
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
      source = Object.assign({ isTemplateController: true }, nameOrSource);
    }

    return CustomAttributeResource.define(source, target);
  }
}

export const CustomAttributeResource: IResourceKind<ICustomAttributeSource, ICustomAttributeType> = {
  name: 'custom-attribute',

  key(name: string) {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & ICustomAttributeType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | ICustomAttributeSource, ctor: T): T & ICustomAttributeType { 
    const Type: T & ICustomAttributeType = ctor as any;
    const description = createDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
    const proto: ICustomAttribute = Type.prototype;

    (Type as Writable<ICustomAttributeType>).kind = CustomAttributeResource;
    (Type as Writable<ICustomAttributeType>).description = description;
    Type.register = function register(container: IContainer){
      const resourceKey = Type.kind.key(description.name);

      container.register(Registration.transient(resourceKey, Type));

      const aliases = description.aliases;

      for(let i = 0, ii = aliases.length; i < ii; ++i) {
        container.register(Registration.alias(resourceKey, aliases[i]));
      }
    };

    proto.$hydrate = function(this: IInternalCustomAttributeImplementation, renderingEngine: IRenderingEngine) {
      this.$changeCallbacks = [];
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = null;
      this.$slot = null;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, description.bindables);

      if (this.$behavior.hasCreated) {
        (this as any).created();
      }
    };

    proto.$bind = function(this: IInternalCustomAttributeImplementation, scope: IScope) {
      if (this.$isBound) {
        if (this.$scope === scope) {
          return;
        }

        this.$unbind();
      }

      this.$scope = scope
      this.$isBound = true;

      const changeCallbacks = this.$changeCallbacks;

      for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
        changeCallbacks[i]();
      }

      if (this.$behavior.hasBound) {
        (this as any).bound(scope);
      }
    };

    proto.$attach = function(this: IInternalCustomAttributeImplementation, encapsulationSource: INode, lifecycle: AttachLifecycle){
      if (this.$isAttached) {
        return;
      }

      if (this.$behavior.hasAttaching) {
        (this as any).attaching(encapsulationSource);
      }

      if (this.$slot !== null) {
        this.$slot.$attach(encapsulationSource, lifecycle);
      }
    
      if (this.$behavior.hasAttached) {
        lifecycle.queueAttachedCallback(this);
      }

      this.$isAttached = true;
    };

    proto.$detach = function(this: IInternalCustomAttributeImplementation, lifecycle: DetachLifecycle) {
      if (this.$isAttached) {
        if (this.$behavior.hasDetaching) {
          (this as any).detaching();
        }

        if (this.$slot !== null) {
          this.$slot.$detach(lifecycle);
        }

        if (this.$behavior.hasDetached) {
          lifecycle.queueDetachedCallback(this);
        }

        this.$isAttached = false;
      }
    };

    proto.$unbind = function(this: IInternalCustomAttributeImplementation) {
      if (this.$isBound) {
        if (this.$behavior.hasUnbound) {
          (this as any).unbound();
        }

        this.$isBound = false;
      }
    };
    
    return Type;
  }
};

function createDescription(attributeSource: ICustomAttributeSource, Type: ICustomAttributeType): ResourceDescription<ICustomAttributeSource> {
  return {
    name: attributeSource.name,
    aliases: attributeSource.aliases || PLATFORM.emptyArray,
    defaultBindingMode: attributeSource.defaultBindingMode || BindingMode.oneWay,
    isTemplateController: attributeSource.isTemplateController || false,
    bindables: Object.assign({}, (Type as any).bindables, attributeSource.bindables)
  };
}
