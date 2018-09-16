import { BindingFlags } from '../binding/binding-flags';
import { Observer } from '../binding/property-observation';
import { ICustomAttribute, ICustomAttributeType, IInternalCustomAttributeImplementation } from './custom-attribute';
import { ICustomElement, ICustomElementType, IInternalCustomElementImplementation } from './custom-element';
import { BindableDefinitions } from './instructions';

export interface IRuntimeBehavior {
  readonly hasCreated: boolean;
  readonly hasBound: boolean;
  readonly hasAttaching: boolean;
  readonly hasAttached: boolean;
  readonly hasDetaching: boolean;
  readonly hasDetached: boolean;
  readonly hasUnbound: boolean;
  readonly hasRender: boolean;
}

/** @internal */
export class RuntimeBehavior implements IRuntimeBehavior {
  public bindables: BindableDefinitions;

  public hasCreated: boolean = false;
  public hasBound: boolean = false;
  public hasAttaching: boolean = false;
  public hasAttached: boolean = false;
  public hasDetaching: boolean = false;
  public hasDetached: boolean = false;
  public hasUnbound: boolean = false;
  public hasRender: boolean = false;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;
    behavior.hasCreated = 'created' in instance;
    behavior.hasBound = 'bound' in instance;
    behavior.hasAttaching = 'attaching' in instance;
    behavior.hasAttached = 'attached' in instance;
    behavior.hasDetaching = 'detaching' in instance;
    behavior.hasDetached = 'detached' in instance;
    behavior.hasUnbound = 'unbound' in instance;
    behavior.hasRender = 'render' in instance;

    return behavior;
  }

  public applyTo(instance: (ICustomAttribute | ICustomElement) & { $behavior?: IRuntimeBehavior }): void {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];

      observers[name] = new Observer(
        instance,
        name,
        bindables[name].callback
      );

      Reflect.defineProperty(instance, name, {
        enumerable: true,
        get: function() { return this.$observers[name].getValue(); },
        set: function(value) { this.$observers[name].setValue(value, BindingFlags.updateTargetInstance); }
      });
    }

    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });

    instance.$behavior = this;
  }
}
