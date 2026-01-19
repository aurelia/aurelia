import { DI } from '@aurelia/kernel';
import { IRouteViewModel } from './component-agent';
import { IViewportInstruction, NavigationInstruction } from './instructions';
import { INavigationOptions } from './options';
import { RouteType } from './route';
import { IRouteContext } from './route-context';
import { IRouter } from './router';

export const IContextRouter = /*@__PURE__*/ DI.createInterface<IContextRouter>('IContextRouter');
export interface IContextRouter extends ContextRouter {}

export class ContextRouter {
  public constructor(
    /** @internal */ private readonly _router: IRouter,
    /** @internal */ private readonly _context: IRouteContext,
  ) { }

  /**
   * Loads the provided path.
   *
   * Examples:
   *
   * ```ts
   * // Load the route 'product-detail', as a child of the current component, with child route '37'.
   * router.load('product-detail/37', { context: this });
   * ```
   */
  public load(path: string, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided paths as siblings.
   *
   * Examples:
   *
   * ```ts
   * router.load(['category/50/product/20', 'widget/30']);
   * ```
   */
  public load(paths: readonly string[], options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component type. Must be a custom element.
   *
   * Examples:
   *
   * ```ts
   * router.load(ProductList);
   * router.load(CustomElement.define({ name: 'greeter', template: 'Hello!' }));
   * ```
   */
  public load(componentType: RouteType, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component types. Must be custom elements.
   *
   * Examples:
   *
   * ```ts
   * router.load([MemberList, OrganizationList]);
   * ```
   */
  public load(componentTypes: readonly RouteType[], options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component instance.
   *
   * Examples:
   *
   * ```ts
   * // Given an already defined custom element named Greeter
   * const greeter = new Greeter();
   * Controller.$el(container, greeter, host);
   * router.load(greeter);
   * ```
   */
  public load(componentInstance: IRouteViewModel, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided ViewportInstruction, with component specified in any of the ways as described
   * in the other method overloads, and optional additional properties.
   *
   * Examples:
   *
   * ```ts
   * router.load({ component: 'product-detail', parameters: { id: 37 } })
   * router.load({ component: ProductDetail, parameters: { id: 37 } })
   * router.load({ component: 'category', children: ['product(id=20)'] })
   * router.load({ component: 'category', children: [{ component: 'product', parameters: { id: 20 } }] })
   * ```
   */
  public load(viewportInstruction: IViewportInstruction, options?: INavigationOptions): boolean | Promise<boolean>;
  public load(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): boolean | Promise<boolean>;
  public load(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): boolean | Promise<boolean> {
    return this._router.load(instructionOrInstructions, { context: this._context, ...options });
  }

  /**
   * Generate a path from the provided instructions.
   *
   * @param instructionOrInstructions - The navigation instruction(s) to generate the path for.
   * @param context - The context to use for relative navigation. If not provided, the root context is used.
   */
  public generatePath(instructionOrInstructions: NavigationInstruction | NavigationInstruction[]): string | Promise<string> {
    return this._router.generatePath(instructionOrInstructions, this._context);
  }
}
