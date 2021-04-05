import { IDisposable, IIndexable } from '@aurelia/kernel';
import { customAttribute, bindable, BindingMode, ICustomAttributeViewModel, IEventDelegator, IEventTarget, INode, CustomElement } from '@aurelia/runtime-html';

import { IRouter } from '../router.js';
import { IRouteContext } from '../route-context.js';
import { NavigationInstruction, Params, ViewportInstructionTree } from '../instructions.js';
import { IRouterEvents } from '../router-events.js';
import { RouteDefinition } from '../route-definition.js';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
  public route: unknown;

  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public params: unknown;

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
    if (this.route !== null && this.route !== void 0 && this.ctx.allResolved === null) {
      const def = (this.ctx.childRoutes as RouteDefinition[]).find(x => x.id === this.route);
      if (def !== void 0) {
        // TODO(fkleuver): massive temporary hack. Will not work for siblings etc. Need to fix.
        const parentPath = this.ctx.node.computeAbsolutePath();
        // Note: This is very much preliminary just to fill the feature gap of v1's `generate`. It probably misses a few edge cases.
        // TODO(fkleuver): move this logic to RouteExpression and expose via public api, add tests etc
        let path = def.path[0];
        if (typeof this.params === 'object' && this.params !== null) {
          const keys = Object.keys(this.params);
          for (const key of keys) {
            const value = (this.params as Params)[key];
            if (value != null && String(value).length > 0) {
              path = path.replace(new RegExp(`[*:]${key}[?]?`), value);
            }
          }
        }
        // Remove leading and trailing optional param parts
        path = path.replace(/\/[*:][^/]+[?]/g, '').replace(/[*:][^/]+[?]\//g, '');
        if (parentPath) {
          if (path) {
            this.href = [parentPath, path].join('/');
          } else {
            this.href = parentPath;
          }
        } else {
          this.href = path;
        }
        this.instructions = this.router.createViewportInstructions(path, { context: this.ctx });
      } else {
        if (typeof this.params === 'object' && this.params !== null) {
          this.instructions = this.router.createViewportInstructions({ component: this.route as NavigationInstruction, params: this.params as Params }, { context: this.ctx });
        } else {
          this.instructions = this.router.createViewportInstructions(this.route as NavigationInstruction, { context: this.ctx });
        }
        this.href = this.instructions.toUrl();
      }
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
        const useHash = this.router.options.useUrlFragmentHash;
        this.el.setAttribute(this.attribute, useHash ? `#${this.href}` : this.href);
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
