/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  IIndexable,
  DI,
  isObject,
} from '@aurelia/kernel';
import {
  ICustomElementViewModel,
  ICustomElementController,
  PartialCustomElementDefinition,
  isCustomElementViewModel,
  CustomElement,
  CustomElementDefinition,
} from '@aurelia/runtime';

import {
  IRouteViewModel,
} from './component-agent';
import {
  RouteType,
} from './route';
import {
  IRouteContext,
} from './route-context';
import {
  expectType,
  isPartialCustomElementDefinition,
  isPartialViewportInstruction,
} from './validation';

export type RouteContextLike = (
  IRouteContext |
  ICustomElementViewModel<HTMLElement> |
  ICustomElementController<HTMLElement> |
  HTMLElement
);

/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportIntruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = (
  string |
  IViewportInstruction |
  RouteableComponent
);

/**
 * A component type, instance of definition that can be navigated to:
 * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
 * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
 * - `IRouteViewModel`: an existing component instance.
 */
export type RouteableComponent = (
  RouteType |
  PartialCustomElementDefinition |
  IRouteViewModel
);

export const IViewportInstruction = DI.createInterface<IViewportInstruction>('IViewportInstruction').noDefault();
// All properties except `component` are optional.
export interface IViewportInstruction extends
  Omit<Partial<ViewportInstruction>, 'component'>,
  Pick<ViewportInstruction, 'component'> { }

export class ViewportInstruction {
  public constructor(
    public readonly title: string | null,
    public readonly append: boolean,
    public readonly context: RouteContextLike | null,
    public readonly state: Readonly<IIndexable> | null,
    /**
     * The component to load.
     *
     * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
     * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
     * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
     * - `IRouteViewModel`: an existing component instance.
     */
    public readonly component: string | RouteableComponent,
    /**
     * The name of the viewport this component should be loaded into.
     */
    public readonly viewport: string | null,
    /**
     * The parameters to pass into the component.
     */
    public readonly params: Readonly<IIndexable>,
    /**
     * The child routes to load underneath the context of this instruction's component.
     */
    public readonly children: readonly NavigationInstruction[],
  ) { }

  public static create(
    input: IViewportInstruction,
  ): ViewportInstruction {
    return new ViewportInstruction(
      input.title ?? null,
      input.append ?? false,
      input.context ?? null,
      input.state ?? null,
      input.component,
      input.viewport ?? null,
      input.params ?? {},
      input.children ?? [],
    );
  }

  public toString(): string {
    // TODO: write some shared serialization logic and use it in this toString() method
    return `ViewportInstruction(component:${this.component},viewport:${this.viewport},children.length:${this.children.length})`;
  }
}

/* eslint-disable no-shadow */
export const enum NavigationInstructionType {
  string,
  ViewportInstruction,
  CustomElementDefinition,
  IRouteViewModel,
}
/* eslint-enable no-shadow */
export interface ITypedNavigationInstruction<
  TInstruction extends NavigationInstruction,
  TType extends NavigationInstructionType
> {
  readonly type: TType;
  readonly value: TInstruction;
}
export interface ITypedNavigationInstruction_string extends
  ITypedNavigationInstruction<string, NavigationInstructionType.string> {}
export interface ITypedNavigationInstruction_ViewportInstruction extends
  ITypedNavigationInstruction<ViewportInstruction, NavigationInstructionType.ViewportInstruction> {}
export interface ITypedNavigationInstruction_CustomElementDefinition extends
  ITypedNavigationInstruction<CustomElementDefinition, NavigationInstructionType.CustomElementDefinition> {}
export interface ITypedNavigationInstruction_IRouteViewModel extends
  ITypedNavigationInstruction<IRouteViewModel, NavigationInstructionType.IRouteViewModel> {}

export type ITypedNavigationInstruction_T = (
  ITypedNavigationInstruction_string |
  ITypedNavigationInstruction_ViewportInstruction |
  ITypedNavigationInstruction_CustomElementDefinition |
  ITypedNavigationInstruction_IRouteViewModel
);

export class TypedNavigationInstruction<
  TInstruction extends NavigationInstruction,
  TType extends NavigationInstructionType
> implements ITypedNavigationInstruction<TInstruction, TType> {
  public constructor(
    public readonly type: TType,
    public readonly value: TInstruction,
  ) {}

  public static create(instruction: string): ITypedNavigationInstruction_string;
  public static create(instruction: IViewportInstruction): ITypedNavigationInstruction_ViewportInstruction;
  public static create(instruction: RouteType | PartialCustomElementDefinition): ITypedNavigationInstruction_CustomElementDefinition;
  public static create(instruction: IRouteViewModel): ITypedNavigationInstruction_IRouteViewModel;
  public static create(instruction: Exclude<NavigationInstruction, IViewportInstruction>): Exclude<ITypedNavigationInstruction_T, ITypedNavigationInstruction_ViewportInstruction>;
  public static create(instruction: NavigationInstruction): ITypedNavigationInstruction_T;
  public static create(instruction: NavigationInstruction): ITypedNavigationInstruction_T {
    if (typeof instruction === 'string') {
      return new TypedNavigationInstruction(NavigationInstructionType.string, instruction);
    } else if (!isObject(instruction)) {
      // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
      expectType('function/class or object', '', instruction);
    } else if (typeof instruction === 'function') {
      // This is the class itself
      // CustomElement.getDefinition will throw if the type is not a custom element
      const definition = CustomElement.getDefinition(instruction);
      return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, definition);
    } else if (isPartialViewportInstruction(instruction)) {
      const viewportInstruction = ViewportInstruction.create(instruction);
      return new TypedNavigationInstruction(NavigationInstructionType.ViewportInstruction, viewportInstruction);
    } else if (isCustomElementViewModel(instruction)) {
      return new TypedNavigationInstruction(NavigationInstructionType.IRouteViewModel, instruction);
    } else if (instruction instanceof CustomElementDefinition) {
      // We might have gotten a complete definition. In that case use it as-is.
      return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, instruction);
    } else if (isPartialCustomElementDefinition(instruction)) {
      // If we just got a partial definition, define a new anonymous class
      const Type = CustomElement.define(instruction);
      const definition = CustomElement.getDefinition(Type);
      return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, definition);
    } else {
      throw new Error(`Invalid component ${String(instruction)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
    }
  }

  public toString(this: ITypedNavigationInstruction_T): string {
    switch (this.type) {
      case NavigationInstructionType.CustomElementDefinition:
        return `CustomElementDefinition(name:'${this.value.name}')`;
      case NavigationInstructionType.IRouteViewModel:
        return `ViewModel(constructor.name:'${this.value.constructor.name}')`;
      case NavigationInstructionType.ViewportInstruction:
        return this.value.toString();
      case NavigationInstructionType.string:
        return `'${this.value}'`;
    }
  }
}
