import {
  type ICustomAttributeViewModel,
  type ICustomAttributeController,
  INode,
  IWindow,
  CustomAttribute,
  type CustomAttributeStaticAuDefinition,
  refs
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { LoadCustomAttribute } from '../configuration';
import { IRouteContext } from '../route-context';
import { resolve } from '@aurelia/kernel';
import { bmToView } from '../util';
import { ViewportInstructionTree } from '../instructions';

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
  /** @internal */private _instructions: ViewportInstructionTree | null = null;
  /** @internal */private _treatAsExternal: boolean = false;
  /** @internal */private static readonly _protocolLikePrefix = /^[a-z][a-z0-9+\-.]*:\/\//i;

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
      this._isEnabled = this._isEnabled && refs.get(this._el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
    }
    this.valueChanged(this.value);
    this._el.addEventListener('click', this);
  }

  public unbinding(): void {
    this._el.removeEventListener('click', this);
  }

  public valueChanged(newValue: unknown): void {
    const treatAsExternal = this._resolveIsExternal(newValue);
    this._treatAsExternal = treatAsExternal;
    if (newValue == null) {
      this._instructions = null;
      this._el.removeAttribute('href');
    } else {
      if (!treatAsExternal) {
        const router = this._router;
        const instructions = this._instructions = router.createViewportInstructions(newValue, { context: this._ctx });
        newValue = instructions.toUrl(false, router.options._urlParser, true);
      } else {
        this._instructions = null;
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
      || this._treatAsExternal
      || !this._isEnabled
      || this._instructions === null
    ) {
      return;
    }

    e.preventDefault();
    // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
    void this._router.load(this._instructions, { context: this._ctx });
  }

  /** @internal */
  private _resolveIsExternal(value: unknown): boolean {
    if (this._el.hasAttribute('external') || this._el.hasAttribute('data-external')) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      return false;
    }

    if (trimmed.startsWith('//')) {
      return true;
    }

    if (HrefCustomAttribute._protocolLikePrefix.test(trimmed)) {
      return true;
    }

    const protocolEnd = trimmed.indexOf(':');
    if (protocolEnd <= 0) {
      return false;
    }

    const protocol = trimmed.slice(0, protocolEnd).toLowerCase();
    return this._router.options._externalUrlSchemesSet.has(protocol);
  }
}
