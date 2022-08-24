import { IDisposable } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
import { customAttribute, bindable, ICustomAttributeViewModel, ICustomAttributeController, IEventDelegator, IEventTarget, INode, IWindow, getRef, CustomAttribute } from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { LoadCustomAttribute } from '../configuration';
import { IRouteContext } from '../route-context';

@customAttribute('href')
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  /**
   * When not bound, it defaults to the injected instance of the router context.
   */
  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public context?: IRouteContext;

  private eventListener!: IDisposable;
  private isInitialized: boolean = false;
  private isEnabled: boolean;

  private get isExternal(): boolean {
    return this.el.hasAttribute('external') || this.el.hasAttribute('data-external');
  }

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
      el.nodeName === 'A'
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
    if (this.value == null) {
      this.el.removeAttribute('href');
    } else {
      this.el.setAttribute('href', this.value as string);
    }
    this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this);
  }
  public unbinding(): void {
    this.eventListener.dispose();
  }

  public valueChanged(newValue: unknown): void {
    // this allows binding context to null for navigation from root; unbound vs explicit null binding
    if(this.context === void 0) {
      this.context = this.ctx;
    } else if(this.context === null) {
      this.context = this.ctx.root;
    }
    if (newValue == null) {
      this.el.removeAttribute('href');
    } else {
      this.el.setAttribute('href', newValue as string);
    }
  }

  public handleEvent(e: MouseEvent) {
    this._onClick(e);
  }

  /** @internal */
  private _onClick(e: MouseEvent): void {
    // Ensure this is an ordinary left-button click
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0
      // on an internally managed link
      || this.isExternal
      || !this.isEnabled
    ) {
      return;
    }

    // Use the normalized attribute instead of this.value to ensure consistency.
    const href = this.el.getAttribute('href');
    if (href !== null) {
      e.preventDefault();
      // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
      void this.router.load(href, { context: this.context });
    }
  }
}
