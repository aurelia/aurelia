import { IDisposable } from '@aurelia/kernel';
import { customAttribute, bindable, BindingMode, ICustomAttributeViewModel, ICustomAttributeController, IEventDelegator, IEventTarget, INode, IWindow, getRef, CustomAttribute } from '@aurelia/runtime-html';

import { IRouter } from '../router.js';
import { LoadCustomAttribute } from '../configuration.js';
import { IRouteContext } from '../route-context.js';

@customAttribute({ name: 'href', noMultiBindings: true })
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;
  private isInitialized: boolean = false;
  private isEnabled: boolean;

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @IEventDelegator private readonly delegator: IEventDelegator,
    @IRouteContext private readonly ctx: IRouteContext,
    @IWindow w: IWindow,
  ) {
    if (
      router.options.useHref &&
      // Ensure the element is an anchor
      el.nodeName === 'A' &&
      // Ensure the anchor is not explicitly marked as external.
      !el.hasAttribute('external') &&
      !el.hasAttribute('data-external')
    ) {
      // Ensure the anchor targets the current window.
      switch (el.getAttribute('target')) {
        case null:
        case w.name:
        case '_self':
          this.isEnabled = true;
          break;
        default:
          this.isEnabled = false;
          break;
      }
    } else {
      this.isEnabled = false;
    }
  }

  public binding(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.isEnabled = this.isEnabled && getRef(this.el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
    }
    if (this.isEnabled) {
      this.el.setAttribute('href', this.value as string);
      this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick as EventListener);
    }
  }
  public unbinding(): void {
    if (this.isEnabled) {
      this.eventListener!.dispose();
    }
  }

  public valueChanged(newValue: unknown): void {
    this.el.setAttribute('href', newValue as string);
  }

  private readonly onClick = (e: MouseEvent): void => {
    // Ensure this is an ordinary left-button click.
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
      return;
    }

    // Use the normalized attribute instead of this.value to ensure consistency.
    const href = this.el.getAttribute('href');
    if (href !== null) {
      e.preventDefault();
      // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
      void this.router.load(href, { context: this.ctx });
    }
  };
}
