import { Constructable, IContainer, onResolve, Writable } from '@aurelia/kernel';
import { Controller, CustomElement, CustomElementDefinition, IHydratedController, IPlatform, isCustomElementViewModel, registerHostNode } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType } from '../interfaces';
import { RoutingInstruction } from './routing-instruction';

export interface IInstructionComponent extends InstructionComponent { }

/**
 * Public API - The routing instructions are the core of the router's navigations. The component
 * part of a routing instruction can be specified as
 * - a component name, or
 * - a custom element definition, or
 * - a custom element class, or
 * - a custom element instance.
 *
 * The instruction component isn't limited to routing instructions, but can be found in for example load instructions as well.
 * The instruction components are resolved "non-early" to support dynamic, local resolutions.
 */

/** */
export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | CustomElementDefinition | Constructable;
export type ComponentAppellationFunction = (instruction?: RoutingInstruction) => ComponentAppellation | Promise<ComponentAppellation>;

export class InstructionComponent {
  /**
   * The name of the component.
   */
  public name: string | null = null;

  /**
   * The (custom element) type of the component.
   */
  public type: RouteableComponentType | null = null;

  /**
   * The (custom element) instance of the component.
   */
  public instance: IRouteableComponent | null = null;

  /**
   * A promise that will resolve into a component name, type,
   * instance or definition.
   */
  public promise: Promise<ComponentAppellation> | null = null;

  /**
   * A function that should result in a component name, type,
   * instance, definition or promise to any of these at the time
   * of route invocation.
   */
  public func: ComponentAppellationFunction | null = null;

  /**
   * Create a new instruction component.
   *
   * @param component - The component
   */
  public static create(componentAppelation?: ComponentAppellation | Promise<ComponentAppellation>): InstructionComponent {
    const component = new InstructionComponent();
    component.set(componentAppelation);
    return component;
  }

  public static isName(component: ComponentAppellation): component is string {
    return typeof component === 'string';
  }
  public static isDefinition(component: ComponentAppellation): component is CustomElementDefinition {
    return CustomElement.isType((component as CustomElementDefinition).Type);
  }
  public static isType(component: ComponentAppellation): component is RouteableComponentType {
    return CustomElement.isType(component);
  }
  public static isInstance(component: ComponentAppellation): component is IRouteableComponent {
    return isCustomElementViewModel(component);
  }
  public static isAppelation(component: ComponentAppellation): component is ComponentAppellation {
    return InstructionComponent.isName(component)
      || InstructionComponent.isType(component)
      || InstructionComponent.isInstance(component);
  }

  public static getName(component: ComponentAppellation): string {
    if (InstructionComponent.isName(component)) {
      return component;
    } else if (InstructionComponent.isType(component)) {
      return CustomElement.getDefinition(component).name;
    } else {
      return InstructionComponent.getName(component.constructor as Constructable);
    }
  }
  public static getType(component: ComponentAppellation): RouteableComponentType | null {
    if (InstructionComponent.isName(component)) {
      return null;
    } else if (InstructionComponent.isType(component)) {
      return component;
    } else {
      return ((component as IRouteableComponent).constructor as RouteableComponentType);
    }
  }
  public static getInstance(component: ComponentAppellation): IRouteableComponent | null {
    if (InstructionComponent.isName(component) || InstructionComponent.isType(component)) {
      return null;
    } else {
      return component as IRouteableComponent;
    }
  }

  // Instance methods
  public set(component: ComponentAppellation | Promise<ComponentAppellation> | undefined | null): void {
    let name: string | null = null;
    let type: RouteableComponentType | null = null;
    let instance: IRouteableComponent | null = null;
    let promise: Promise<ComponentAppellation> | null = null;
    let func: ComponentAppellationFunction | null = null;
    if (component instanceof Promise) {
      promise = component;
    } else if (InstructionComponent.isName(component!)) {
      name = InstructionComponent.getName(component);
    } else if (InstructionComponent.isType(component!)) {
      name = this.getNewName(component);
      type = InstructionComponent.getType(component);
    } else if (InstructionComponent.isInstance(component!)) {
      name = this.getNewName(InstructionComponent.getType(component)!);
      type = InstructionComponent.getType(component);
      instance = InstructionComponent.getInstance(component);
    } else if (typeof component === 'function') {
      func = component as unknown as ComponentAppellationFunction;
    }

    this.name = name;
    this.type = type;
    this.instance = instance;
    this.promise = promise;
    this.func = func;
  }

  public resolve(instruction: RoutingInstruction): void | Promise<ComponentAppellation> {
    if (this.func !== null) {
      this.set(this.func(instruction));
    }
    if (!(this.promise instanceof Promise)) {
      return;
    }

    return this.promise.then((component: ComponentAppellation): void => {
      // TODO(alpha): Fix the issues with import/module here
      if (InstructionComponent.isAppelation(component)) {
        this.set(component);
        return;
      }
      if ((component as unknown as { default: ComponentAppellation }).default != null) {
        this.set((component as unknown as { default: ComponentAppellation }).default);
        return;
      }
      const keys = Object.keys(component).filter(key => !key.startsWith('__'));
      if (keys.length === 0) {
        throw new Error(`Failed to load component Type from resolved Promise since no export was specified.`);
      }
      if (keys.length > 1) {
        throw new Error(`Failed to load component Type from resolved Promise since no 'default' export was specified when having multiple exports.`);
      }
      const key = keys[0];
      // TODO(alpha): Fix type here
      // eslint-disable-next-line
      this.set((component as any)[key] as ComponentAppellation);
    }) as Promise<ComponentAppellation>;
  }

  public get none(): boolean {
    return !this.isName() && !this.isType() && !this.isInstance() && !this.isFunction() && !this.isPromise();
  }
  public isName(): boolean {
    return this.name != null && this.name !== '' && !this.isType() && !this.isInstance();
  }
  public isType(): boolean {
    return this.type !== null && !this.isInstance();
  }
  public isInstance(): boolean {
    return this.instance !== null;
  }
  public isPromise(): boolean {
    return this.promise !== null;
  }
  public isFunction(): boolean {
    return this.func !== null;
  }

  public toType(container: IContainer, instruction: RoutingInstruction): RouteableComponentType | null {
    // TODO: Allow instantiation from a promise here, by awaiting resolve (?)
    void this.resolve(instruction);

    if (this.type !== null) {
      return this.type;
    }
    if (this.name !== null
      && typeof this.name === 'string') {
      if (container === null) {
        throw new Error(`No container available when trying to resolve component '${this.name}'!`);
      }
      if (container.has<RouteableComponentType>(CustomElement.keyFrom(this.name), true)) {
        const resolver = container.getResolver<RouteableComponentType>(CustomElement.keyFrom(this.name));
        if (resolver !== null && resolver.getFactory !== void 0) {
          const factory = resolver.getFactory(container);
          if (factory) {
            return factory.Type;
          }
        }
      }
    }
    return null;
  }

  /**
   * Returns the component instance of this instruction.
   *
   * Throws instantiation error if there was an error during instantiation.
   */
  public toInstance(parentContainer: IContainer, parentController: IHydratedController, parentElement: HTMLElement, instruction: RoutingInstruction): IRouteableComponent | null | Promise<IRouteableComponent | null> {
    return onResolve(this.resolve(instruction) as IRouteableComponent, () => {
      if (this.instance !== null) {
        return this.instance;
      }
      if (parentContainer == null) {
        return null;
      }

      return this._createInstance(parentContainer, parentController, parentElement, instruction);
    });
  }

  public same(other: InstructionComponent, compareType: boolean = false): boolean {
    return compareType ? this.type === other.type : this.name === other.name;
  }

  private getNewName(type: RouteableComponentType): string {
    if (this.name === null) {
      return InstructionComponent.getName(type);
    }
    return this.name;
  }

  /** @internal */
  /**
   * Creates the component instance for this instruction.
   *
   * Throws instantiation error if there was an error during instantiation.
   */
  private _createInstance(parentContainer: IContainer, parentController: IHydratedController, parentElement: HTMLElement, instruction: RoutingInstruction): IRouteableComponent | null {
    const container = parentContainer.createChild();
    const Type = this.isType()
      ? this.type!
      : container.getResolver<RouteableComponentType>(CustomElement.keyFrom(this.name!))!.getFactory!(container)!.Type;
    const host = parentElement.appendChild(
      container.get(IPlatform).document.createElement(CustomElement.getDefinition(Type).name)
    );
    registerHostNode(container, host);
    const instance = container.invoke(Type);
    // TODO: Investigate this!
    // const instance: IRouteableComponent = this.isType()
    //   ? container.invoke(this.type!)
    //   : container.get(routerComponentResolver(this.name!));

    // TODO: Implement non-traversing lookup (below) based on router configuration
    // let instance;
    // if (this.isType()) {
    //   instance = ownContainer.invoke(this.type!);
    // } else {
    //   const def = CustomElement.find(ownContainer, this.name!);
    //   if (def != null) {
    //     instance = ownContainer.invoke(def.Type);
    //   }
    // }
    if (instance == null) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('Failed to create instance when trying to resolve component', this.name, this.type, '=>', instance);
      }
      throw new Error(`Failed to create instance when trying to resolve component '${this.name}'!`);
    }
    const controller = Controller.$el(
      container,
      instance,
      host,
      null,
    );
    // TODO: Investigate if this is really necessary
    (controller as Writable<typeof controller>).parent = parentController;

    return instance;
  }
}

// TODO: Investigate this (should possibly be added back)
// function routerComponentResolver(name: string): IResolver<IRouteableComponent> {
//   const key = CustomElement.keyFrom(name);
//   return {
//     $isResolver: true,
//     resolve(_, requestor) {
//       // const container = requestor.get(IHydrationContext).parent!.controller.container;
//       if (requestor.has(key, false)) {
//         return requestor.get(key);
//       }
//       if (requestor.root.has(key, false)) {
//         return requestor.root.get(key);
//       }
//       // it's not always correct to consider this resolution as a traversal
//       // since sometimes it could be the work of trying a fallback configuration as component
//       // todo: cleanup the paths so that it's clearer when a fallback is being tried vs when an actual component name configuration
//       //
//       // console.warn(`Detected resource traversal behavior. A custom element "${name}" is neither`
//       //   + ` registered locally nor globally. This is not a supported behavior and will be removed in a future release`);
//       return requestor.get(key);
//     }
//   };
// }
