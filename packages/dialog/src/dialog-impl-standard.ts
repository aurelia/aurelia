import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogController,
  IDialogGlobalSettings,
} from './dialog-interfaces';

import { IContainer, isString, onResolve, resolve } from '@aurelia/kernel';
import { singletonRegistration } from './utilities-di';
import { createMappedError, ErrorNames } from './errors';

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

export class DialogGlobalOptionsStandard implements IDialogGlobalSettings<DialogRenderOptionsStandard> {
  public static register(container: IContainer): void {
    container.register(singletonRegistration(IDialogGlobalSettings, this));
  }

  public options: DialogRenderOptionsStandard = {};
  public rejectOnCancel = false;
}

export class DialogDomRendererStandard implements IDialogDomRenderer<DialogRenderOptionsStandard> {
  public static register(container: IContainer) {
    container.register(singletonRegistration(IDialogDomRenderer, this));
  }

  private static id = 0;
  private readonly p = resolve(IPlatform);

  public render(dialogHost: HTMLElement, controller: IDialogController, options: DialogRenderOptionsStandard = {}): IDialogDom {
    const h = (name: string) => this.p.document.createElement(name);
    const wrapper = h('dialog') as HTMLDialogElement;
    const id = `d-${++DialogDomRendererStandard.id}`;
    const host = wrapper.appendChild(h('div'));

    wrapper.setAttribute('data-dialog-id', id);
    dialogHost.appendChild(wrapper);

    const dom = new DialogDomStandard(id, wrapper, host, controller, options);
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
  /** @internal */
  private readonly _controller: IDialogController;
  // only have this to fulfill the IDialogDom interface
  public readonly overlay: HTMLElement | null = null;

  public constructor(
    public readonly id: string,
    public readonly root: HTMLDialogElement,
    public readonly contentHost: HTMLElement,
    controller: IDialogController,
    options: DialogRenderOptionsStandard,
  ) {
    this._controller = controller;
    this._options = options;
    this._styleParser = root.ownerDocument.createElement('div');
    if (options.overlayStyle != null) {
      this.setOverlayStyle(options.overlayStyle);
    }
  }

  public setOverlayStyle(css: string): void;
  public setOverlayStyle(css: Partial<CSSStyleDeclaration>): void;
  public setOverlayStyle(css: string | Partial<CSSStyleDeclaration>) {
    const el = this._overlayStyleEl ??= this.root.insertAdjacentElement(
      'afterbegin',
      this.root.ownerDocument.createElement('style')
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
      this.root.showModal();
    } else {
      this.root.show();
    }
    return onResolve(this._options.show?.(this), () => {
      this.root.addEventListener('cancel', this);
    });
  }

  public hide(): void | Promise<void> {
    // istanbul ignore next
    if (!this.root.open) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(createMappedError(ErrorNames.dialog_closed_before_deactivation));
      }
    }
    return onResolve(
      this._options.hide?.(this),
      () => {
        this.root.removeEventListener('cancel', this);
        // this close will trigger the 'close' event again
        // but we already removed the event listener
        // so it won't cause another handleEvent call
        this.root.close();
      }
    );
  }

  public dispose(): void {
    this.root.remove();
  }

  /** @internal */
  public handleEvent(event: Event): void {
    event.preventDefault();
    void this._controller.cancel();
  }
}
