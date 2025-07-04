import {
  Constructable,
  emptyObject,
  IModule,
  isArrayIndex,
  isObjectOrFunction,
  onResolve,
  onResolveAll,
  Writable,
} from '@aurelia/kernel';
import {
  ICustomElementViewModel,
  ICustomElementController,
  PartialCustomElementDefinition,
  isCustomElementViewModel,
  CustomElement,
  CustomElementDefinition
} from '@aurelia/runtime-html';

import { IRouteViewModel } from './component-agent';
import { RouteType } from './route';
import { type $RecognizedRoute, IRouteContext, RouteContext } from './route-context';
import { expectType, isPartialCustomElementDefinition, isPartialViewportInstruction, shallowEquals } from './validation';
import { INavigationOptions, NavigationOptions, type RouterOptions } from './options';
import { RouteExpression } from './route-expression';
import { mergeURLSearchParams, tryStringify } from './util';
import { Events, getMessage } from './events';
import { State } from './viewport-agent';
import { IUrlParser } from './url-parser';
import { RouteNode } from './route-tree';
import { RecognizedRoute } from '@aurelia/route-recognizer';

export const defaultViewportName = 'default';
export type RouteContextLike = IRouteContext | ICustomElementViewModel | ICustomElementController | HTMLElement;

/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportInstruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = string | IViewportInstruction | RouteableComponent | NavigationStrategy;

/**
 * A component type, instance of definition that can be navigated to:
 * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
 * - `Promise<IModule>`: a lazy loaded module, e.g. the return value of a dynamic import expression pointing to a file with a routeable component as the default export or the first named export.
 * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
 * - `IRouteViewModel`: an existing component instance.
 */
export type RouteableComponent = RouteType | (() => RouteType) | Promise<IModule> | CustomElementDefinition | IRouteViewModel;

export type Params = { [key: string]: string | undefined };

export type IExtendedViewportInstruction = IViewportInstruction & { readonly open?: number; readonly close?: number };

export interface IViewportInstruction {
  /**
   * The component to load.
   *
   * - `string`: A string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally).
   * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
   * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
   * - `IRouteViewModel`: an existing component instance.
   *
   */
  readonly component: string | RouteableComponent;
  /**
   * The name of the viewport this component should be loaded into.
   */
  readonly viewport?: string | null;
  /**
   * The parameters to pass into the component.
   *
   * Note that this is only important till a {@link $RecognizedRoute | recognized route} is created from the `component`.
   * After the recognized route is created, the 'recognized' parameters are included in that, and that's what is used when invoking the hook functions.
   * Thus, when creating a viewport-instruction directly with a recognized route, the parameters can be ignored.
   */
  readonly params?: Params | null;
  /**
   * The child routes to load underneath the context of this instruction's component.
   */
  readonly children?: readonly NavigationInstruction[];
  /**
   * Normally, when the recognized route is null, in the process of creating a route node, it will be attempted to recognize a configured route for the given `component`.
   * Therefore, when a recognized route is provided when creating the `ViewportInstruction`, the process of recognizing the `component` can be completely skipped.
   */
  readonly recognizedRoute: $RecognizedRoute | null;
}

export class ViewportInstruction<TComponent extends ITypedNavigationInstruction_T = ITypedNavigationInstruction_Component> implements IExtendedViewportInstruction {
  private constructor(
    public readonly open: number,
    public readonly close: number,
    public readonly recognizedRoute: $RecognizedRoute | null,
    public readonly component: TComponent,
    public readonly viewport: string | null,
    public readonly params: Readonly<Params> | null,
    public readonly children: ViewportInstruction[],
  ) { }

  public static create(instruction: NavigationInstruction | IExtendedViewportInstruction): ViewportInstruction {
    if (instruction instanceof ViewportInstruction) return instruction as ViewportInstruction; // eslint is being really weird here

    if (isPartialViewportInstruction(instruction)) {
      const component = TypedNavigationInstruction.create(instruction.component);
      const children = instruction.children?.map(ViewportInstruction.create) ?? [];

      return new ViewportInstruction(
        instruction.open ?? 0,
        instruction.close ?? 0,
        instruction.recognizedRoute ?? null,
        component as ITypedNavigationInstruction_Component,
        instruction.viewport ?? null,
        Object.freeze(instruction.params ?? null),
        children,
      );
    }

    const typedInstruction = TypedNavigationInstruction.create(instruction) as ITypedNavigationInstruction_Component;
    return new ViewportInstruction(0, 0, null, typedInstruction, null, null, []);
  }

  public contains(other: ViewportInstruction): boolean {
    const thisChildren = this.children;
    const otherChildren = other.children;
    if (thisChildren.length < otherChildren.length) {
      return false;
    }

    if (!this.component.equals(other.component)) return false;
    // if either of the viewports are not set then ignore
    const vp = this.viewport ?? null;
    const otherVp = other.viewport ?? null;
    if (vp !== null && otherVp !== null && vp !== otherVp) return false;

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

  /** @internal */
  public _clone(): this {
    return new ViewportInstruction(
      this.open,
      this.close,
      this.recognizedRoute,
      this.component._clone(),
      this.viewport,
      this.params,
      [...this.children],
    ) as this;
  }

  public toUrlComponent(recursive: boolean = true): string {
    const component = this.component.toUrlComponent();
    const vp = this.viewport;
    const viewport = component.length === 0 || vp === null || vp.length === 0 || vp === defaultViewportName ? '' : `@${vp}`;
    const thisPart = `${'('.repeat(this.open)}${component}${stringifyParams(this.params)}${viewport}${')'.repeat(this.close)}`;
    const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
    return thisPart.length > 0
      ? childPart.length > 0
        ? `${thisPart}/${childPart}`
        : thisPart
      : childPart;
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    const component = `c:${this.component}`;
    const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
    const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
    const props = [component, viewport, children].filter(Boolean).join(',');
    return `VPI(${props})`;
  }
}

/**
 * Note on the parenthesized parameters:
 * We will land on this branch if and only if the component cannot be eagerly recognized (in the RouteContext#generateViewportInstruction) AND the parameters are also provided.
 * When the routes are eagerly recognized, then there is no parameters left at this point and everything is already packed in the generated path as well as in the recognized route.
 * Thus, in normal scenarios the users will never land here.
 *
 * Whenever, they are using a hand composed (string) path, then in that case there is no question of having parameters at this point, rather the given path is recognized in the createAndAppendNodes.
 * It might be a rare edge case where users provide half the parameters in the string path and half as form of parameters; example: `load="route: r1/id1; params.bind: {id2}"`.
 * We might not want to officially support such cases.
 *
 * However, as the route recognition is inherently lazy (think about child routes, whose routing configuration are not resolved till a child routing context is created, or
 * the usage of instance level getRouteConfig), the component cannot be recognized fully eagerly. Thus, it is difficult at this point to correctly handle parameters as defined by the path templates defined for the component.
 * This artifact is kept here for the purpose of fallback.
 *
 * We can think about a stricter mode where we throw error if any params remains unconsumed at this point.
 * Or simply ignore the params while creating the URL. However, that does not feel right at all.
 */
function stringifyParams(params: Readonly<Params> | null): string {
  if (params === null) return '';
  const keys = Object.keys(params);
  const numKeys = keys.length;
  if (numKeys === 0) return '';
  const values = Array<string>(numKeys);
  const indexKeys: number[] = [];
  const namedKeys: string[] = [];
  for (const key of keys) {
    if (isArrayIndex(key)) {
      indexKeys.push(Number(key));
    } else {
      namedKeys.push(key);
    }
  }

  for (let i = 0; i < numKeys; ++i) {
    const indexKeyIdx = indexKeys.indexOf(i);
    if (indexKeyIdx > -1) {
      values[i] = params[i] as string;
      indexKeys.splice(indexKeyIdx, 1);
    } else {
      const namedKey = namedKeys.shift()!;
      values[i] = `${namedKey}=${params[namedKey]}`;
    }
  }
  return `(${values.join(',')})`;
}

export class ViewportInstructionTree {
  public constructor(
    public readonly options: NavigationOptions,
    public readonly isAbsolute: boolean,
    public readonly children: ViewportInstruction[],
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
  ) {
    Object.freeze(queryParams);
  }

  public static create(
    instructionOrInstructions: NavigationInstruction | NavigationInstruction[],
    routerOptions: RouterOptions,
    options: INavigationOptions | NavigationOptions | null,
    rootCtx: IRouteContext | null,
  ): ViewportInstructionTree;
  public static create(
    instructionOrInstructions: NavigationInstruction | NavigationInstruction[],
    routerOptions: RouterOptions,
    options: INavigationOptions | NavigationOptions | null,
    rootCtx: IRouteContext | null,
    traverseChildren: true,
  ): ViewportInstructionTree | Promise<ViewportInstructionTree>;
  public static create(
    instructionOrInstructions: NavigationInstruction | NavigationInstruction[],
    routerOptions: RouterOptions,
    options: INavigationOptions | NavigationOptions | null,
    rootCtx: IRouteContext | null,
    traverseChildren?: boolean,
  ): ViewportInstructionTree | Promise<ViewportInstructionTree> {
    options = options instanceof NavigationOptions ? options : NavigationOptions.create(routerOptions, options ?? emptyObject);

    let context = options.context as RouteContext;
    if (!(context instanceof RouteContext) && rootCtx != null) {
      context = (options as Writable<NavigationOptions>).context = RouteContext.resolve(rootCtx, context);
    }
    const hasContext = context != null;

    if (instructionOrInstructions instanceof Array) {
      // This whole process is synchronous, if traverseChildren is not true.
      const len = instructionOrInstructions.length;
      const children = new Array(len);
      const query = new URLSearchParams(options.queryParams ?? emptyObject);
      const promises: (Promise<void> | void)[] = new Array(len);
      for (let i = 0; i < len; i++) {
        const instruction = instructionOrInstructions[i];
        promises[i] = onResolve(
          hasContext ? context.routeConfigContext._generateViewportInstruction(instruction, traverseChildren as true) : null,
          eagerVi => {
            if (eagerVi !== null) {
              children[i] = eagerVi.vi;
              mergeURLSearchParams(query, eagerVi.query, false);
            } else {
              children[i] = ViewportInstruction.create(instruction);
            }
          }
        );
      }
      return onResolve(onResolveAll(...promises), () => new ViewportInstructionTree(options as NavigationOptions, false, children, query, (options as NavigationOptions).fragment));
    }

    if (typeof instructionOrInstructions === 'string') {
      const expr = RouteExpression.parse(routerOptions._urlParser.parse(instructionOrInstructions));
      return expr.toInstructionTree(options as NavigationOptions);
    }

    return onResolve(
      hasContext
        ? context.routeConfigContext._generateViewportInstruction(
          isPartialViewportInstruction(instructionOrInstructions)
            ? { ...instructionOrInstructions, params: instructionOrInstructions.params ?? emptyObject }
            : { component: instructionOrInstructions, params: emptyObject },
          traverseChildren as true
        )
        : null,
      eagerVi => {
        const query = new URLSearchParams(options.queryParams ?? emptyObject);
        return eagerVi !== null
          ? new ViewportInstructionTree(
            options as NavigationOptions,
            false,
            [eagerVi.vi],
            mergeURLSearchParams(query, eagerVi.query, false),
            (options as NavigationOptions).fragment,
          )
          : new ViewportInstructionTree(
            options as NavigationOptions,
            false,
            [ViewportInstruction.create(instructionOrInstructions)],
            query,
            (options as NavigationOptions).fragment,
          );
      }
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

  public toUrl(isFinalInstruction: boolean, parser: IUrlParser): string {
    let parentPath = '';

    if (!isFinalInstruction) {
      const parentPaths: string[] = [];
      let ctx: IRouteContext | null = this.options.context as IRouteContext | null;
      if (ctx != null && !(ctx instanceof RouteContext)) throw new Error('Invalid operation; incompatible navigation context.');

      while (ctx != null && !ctx.routeConfigContext.isRoot) {
        const vpa = ctx.vpa;
        const node = vpa._currState === State.currIsActive ? vpa._currNode : vpa._nextNode;
        if (node == null) throw new Error('Invalid operation; nodes of the viewport agent are not set.');

        parentPaths.splice(0, 0, node.instruction!.toUrlComponent());
        ctx = ctx.parent;
      }
      if (parentPaths[0] === '') {
        parentPaths.splice(0, 1);
      }
      parentPath = parentPaths.join('/');
    }

    const currentPath = this.toPath();
    return parser.stringify(
      parentPath.length > 0 ? `${parentPath}/${currentPath}` : currentPath,
      this.queryParams,
      this.fragment
    );
  }

  public toPath(): string {
    return this.children.map(x => x.toUrlComponent()).join('+');
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    return `[${this.children.map(String).join(',')}]`;
  }
}

type NavigationStrategyComponent = string | RouteType | Promise<IModule> | CustomElementDefinition;
export class NavigationStrategy {
  public constructor(
    /** @internal */ public readonly getComponent: (viewportInstruction: IViewportInstruction, ctx: IRouteContext, node: RouteNode, route: RecognizedRoute<unknown>) => NavigationStrategyComponent,
  ) { }
}

_START_CONST_ENUM();
/**
 * @internal
 */
export const enum NavigationInstructionType {
  string,
  ViewportInstruction,
  CustomElementDefinition,
  Promise,
  IRouteViewModel,
  NavigationStrategy,
}
_END_CONST_ENUM();

export interface ITypedNavigationInstruction<
  TInstruction extends NavigationInstruction,
  TType extends NavigationInstructionType
> {
  readonly type: TType;
  readonly value: TInstruction;
  equals(other: ITypedNavigationInstruction_T): boolean;
  toUrlComponent(): string;
  _clone(): this;
}
export interface ITypedNavigationInstruction_string extends ITypedNavigationInstruction<string, NavigationInstructionType.string> { }
export interface ITypedNavigationInstruction_ViewportInstruction extends ITypedNavigationInstruction<ViewportInstruction, NavigationInstructionType.ViewportInstruction> { }
export interface ITypedNavigationInstruction_CustomElementDefinition extends ITypedNavigationInstruction<CustomElementDefinition, NavigationInstructionType.CustomElementDefinition> { }
export interface ITypedNavigationInstruction_Promise extends ITypedNavigationInstruction<Promise<IModule>, NavigationInstructionType.Promise> { }
export interface ITypedNavigationInstruction_IRouteViewModel extends ITypedNavigationInstruction<IRouteViewModel, NavigationInstructionType.IRouteViewModel> { }
export interface ITypedNavigationInstruction_NavigationStrategy extends ITypedNavigationInstruction<NavigationStrategy, NavigationInstructionType.NavigationStrategy> { }

export type ITypedNavigationInstruction_T = (
  ITypedNavigationInstruction_Component |
  ITypedNavigationInstruction_ViewportInstruction |
  ITypedNavigationInstruction_NavigationStrategy
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
  ) { }

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
    if (!isObjectOrFunction(instruction)) expectType('function/class or object', '', instruction);
    if (instruction instanceof NavigationStrategy) return new TypedNavigationInstruction(NavigationInstructionType.NavigationStrategy, instruction);
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

    // If we have a partial definition, create a complete definition from it.
    // Use-case:
    // import * as component from './conventional-html-only-component.html';
    // @route({
    //   routes: [
    //     {
    //       path: 'path',
    //       component,
    //     },
    //   ],
    // })
    if (isPartialCustomElementDefinition(instruction)) {
      const definition = CustomElementDefinition.create(instruction);
      CustomElement.define(definition);
      return new TypedNavigationInstruction(NavigationInstructionType.CustomElementDefinition, definition);
    }

    throw new Error(getMessage(Events.instrInvalid, tryStringify(instruction)));
  }

  public equals(this: ITypedNavigationInstruction_T, other: ITypedNavigationInstruction_T): boolean {
    switch (this.type) {
      case NavigationInstructionType.NavigationStrategy:
      case NavigationInstructionType.CustomElementDefinition:
      case NavigationInstructionType.IRouteViewModel:
      case NavigationInstructionType.Promise:
      case NavigationInstructionType.string:
        return this.type === other.type && this.value === other.value;
      case NavigationInstructionType.ViewportInstruction:
        return this.type === other.type && this.value.equals(other.value);
    }
  }

  /** @internal */
  public _clone(): this {
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
      case NavigationInstructionType.NavigationStrategy:
        throw new Error(getMessage(Events.instrInvalidUrlComponentOperation, this.type));
      case NavigationInstructionType.ViewportInstruction:
        return this.value.toUrlComponent();
      case NavigationInstructionType.string:
        return this.value;
    }
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(this: ITypedNavigationInstruction_T): string {
    switch (this.type) {
      case NavigationInstructionType.CustomElementDefinition:
        return `CEDef(name:'${this.value.name}')`;
      case NavigationInstructionType.NavigationStrategy:
        return `NS`;
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
