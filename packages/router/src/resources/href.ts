import {
  type ICustomAttributeViewModel,
  type ICustomAttributeController,
  INode,
  IWindow,
  CustomAttribute,
  type CustomAttributeStaticAuDefinition,
  refs
} from '@aurelia/runtime-html';

import { LoadCustomAttribute } from '../configuration';
import { resolve } from '@aurelia/kernel';
import { bmToView, isNavigationClick } from '../util';
import { ViewportInstructionTree } from '../instructions';
import { ILocationManager } from '../location-manager';
import { IContextRouter } from '../context-router';

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
  /** @internal */private readonly _window: IWindow = resolve(IWindow);
  /** @internal */private readonly _ctxRouter: IContextRouter = resolve(IContextRouter);
  /** @internal */private readonly _locationMgr: ILocationManager = resolve(ILocationManager);

  public value: unknown;

  /** @internal */private _isInitialized: boolean = false;
  /** @internal */private _isEnabled: boolean;
  /** @internal */private _instructions: ViewportInstructionTree | null = null;
  /** @internal */private _treatAsExternal: boolean = false;

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor() {
    this._isEnabled = this._ctxRouter._options.useHref && this._el.nodeName === 'A';
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
        const instructions = this._instructions = this._ctxRouter.createViewportInstructions(newValue, null, null);
        newValue = this._locationMgr.addBaseHref(instructions.toUrl(false, this._ctxRouter._options._urlParser, true));
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
    if (this._treatAsExternal
      || !this._isEnabled
      || this._instructions === null
      || !isNavigationClick(e, this._el, this._window.name)
    ) {
      return;
    }

    e.preventDefault();
    // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
    void this._ctxRouter.load(this._instructions);
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

    if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(trimmed)) {
      return true;
    }

    try {
      // Treat URLs that can be parsed without a base as external (absolute URLs or schemes).
      // Relative URLs will throw and are therefore handled internally.
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
}
