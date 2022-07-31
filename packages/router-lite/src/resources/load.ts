import { IDisposable, IIndexable } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
import { customAttribute, bindable, ICustomAttributeViewModel, IEventDelegator, IEventTarget, INode, CustomElement } from '@aurelia/runtime-html';

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

  private href: string | null = null;
  private instructions: ViewportInstructionTree | null = null;
  private eventListener: IDisposable | null = null;
  private navigationEndListener: IDisposable | null = null;
  private readonly isEnabled: boolean;

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @IRouterEvents private readonly events: IRouterEvents,
    @IEventDelegator private readonly delegator: IEventDelegator,
    @IRouteContext private readonly ctx: IRouteContext,
    @ILocationManager private readonly locationMgr: ILocationManager,
  ) {
    // Ensure the element is not explicitly marked as external.
    this.isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
  }

  public binding(): void {
    if (this.isEnabled) {
      this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick as EventListener);
    }
    this.valueChanged();
    this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
      this.valueChanged();
      this.active = this.instructions !== null && this.router.isActive(this.instructions, this.ctx);
    });
  }

  public attaching(): void | Promise<void> {
    if (this.ctx.allResolved !== null) {
      return this.ctx.allResolved.then(() => {
        this.valueChanged();
      });
    }
  }

  public unbinding(): void {
    if (this.isEnabled) {
      this.eventListener!.dispose();
    }
    this.navigationEndListener!.dispose();
  }

  public valueChanged(): void {
    const router = this.router;
    const useHash = router.options.useUrlFragmentHash;
    const component = this.route as NavigationInstruction;
    if (component != null && this.ctx.allResolved === null) {
      const params = this.params;
      const instructions = this.instructions = router.createViewportInstructions(
        typeof params === 'object' && params !== null
          ? { component, params }
          : component,
        { context: this.ctx });
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
    void this.router.load(this.instructions, { context: this.ctx });
  };
}
