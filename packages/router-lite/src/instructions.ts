import { DI, isObject, Constructable, IModule, isArrayIndex } from '@aurelia/kernel';
import { ICustomElementViewModel, ICustomElementController, PartialCustomElementDefinition, isCustomElementViewModel, CustomElement, CustomElementDefinition } from '@aurelia/runtime-html';

import { IRouteViewModel } from './component-agent.js';
import { RouteType } from './route.js';
import { IRouteContext } from './route-context.js';
import { expectType, isPartialCustomElementDefinition, isPartialViewportInstruction, shallowEquals } from './validation.js';
import { emptyQuery, INavigationOptions, NavigationOptions } from './router.js';
import { RouteExpression } from './route-expression.js';
import { tryStringify } from './util.js';

export type RouteContextLike = IRouteContext | ICustomElementViewModel | ICustomElementController | HTMLElement;

/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportIntruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = string | IViewportInstruction | RouteableComponent;

/**
 * A component type, instance of definition that can be navigated to:
 * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
 * - `Promise<IModule>`: a lazy loaded module, e.g. the return value of a dynamic import expression pointing to a file with a routeable component as the default export or the first named export.
 * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
 * - `IRouteViewModel`: an existing component instance.
 */
export type RouteableComponent = RouteType | (() => RouteType) | Promise<IModule> | PartialCustomElementDefinition | IRouteViewModel;

export type Params = { [key: string]: string | undefined };

export const IViewportInstruction = DI.createInterface<IViewportInstruction>('IViewportInstruction');
export interface IViewportInstruction {
  readonly context?: RouteContextLike | null;
  readonly append?: boolean;
  readonly open?: number;
  readonly close?: number;
  /**
   * The component to load.
   *
   * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
   * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
   * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
   * - `IRouteViewModel`: an existing component instance.
   */
  readonly component: string | RouteableComponent;
  /**
   * The name of the viewport this component should be loaded into.
   */
  readonly viewport?: string | null;
  /**
   * The parameters to pass into the component.
   */
  readonly params?: Params | null;
  /**
   * The child routes to load underneath the context of this instruction's component.
   */
  readonly children?: readonly NavigationInstruction[];
}

export class ViewportInstruction<TComponent extends ITypedNavigationInstruction_T = ITypedNavigationInstruction_Component> implements IViewportInstruction {
  private constructor(
    public readonly context: RouteContextLike | null,
    public append: boolean,
    public open: number,
    public close: number,
    public readonly component: TComponent,
    public readonly viewport: string | null,
    public readonly params: Params | null,
    public readonly children: ViewportInstruction[],
  ) {}

  public static create(instruction: NavigationInstruction, context?: RouteContextLike | null): ViewportInstruction {
    if (instruction instanceof ViewportInstruction) {
      return instruction;
    }

    if (isPartialViewportInstruction(instruction)) {
      const component = TypedNavigationInstruction.create(instruction.component);
      const children = instruction.children?.map(ViewportInstruction.create) ?? [];

      return new ViewportInstruction(
        instruction.context ?? context ?? null,
        instruction.append ?? false,
        instruction.open ?? 0,
        instruction.close ?? 0,
        component,
        instruction.viewport ?? null,
        instruction.params ?? null,
        children,
      );
    }

    const typedInstruction = TypedNavigationInstruction.create(instruction);
    return new ViewportInstruction(context ?? null, false, 0, 0, typedInstruction, null, null, []);
  }

  public contains(other: ViewportInstruction): boolean {
    const thisChildren = this.children;
    const otherChildren = other.children;
    if (thisChildren.length < otherChildren.length) {
      return false;
    }

    // TODO(fkleuver): incorporate viewports when null / '' descrepancies are fixed,
    // as well as params when inheritance is fully fixed
    if (!this.component.equals(other.component)) {
      return false;
    }

    for (let i = 0, ii = otherChildren.length; i < ii; ++i) {
      if (!thisChildren[i].contains(otherChildren[i])) {
        return false;
      }
    }

    return true;
  }

  public equals(other: ViewportInstruction): boolean {
    const thisChildren = this.children;
    const otherChildren = other.children;
    if (thisChildren.length !== otherChildren.length) {
      return false;
    }

    if (
      // TODO(fkleuver): decide if we really need to include `context` in this comparison
      !this.component.equals(other.component) ||
      this.viewport !== other.viewport ||
      !shallowEquals(this.params, other.params)
    ) {
      return false;
    }

    for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
      if (!thisChildren[i].equals(otherChildren[i])) {
        return false;
      }
    }

    return true;
  }

  public clone(): this {
    return new ViewportInstruction(
      this.context,
      this.append,
      this.open,
      this.close,
      this.component.clone(),
      this.viewport,
      this.params === null ? null : { ...this.params },
      [...this.children],
    ) as this;
  }

  public toUrlComponent(recursive: boolean = true): string {
    // TODO(fkleuver): use the context to determine create full tree
    const component = this.component.toUrlComponent();
    const params = this.params === null || Object.keys(this.params).length === 0 ? '' : `(${stringifyParams(this.params)})`;
    const viewport = component.length === 0 || this.viewport === null || this.viewport.length === 0 ? '' : `@${this.viewport}`;
    const thisPart = `${'('.repeat(this.open)}${component}${params}${viewport}${')'.repeat(this.close)}`;
    const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
    if (thisPart.length > 0) {
      if (childPart.length > 0) {
        return [thisPart, childPart].join('/');
      }
      return thisPart;
    }
    return childPart;
  }

  public toString(): string {
    const component = `c:${this.component}`;
    const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
    const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
    const props = [component, viewport, children].filter(Boolean).join(',');
    return `VPI(${props})`;
  }
}

function stringifyParams(params: Params): string {
  const keys = Object.keys(params);
  const values = Array<string>(keys.length);
  const indexKeys: number[] = [];
  const namedKeys: string[] = [];
  for (const key of keys) {
    if (isArrayIndex(key)) {
      indexKeys.push(Number(key));
    } else {
      namedKeys.push(key);
    }
  }

  for (let i = 0; i < keys.length; ++i) {
    const indexKeyIdx = indexKeys.indexOf(i);
    if (indexKeyIdx > -1) {
      values[i] = params[i] as string;
      indexKeys.splice(indexKeyIdx, 1);
    } else {
      const namedKey = namedKeys.shift()!;
      values[i] = `${namedKey}=${params[namedKey]}`;
    }
  }
  return values.join(',');
}

export interface IRedirectInstruction {
  readonly path: string;
  readonly redirectTo: string;
}

export class RedirectInstruction implements IRedirectInstruction {
  private constructor(
    public readonly path: string,
    public readonly redirectTo: string,
  ) {}

  public static create(instruction: IRedirectInstruction): RedirectInstruction {
    if (instruction instanceof RedirectInstruction) {
      return instruction;
    }

    return new RedirectInstruction(instruction.path, instruction.redirectTo);
  }

  public equals(other: RedirectInstruction): boolean {
    return this.path === other.path && this.redirectTo === other.redirectTo;
  }

  public toUrlComponent(): string {
    return this.path;
  }

  public toString(): string {
    return `RI(path:'${this.path}',redirectTo:'${this.redirectTo}')`;
  }
}

/**
 * Associate the object with an id so it can be stored in history as a serialized url segment.
 *
 * WARNING: As the implementation is right now, this is a memory leak disaster.
 * This is really a placeholder implementation at the moment and should NOT be used / advertised for production until a leak-free solution is made.
 */
const getObjectId = (function () {
  let lastId = 0;
  const objectIdMap = new Map<object, number>();

  return function (obj: object): number {
    let id = objectIdMap.get(obj);
    if (id === void 0) {
      objectIdMap.set(obj, id = ++lastId);
    }
    return id;
  };
})();

export class ViewportInstructionTree {
  public constructor(
    public readonly options: NavigationOptions,
    public readonly isAbsolute: boolean,
    public readonly children: ViewportInstruction[],
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
  ) {}

  public static create(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options?: INavigationOptions): ViewportInstructionTree {
    const $options = NavigationOptions.create({ ...options });

    if (instructionOrInstructions instanceof ViewportInstructionTree) {
      return new ViewportInstructionTree(
        $options,
        instructionOrInstructions.isAbsolute,
        instructionOrInstructions.children.map(x => ViewportInstruction.create(x, $options.context)),
        instructionOrInstructions.queryParams,
        instructionOrInstructions.fragment,
      );
    }

    if (instructionOrInstructions instanceof Array) {
      return new ViewportInstructionTree(
        $options,
        false,
        instructionOrInstructions.map(x => ViewportInstruction.create(x, $options.context)),
        emptyQuery,
        null,
      );
    }

    if (typeof instructionOrInstructions === 'string') {
      const expr = RouteExpression.parse(instructionOrInstructions, $options.useUrlFragmentHash);
      return expr.toInstructionTree($options);
    }

    return new ViewportInstructionTree(
      $options,
      false,
      [ViewportInstruction.create(instructionOrInstructions, $options.context)],
      emptyQuery,
      null,
    );
  }

  public equals(other: ViewportInstructionTree): boolean {
    const thisChildren = this.children;
    const otherChildren = other.children;
    if (thisChildren.length !== otherChildren.length) {
      return false;
    }

    for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
      if (!thisChildren[i].equals(otherChildren[i])) {
        return false;
      }
    }

    return true;
  }

  public toUrl(useUrlFragmentHash: boolean = false): string {
    let pathname: string;
    let hash: string;
    if (useUrlFragmentHash) {
      pathname = '';
      hash = `#${this.toPath()}`;
    } else {
      pathname = this.toPath();
      hash = this.fragment ?? '';
    }

    let search = this.queryParams.toString();
    search = search === '' ? '' : `?${search}`;

    const url = `${pathname}${hash}${search}`;
    return url;
  }

  public toPath(): string {
    const path = this.children.map(x => x.toUrlComponent()).join('+');
    return path;
  }

  public toString(): string {
    return `[${this.children.map(String).join(',')}]`;
  }
}

export const enum NavigationInstructionType {
  string,
  ViewportInstruction,
  CustomElementDefinition,
  Promise,
  IRouteViewModel,
}
export interface ITypedNavigationInstruction<
  TInstruction extends NavigationInstruction,
  TType extends NavigationInstructionType
> {
  readonly type: TType;
  readonly value: TInstruction;
  equals(other: ITypedNavigationInstruction_T): boolean;
  toUrlComponent(): string;
  clone(): this;
}
export interface ITypedNavigationInstruction_string extends ITypedNavigationInstruction<string, NavigationInstructionType.string> {}
export interface ITypedNavigationInstruction_ViewportInstruction extends ITypedNavigationInstruction<ViewportInstruction, NavigationInstructionType.ViewportInstruction> {}
export interface ITypedNavigationInstruction_CustomElementDefinition extends ITypedNavigationInstruction<CustomElementDefinition, NavigationInstructionType.CustomElementDefinition> {}
export interface ITypedNavigationInstruction_Promise extends ITypedNavigationInstruction<Promise<IModule>, NavigationInstructionType.Promise> {}
export interface ITypedNavigationInstruction_IRouteViewModel extends ITypedNavigationInstruction<IRouteViewModel, NavigationInstructionType.IRouteViewModel> {}

export type ITypedNavigationInstruction_T = (
  ITypedNavigationInstruction_Component |
  ITypedNavigationInstruction_ViewportInstruction
);

export type ITypedNavigationInstruction_Component = (
  ITypedNavigationInstruction_ResolvedComponent |
  ITypedNavigationInstruction_Promise
);

export type ITypedNavigationInstruction_ResolvedComponent = (
  ITypedNavigationInstruction_string |
  ITypedNavigationInstruction_CustomElementDefinition |
  ITypedNavigationInstruction_IRouteViewModel
);

export class TypedNavigationInstruction<TInstruction extends NavigationInstruction, TType extends NavigationInstructionType> implements ITypedNavigationInstruction<TInstruction, TType> {
  private constructor(
    public readonly type: TType,
    public readonly value: TInstruction,
  ) {}

  public static create(instruction: string): ITypedNavigationInstruction_string;
  public static create(instruction: IViewportInstruction): ITypedNavigationInstruction_ViewportInstruction;
  public static create(instruction: RouteType | PartialCustomElementDefinition): ITypedNavigationInstruction_CustomElementDefinition;
  public static create(instruction: Promise<IModule>): ITypedNavigationInstruction_Promise;
  public static create(instruction: IRouteViewModel): ITypedNavigationInstruction_IRouteViewModel;
  public static create(instruction: Exclude<NavigationInstruction, IViewportInstruction>): Exclude<ITypedNavigationInstruction_T, ITypedNavigationInstruction_ViewportInstruction>;
  public static create(instruction: NavigationInstruction): ITypedNavigationInstruction_T;
  public static create(instruction: NavigationInstruction): ITypedNavigationInstruction_T {
    if (instruction instanceof TypedNavigationInstruction) {
      return instruction;
    }

    if (typeof instruction === 'string') return new TypedNavigationInstruction(NavigationInstructionType.string, instruction);
    // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
    if (!isObject(instruction)) expectType('function/class or object', '', instruction);
    if (typeof instruction === 'function') {
      if (CustomElement.isType(instruction as Constructable)) {
        // This is the class itself
        // CustomElement.getDefinition will throw if the type is not a custom element
        const definition = CustomElement.getDefinition(instruction as Constructable);
        return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, definition);
      } else {
        return TypedNavigationInstruction.create((instruction as () => NavigationInstruction)());
      }
    }
    if (instruction instanceof Promise) return new TypedNavigationInstruction(NavigationInstructionType.Promise, instruction);
    if (isPartialViewportInstruction(instruction)) {
      const viewportInstruction = ViewportInstruction.create(instruction);
      return new TypedNavigationInstruction(NavigationInstructionType.ViewportInstruction, viewportInstruction);
    }
    if (isCustomElementViewModel(instruction)) return new TypedNavigationInstruction(NavigationInstructionType.IRouteViewModel, instruction);
    // We might have gotten a complete definition. In that case use it as-is.
    if (instruction instanceof CustomElementDefinition) return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, instruction);
    if (isPartialCustomElementDefinition(instruction)) {
      // TODO(sayan): create the instruction by looking up the route configuration/definition from the given type in the partial element definition
      // If we just got a partial definition, define a new anonymous class
      const Type = CustomElement.define(instruction);
      const definition = CustomElement.getDefinition(Type);
      return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, definition);
    }
    throw new Error(`Invalid component ${tryStringify(instruction)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
  }

  public equals(this: ITypedNavigationInstruction_T, other: ITypedNavigationInstruction_T): boolean {
    switch (this.type) {
      case NavigationInstructionType.CustomElementDefinition:
      case NavigationInstructionType.IRouteViewModel:
      case NavigationInstructionType.Promise:
      case NavigationInstructionType.string:
        return this.type === other.type && this.value === other.value;
      case NavigationInstructionType.ViewportInstruction:
        return this.type === other.type && this.value.equals(other.value);
    }
  }

  public clone(): this {
    return new TypedNavigationInstruction(
      this.type,
      this.value
    ) as this;
  }

  public toUrlComponent(this: ITypedNavigationInstruction_T): string {
    switch (this.type) {
      case NavigationInstructionType.CustomElementDefinition:
        return this.value.name;
      case NavigationInstructionType.IRouteViewModel:
      case NavigationInstructionType.Promise:
        return `au$obj${getObjectId(this.value)}`;
      case NavigationInstructionType.ViewportInstruction:
        return this.value.toUrlComponent();
      case NavigationInstructionType.string:
        return this.value;
    }
  }

  public toString(this: ITypedNavigationInstruction_T): string {
    switch (this.type) {
      case NavigationInstructionType.CustomElementDefinition:
        return `CEDef(name:'${this.value.name}')`;
      case NavigationInstructionType.Promise:
        return `Promise`;
      case NavigationInstructionType.IRouteViewModel:
        return `VM(name:'${CustomElement.getDefinition(this.value.constructor as Constructable).name}')`;
      case NavigationInstructionType.ViewportInstruction:
        return this.value.toString();
      case NavigationInstructionType.string:
        return `'${this.value}'`;
    }
  }
}
