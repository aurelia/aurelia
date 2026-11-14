import { IDisposable, IIndexable, isPromise, resolve } from '@aurelia/kernel';
import {
  ICustomAttributeViewModel,
  INode,
  CustomElement,
  CustomAttribute,
} from '@aurelia/runtime-html';

import { IRouteContext } from '../route-context';
import { NavigationInstruction, Params, ViewportInstructionTree } from '../instructions';
import { IRouterEvents } from '../router-events';
import { ILocationManager } from '../location-manager';
import { bmFromView, bmToView } from '../util';
import { IContextRouter } from '../context-router';

export class LoadCustomAttribute implements ICustomAttributeViewModel {

  /** @internal */ private readonly _el: INode<HTMLElement> = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);
  /** @internal */ private _ctxRouter: IContextRouter = resolve(IContextRouter);
  /** @internal */ private readonly _events: IRouterEvents = resolve(IRouterEvents);
  /** @internal */ private readonly _locationMgr: ILocationManager = resolve(ILocationManager);

  public route: unknown;
  public params?: Params;
  public attribute: string = 'href';
  public active: boolean = false;

  /**
   * When not bound, it defaults to the injected instance of the router context.
   */
  public context?: IRouteContext;

  /** @internal */ private _instructions: ViewportInstructionTree | null = null;
  /** @internal */ private _pending: Promise<void> | undefined = void 0;
  /** @internal */ private _navigationEndListener: IDisposable | null = null;
  /** @internal */ private readonly _isEnabled: boolean;
  /** @internal */ private readonly _activeClass: string | null;

  public constructor() {
    const el = this._el;
    // Ensure the element is not explicitly marked as external.
    this._isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    this._activeClass = this._ctxRouter._options.activeClass;
  }

  public binding(): void | Promise<void> {
    if (this._isEnabled) {
      this._el.addEventListener('click', this.onClick as EventListener);
    }
    this._navigationEndListener = this._events.subscribe('au:router:navigation-end', () => this._updateActive());
    return this.valueChanged();
  }

  public attaching(): void | Promise<void> {
    const promise = this._ctxRouter._allResolved;
    if (promise !== null) {
      return promise.then(() => {
        return this.valueChanged();
      });
    }
    return this._pending;
  }

  public unbinding(): void {
    this._pending = void 0;
    if (this._isEnabled) {
      this._el.removeEventListener('click', this.onClick);
    }
    this._navigationEndListener!.dispose();
  }

  public valueChanged(): void | Promise<void> {
    this._pending = void 0;
    const component = this.route as NavigationInstruction;
    // this allows binding context to null for navigation from root; unbound vs explicit null binding
    const ctx = this.context;
    if (ctx === null) {
      this._ctxRouter = this._ctxRouter._copyWithRoot();
    } else if (ctx !== void 0 && !this._ctxRouter._isOfContext(ctx)) {
      this._ctxRouter = this._ctxRouter._copyWith(ctx);
    }
    let instructions: ViewportInstructionTree | Promise<ViewportInstructionTree> | null = null;
    if (component != null && this._ctxRouter._allResolved === null) {
      const params = this.params;
      instructions = this._ctxRouter.createViewportInstructions(
        typeof params === 'object' && params !== null
          ? { component, params }
          : component,
        null,
        null,
        false,
        true,
      );
    }

    if (isPromise(instructions)) {
      // An opaque factory must resolve before a type-bound link has a truthful href.
      // The promise also owns publication: a changed or unbound link retires it.
      this._updateInstructions(null);
      const pending = this._pending = instructions.then(
        resolved => {
          if (this._pending === pending) {
            this._pending = void 0;
            this._updateInstructions(resolved);
          }
        },
        error => {
          if (this._pending === pending) {
            this._pending = void 0;
            throw error;
          }
        },
      );
      return pending;
    }
    this._updateInstructions(instructions);
  }

  /** @internal */
  private _updateInstructions(instructions: ViewportInstructionTree | null): void {
    this._instructions = instructions;
    const href = instructions?.toUrl(false, this._ctxRouter._options._urlParser, true) ?? null;
    const hasHref = href !== null;
    // `toUrl` owns route serialization; the location manager owns the
    // deployment base. In hash mode the serialized value is application-rooted
    // (`/#/...`) but still not deployment-qualified. Materialize both modes
    // here so `load` and `href`, including native or modified-click activation,
    // target the same URL.
    const url = hasHref ? this._locationMgr.addBaseHref(href) : null;
    const controller = CustomElement.for(this._el, { optional: true });
    if (controller !== null) {
      (controller.viewModel as IIndexable)[this.attribute] = url;
    } else {
      if (!hasHref) {
        this._el.removeAttribute(this.attribute);
      } else {
        this._el.setAttribute(this.attribute, url!);
      }
    }
    // A mapping may finish after navigation-end, or be bound to an already active route.
    this._updateActive();
  }

  /** @internal */
  private _updateActive(): void {
    const active = this.active = this._instructions !== null && this._ctxRouter.isActive(this._instructions);
    if (this._activeClass !== null) {
      this._el.classList.toggle(this._activeClass, active);
    }
  }

  private readonly onClick = (e: MouseEvent): void => {
    if (this._instructions === null) {
      return;
    }

    // Ensure this is an ordinary left-button click.
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
      return;
    }

    e.preventDefault();
    // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
    void this._ctxRouter.load(this._instructions);
  };
}
CustomAttribute.define({
  name: 'load',
  defaultProperty: 'route',
  bindables: {
    route: { mode: bmToView, callback: 'valueChanged' },
    params: { mode: bmToView, callback: 'valueChanged' },
    attribute: { mode: bmToView },
    active: { mode: bmFromView },
    context: { mode: bmToView, callback: 'valueChanged' }
  }
}, LoadCustomAttribute);
