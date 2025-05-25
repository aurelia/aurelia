import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogDomAnimator,
  IDialogController,
} from './dialog-interfaces';

import { IContainer, isString, optional, resolve } from '@aurelia/kernel';
import { singletonRegistration } from './utilities-di';

export type StandardDialogRenderOptions = {
  /**
   * When set to "true" the dialog will be modal.
   * This means that the dialog will be displayed as a modal dialog.
   * The default value is "false".
   *
   * Note that this depends on the renderer,
   * Some renderers may not support this feature.
   *
   * Readmore on the modal behavior of dialogs on MDN
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement#opening_a_modal_dialog
   */
  modal?: boolean;

  /**
   * A css string for all the overlay styles or a property based css configuration
   * for the overlay of the dialog.
   */
  overlayStyle?: string | Partial<CSSStyleDeclaration>;
};

export class HtmlDialogDomRenderer implements IDialogDomRenderer<StandardDialogRenderOptions> {
  public static register(container: IContainer) {
    container.register(singletonRegistration(IDialogDomRenderer, this));
  }

  private static id = 0;
  private readonly p = resolve(IPlatform);
  /** @internal */
  private readonly _animator = resolve(optional(IDialogDomAnimator));

  public render(dialogHost: HTMLElement, requestor: IDialogController, options: StandardDialogRenderOptions = {}): IDialogDom {
    const h = (name: string) => this.p.document.createElement(name);
    const wrapper = h('dialog') as HTMLDialogElement;
    const id = `d-${++HtmlDialogDomRenderer.id}`;
    const host = wrapper.appendChild(h('div'));

    wrapper.setAttribute('data-dialog-id', id);
    dialogHost.appendChild(wrapper);

    const dom = new HtmlDialogDom(id, wrapper, host, this._animator, options.modal);
    if (options.overlayStyle != null) {
      dom.setOverlayStyle(options.overlayStyle);
    }
    return dom;
  }
}

export class HtmlDialogDom implements IDialogDom {
  /** @internal */
  private readonly _animator?: IDialogDomAnimator;
  /** @internal */
  private _overlayStyleEl: HTMLStyleElement | null = null;
  /** @internal */
  private readonly _styleParser: HTMLElement;
  public readonly overlay: HTMLElement | null = null;

  public constructor(
    public readonly id: string,
    public readonly wrapper: HTMLDialogElement,
    public readonly contentHost: HTMLElement,
    animator?: IDialogDomAnimator,
    public readonly isModal: boolean = false,
  ) {
    this._animator = animator;
    this._styleParser = wrapper.ownerDocument.createElement('div');
  }

  public setOverlayStyle(css: string): void;
  public setOverlayStyle(css: Partial<CSSStyleDeclaration>): void;
  public setOverlayStyle(css: string | Partial<CSSStyleDeclaration>) {
    const el = this._overlayStyleEl ??= this.wrapper.insertAdjacentElement(
      'afterbegin',
      this.wrapper.ownerDocument.createElement('style')
    ) as HTMLStyleElement;

    const styleParser = this._styleParser;
    styleParser.style.cssText = '';
    if (isString(css)) {
      styleParser.style.cssText = css;
    } else {
      Object.assign(styleParser.style, css);
    }
    el.textContent = `[data-dialog-id="${this.id}"]::backdrop{${styleParser.style.cssText}}`;
  }

  public show() {
    if (this.isModal) {
      this.wrapper.showModal();
    } else {
      this.wrapper.show();
    }
    return this._animator?.show(this);
  }

  public hide(): void | Promise<void> {
    return this._animator?.hide(this);
  }

  public dispose(): void {
    this.wrapper.remove();
  }
}
