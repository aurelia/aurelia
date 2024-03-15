import { IDisposable, IIndexable, resolve } from '@aurelia/kernel';
import {
  ICustomAttributeViewModel,
  INode,
  CustomElement,
  defineAttribute,
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { IRouteContext } from '../route-context';
import { NavigationInstruction, Params, ViewportInstructionTree } from '../instructions';
import { IRouterEvents } from '../router-events';
import { ILocationManager } from '../location-manager';
import { bmFromView, bmToView } from '../util';

export class LoadCustomAttribute implements ICustomAttributeViewModel {

  /** @internal */ private readonly _el: INode<HTMLElement> = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);
  /** @internal */ private readonly _router: IRouter = resolve(IRouter);
  /** @internal */ private readonly _ctx: IRouteContext = resolve(IRouteContext);
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

  /** @internal */ private _href: string | null = null;
  /** @internal */ private _instructions: ViewportInstructionTree | null = null;
  /** @internal */ private _navigationEndListener: IDisposable | null = null;
  /** @internal */ private readonly _isEnabled: boolean;
  /** @internal */ private readonly _activeClass: string | null;

  public constructor() {
    const el = this._el;
    // Ensure the element is not explicitly marked as external.
    this._isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    this._activeClass = this._router.options.activeClass;
  }

  public binding(): void {
    if (this._isEnabled) {
      this._el.addEventListener('click', this.onClick as EventListener);
    }
    this.valueChanged();
    this._navigationEndListener = this._events.subscribe('au:router:navigation-end', _e => {
      const active = this.active = this._instructions !== null && this._router.isActive(this._instructions, this.context!);
      const activeClass = this._activeClass;
      if (activeClass === null) return;
      this._el.classList.toggle(activeClass, active);
    });
  }

  public attaching(): void | Promise<void> {
    const ctx = this.context;
    const promise = ctx!.allResolved;
    if (promise !== null) {
      return promise.then(() => {
        this.valueChanged();
      });
    }
  }

  public unbinding(): void {
    if (this._isEnabled) {
      this._el.removeEventListener('click', this.onClick);
    }
    this._navigationEndListener!.dispose();
  }

  public valueChanged(): void {
    const router = this._router;
    const options = router.options;
    const component = this.route as NavigationInstruction;
    // this allows binding context to null for navigation from root; unbound vs explicit null binding
    let ctx = this.context;
    if (ctx === void 0) {
      ctx = this.context = this._ctx;
    } else if (ctx === null) {
      ctx = this.context = this._ctx.root;
    }
    if (component != null && ctx.allResolved === null) {
      const params = this.params;
      const instructions = this._instructions = router.createViewportInstructions(
        typeof params === 'object' && params !== null
          ? { component, params }
          : component,
        { context: ctx });
      this._href = instructions.toUrl(false, options._urlParser);
    } else {
      this._instructions = null;
      this._href = null;
    }

    const controller = CustomElement.for(this._el, { optional: true });
    if (controller !== null) {
      (controller.viewModel as IIndexable)[this.attribute] = this._instructions;
    } else {
      if (this._href === null) {
        this._el.removeAttribute(this.attribute);
      } else {
        const value = options.useUrlFragmentHash ? this._href : this._locationMgr.addBaseHref(this._href);
        this._el.setAttribute(this.attribute, value);
      }
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
    void this._router.load(this._instructions, { context: this.context });
  };
}
defineAttribute({
  name: 'load',
  bindables: {
    route: { mode: bmToView, primary: true, callback: 'valueChanged' },
    params: { mode: bmToView, callback: 'valueChanged' },
    attribute: { mode: bmToView },
    active: { mode: bmFromView },
    context: { mode: bmToView, callback: 'valueChanged' }
  }
}, LoadCustomAttribute);
