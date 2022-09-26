import { IDisposable } from '@aurelia/kernel';
import { BindingMode, customAttribute, bindable, ICustomAttributeViewModel, ICustomAttributeController, IEventDelegator, IEventTarget, INode, IWindow, getRef, CustomAttribute } from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { LoadCustomAttribute } from '../configuration';
import { IRouteContext } from '../route-context';

/*
 * Note: Intentionally, there is no bindable `context` here.
 * Otherwise this CA needs to be turned into a multi-binding CA.
 * Which means that the following simplest case won't work any longer:
 *
 * ```html
 * <a href="https://bla.bla.com/bla" data-external>bla</a>
 * ```
 * Because the template compiler will think that `https` is a bindable property in this CA,
 * and will fail as it won't find a bindable property `https` here in this CA.
 * Therefore, till the template compiler can handle that correctly, introduction of a bindable context is intentionally omitted.
 */

@customAttribute({ name: 'href', noMultiBindings: true })
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

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
    this.valueChanged(this.value);
    this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this);
  }
  public unbinding(): void {
    this.eventListener.dispose();
  }

  public valueChanged(newValue: unknown): void {
    if (newValue == null) {
      this.el.removeAttribute('href');
    } else {
      if (this.router.options.useUrlFragmentHash && !(newValue as string).startsWith('#')) {
        newValue = `#${newValue}`;
      }
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
      void this.router.load(href, { context: this.ctx });
    }
  }
}
