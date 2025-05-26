import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogController,
} from './dialog-interfaces';

import { IContainer, isString, resolve } from '@aurelia/kernel';
import { singletonRegistration } from './utilities-di';

export type DialogRenderOptionsStandard = {
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

  /**
   * A callback that is invoked when the dialog is shown.
   */
  show?: (dom: IDialogDom) => void | Promise<void>;
  /**
   * A callback that is invoked when the dialog is hidden.
   */
  hide?: (dom: IDialogDom) => void | Promise<void>;
};

export class DialogDomRendererStandard implements IDialogDomRenderer<DialogRenderOptionsStandard> {
  public static register(container: IContainer) {
    container.register(singletonRegistration(IDialogDomRenderer, this));
  }

  private static id = 0;
  private readonly p = resolve(IPlatform);

  public render(dialogHost: HTMLElement, requestor: IDialogController, options: DialogRenderOptionsStandard = {}): IDialogDom {
    const h = (name: string) => this.p.document.createElement(name);
    const wrapper = h('dialog') as HTMLDialogElement;
    const id = `d-${++DialogDomRendererStandard.id}`;
    const host = wrapper.appendChild(h('div'));

    wrapper.setAttribute('data-dialog-id', id);
    dialogHost.appendChild(wrapper);

    const dom = new DialogDomStandard(id, wrapper, host, options);
    return dom;
  }
}

export class DialogDomStandard implements IDialogDom {
  /** @internal */
  private _overlayStyleEl: HTMLStyleElement | null = null;
  /** @internal */
  private readonly _styleParser: HTMLElement;
  /** @internal */
  private readonly _options: DialogRenderOptionsStandard;
  // only have this to fulfill the IDialogDom interface
  public readonly overlay: HTMLElement | null = null;

  public constructor(
    public readonly id: string,
    public readonly wrapper: HTMLDialogElement,
    public readonly contentHost: HTMLElement,
    options: DialogRenderOptionsStandard,
  ) {
    this._options = options;
    this._styleParser = wrapper.ownerDocument.createElement('div');
    if (options.overlayStyle != null) {
      this.setOverlayStyle(options.overlayStyle);
    }
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
    if (this._options.modal) {
      this.wrapper.showModal();
    } else {
      this.wrapper.show();
    }
    return this._options.show?.(this);
  }

  public hide(): void | Promise<void> {
    return this._options.hide?.(this);
  }

  public dispose(): void {
    this.wrapper.remove();
  }
}
