/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */

import { Constructable, IContainer } from '@aurelia/kernel';
import { CustomElement, CustomElementDefinition, isCustomElementViewModel } from '@aurelia/runtime-html';
import { IRouteableComponent, RouteableComponentType } from '../interfaces';

export interface IInstructionComponent extends InstructionComponent { }

/**
 * Public API - The routing instructions are the core of the router's navigations
 */

export type ComponentAppellation = string | RouteableComponentType | IRouteableComponent | Constructable;

export class InstructionComponent {
  public name: string | null = null;
  public type: RouteableComponentType | null = null;
  public instance: IRouteableComponent | null = null;

  // Static methods
  public static create(componentAppelation?: ComponentAppellation): InstructionComponent {
    const component = new InstructionComponent();
    component.set(componentAppelation);
    return component;
  }

  public static isName(component: ComponentAppellation): component is string {
    return typeof component === 'string';
  }
  public static isDefinition(component: ComponentAppellation | CustomElementDefinition): component is CustomElementDefinition {
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
  public set(component?: ComponentAppellation): void {
    if (component == null) {
      this.name = null;
      this.type = null;
      this.instance = null;
    } else if (InstructionComponent.isName(component)) {
      this.name = InstructionComponent.getName(component);
      this.type = null;
      this.instance = null;
    } else if (InstructionComponent.isType(component)) {
      this.name = this.getNewName(component);
      this.type = InstructionComponent.getType(component);
      this.instance = null;
    } else if (InstructionComponent.isInstance(component)) {
      this.name = this.getNewName(InstructionComponent.getType(component)!);
      this.type = InstructionComponent.getType(component);
      this.instance = InstructionComponent.getInstance(component);
    }
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
