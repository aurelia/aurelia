import { IDisposable, IIndexable } from '@aurelia/kernel';
import { customAttribute, bindable, BindingMode, ICustomAttributeViewModel, IEventDelegator, IEventTarget, INode, CustomElement } from '@aurelia/runtime-html';

import { IRouter } from '../router.js';
import { IRouteContext } from '../route-context.js';
import { NavigationInstruction, Params, ViewportInstructionTree } from '../instructions.js';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
  public route: unknown;

  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public params: unknown;

  @bindable({ mode: BindingMode.toView })
  public attribute: string = 'href';

  private instructions: ViewportInstructionTree | null = null;
  private eventListener: IDisposable | null = null;
  private readonly isEnabled: boolean;

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
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
  }

  public unbinding(): void {
    if (this.isEnabled) {
      this.eventListener!.dispose();
    }
  }

  public valueChanged(): void {
    if (this.route !== null && this.route !== void 0) {
      if (typeof this.params === 'object' && this.params !== null) {
        this.instructions = this.router.createViewportInstructions({ component: this.route as NavigationInstruction, params: this.params as Params });
      } else {
        this.instructions = this.router.createViewportInstructions(this.route as NavigationInstruction);
      }
    } else {
      this.instructions = null;
    }

    const controller = CustomElement.for(this.el, { optional: true });
    if (controller !== null) {
      (controller.viewModel as IIndexable)[this.attribute] = this.instructions;
    } else {
      if (this.instructions === null) {
        this.el.removeAttribute(this.attribute);
      } else {
        this.el.setAttribute(this.attribute, this.instructions.toUrl());
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
