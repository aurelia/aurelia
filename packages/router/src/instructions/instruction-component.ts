import { Constructable, IContainer } from '@aurelia/kernel';
import { CustomElement, CustomElementDefinition, isCustomElementViewModel } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType } from '../interfaces';

export interface IInstructionComponent extends InstructionComponent { }

/**
 * Public API - The routing instructions are the core of the router's navigations. The component
 * part of a routing instruction can be specified as a component name, a custom element definition,
 * a custom element type or a custom element instance. The instruction component isn't limited to
 * routing instructions, but can be found in for example load instructions as well. The instruction
 * components are resolved "non-early" to support dynamic, local resolutions.
 */

export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | CustomElementDefinition | Constructable;

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
    }
    this.name = name;
    this.type = type;
    this.instance = instance;
    this.promise = promise;
  }

  public resolve(): void | Promise<ComponentAppellation> {
    if (!(this.promise instanceof Promise)) {
      return;
    }
    // TODO(alpha): Fix the type here
    return (this.promise as any).then((component: ComponentAppellation): void => {
      // TODO(alpha): Fix the issues with import/module here
      if (InstructionComponent.isAppelation(component)) {
        this.set(component);
        return;
      }
      if ((component as unknown as { default: ComponentAppellation }).default != null) {
        this.set((component as unknown as { default: ComponentAppellation }).default);
        return;
      }
      if (Object.keys(component).length === 0) {
        throw new Error(`Failed to load component Type from resolved Promise since no export was specified.`);
      }
      if (Object.keys(component).length > 1) {
        throw new Error(`Failed to load component Type from resolved Promise since no 'default' export was specified when having multiple exports.`);
      }
      const key = Object.keys(component)[0];
      // TODO(alpha): Fix type here
      this.set((component as any)[key] as ComponentAppellation);
    }) as Promise<ComponentAppellation>;
  }

  public get none(): boolean {
    return !this.isName() && !this.isType() && !this.isInstance();
  }
  public isName(): boolean {
    return !!this.name && !this.isType() && !this.isInstance();
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

  public toType(container: IContainer): RouteableComponentType | null {
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
  public toInstance(container: IContainer): IRouteableComponent | null {
    if (this.instance !== null) {
      return this.instance;
    }
    if (container !== void 0 && container !== null) {
      const instance = this.isType()
        ? container.get<IRouteableComponent>(this.type!)
        : container.get<IRouteableComponent>(CustomElement.keyFrom(this.name!));
      if (this.isType() &&
        !(instance instanceof this.type!)
      ) {
        console.warn('Failed to instantiate', this.type, instance);
      }
      return instance ?? null;
    }
    return null;
  }

  public same(other: InstructionComponent, compareType: boolean = false): boolean {
    return compareType ? this.type === other.type : this.name === other.name;
  }

  private getNewName(type: RouteableComponentType): string {
    if (this.name === null
      // || !type.aliases?.includes(this.name)
    ) {
      return InstructionComponent.getName(type);
    }
    return this.name;
  }
}
