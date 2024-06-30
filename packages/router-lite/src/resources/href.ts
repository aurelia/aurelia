import {
  type ICustomAttributeViewModel,
  type ICustomAttributeController,
  INode,
  IWindow,
  getRef,
  CustomAttribute,
  type CustomAttributeStaticAuDefinition
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { LoadCustomAttribute } from '../configuration';
import { IRouteContext } from '../route-context';
import { resolve } from '@aurelia/kernel';
import { bmToView } from '../util';

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

export class HrefCustomAttribute implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'href',
    noMultiBindings: true,
    bindables: {
      value: { mode: bmToView }
    }
  };

  /** @internal */private readonly _el: INode<HTMLElement> = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);
  /** @internal */private readonly _router: IRouter = resolve(IRouter);
  /** @internal */private readonly _ctx: IRouteContext = resolve(IRouteContext);

  public value: unknown;

  /** @internal */private _isInitialized: boolean = false;
  /** @internal */private _isEnabled: boolean;

  /** @internal */
  private get _isExternal(): boolean {
    return this._el.hasAttribute('external') || this._el.hasAttribute('data-external');
  }

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor() {
    if (
      this._router.options.useHref &&
      // Ensure the element is an anchor
      this._el.nodeName === 'A'
    ) {
      const windowName = resolve(IWindow).name;
      // Ensure the anchor targets the current window.
      switch (this._el.getAttribute('target')) {
        case null:
        case windowName:
        case '_self':
          this._isEnabled = true;
          break;
        default:
          this._isEnabled = false;
          break;
      }
    } else {
      this._isEnabled = false;
    }
  }

  public binding(): void {
    if (!this._isInitialized) {
      this._isInitialized = true;
      this._isEnabled = this._isEnabled && getRef(this._el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
    }
    this.valueChanged(this.value);
    this._el.addEventListener('click', this);
    // this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this);
  }
  public unbinding(): void {
    // this.eventListener.dispose();
    this._el.removeEventListener('click', this);
  }

  public valueChanged(newValue: unknown): void {
    if (newValue == null) {
      this._el.removeAttribute('href');
    } else {
      if (this._router.options.useUrlFragmentHash
        && this._ctx.isRoot
        && !/^[.#]/.test(newValue as string)
        && !this._isExternal
      ) {
        newValue = `#${newValue}`;
      }
      this._el.setAttribute('href', newValue as string);
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
      || this._isExternal
      || !this._isEnabled
    ) {
      return;
    }

    // Use the normalized attribute instead of this.value to ensure consistency.
    const href = this._el.getAttribute('href');
    if (href !== null) {
      e.preventDefault();
      // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
      void this._router.load(href, { context: this._ctx });
    }
  }
}
