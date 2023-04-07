import { IDisposable, IIndexable } from '@aurelia/kernel';
import {
  BindingMode,
  customAttribute,
  bindable,
  ICustomAttributeViewModel,
  INode,
  CustomElement,
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { IRouteContext } from '../route-context';
import { NavigationInstruction, Params, ViewportInstructionTree } from '../instructions';
import { IRouterEvents } from '../router-events';
import { ILocationManager } from '../location-manager';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
  public route: unknown;

  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public params?: Params;

  @bindable({ mode: BindingMode.toView })
  public attribute: string = 'href';

  @bindable({ mode: BindingMode.fromView })
  public active: boolean = false;

  /**
   * When not bound, it defaults to the injected instance of the router context.
   */
  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public context?: IRouteContext;

  private href: string | null = null;
  private instructions: ViewportInstructionTree | null = null;
  private navigationEndListener: IDisposable | null = null;
  private readonly isEnabled: boolean;
  private readonly activeClass: string | null;

  public constructor(
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @IRouterEvents private readonly events: IRouterEvents,
    @IRouteContext private readonly ctx: IRouteContext,
    @ILocationManager private readonly locationMgr: ILocationManager,
  ) {
    // Ensure the element is not explicitly marked as external.
    this.isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    this.activeClass = router.options.activeClass;
  }

  public binding(): void {
    if (this.isEnabled) {
      this.el.addEventListener('click', this.onClick as EventListener);
    }
    this.valueChanged();
    this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
      this.valueChanged();
      const active = this.active = this.instructions !== null && this.router.isActive(this.instructions, this.context!);
      const activeClass = this.activeClass;
      if (activeClass === null) return;
      if (active) {
        this.el.classList.add(activeClass);
      } else {
        this.el.classList.remove(activeClass);
      }
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
    if (this.isEnabled) {
      this.el.removeEventListener('click', this.onClick);
    }
    this.navigationEndListener!.dispose();
  }

  public valueChanged(): void {
    const router = this.router;
    const useHash = router.options.useUrlFragmentHash;
    const component = this.route as NavigationInstruction;
    // this allows binding context to null for navigation from root; unbound vs explicit null binding
    let ctx = this.context;
    if (ctx === void 0) {
      ctx = this.context = this.ctx;
    } else if (ctx === null) {
      ctx = this.context = this.ctx.root;
    }
    if (component != null && ctx.allResolved === null) {
      const params = this.params;
      const instructions = this.instructions = router.createViewportInstructions(
        typeof params === 'object' && params !== null
          ? { component, params }
          : component,
        { context: ctx });
      this.href = instructions.toUrl(useHash);
    } else {
      this.instructions = null;
      this.href = null;
    }

    const controller = CustomElement.for(this.el, { optional: true });
    if (controller !== null) {
      (controller.viewModel as IIndexable)[this.attribute] = this.instructions;
    } else {
      if (this.href === null) {
        this.el.removeAttribute(this.attribute);
      } else {
        const value = useHash ? this.href : this.locationMgr.addBaseHref(this.href);
        this.el.setAttribute(this.attribute, value);
      }
    }
  }

  private readonly onClick = (e: MouseEvent): void => {
    if (this.instructions === null) {
      return;
    }

    // Ensure this is an ordinary left-button click.
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
      return;
    }

    e.preventDefault();
    // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
    void this.router.load(this.instructions, { context: this.context });
  };
}
