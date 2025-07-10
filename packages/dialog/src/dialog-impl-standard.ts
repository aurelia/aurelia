import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogController,
} from './dialog-interfaces';
import { isString, onResolve, resolve } from '@aurelia/kernel';
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
   * Read more on the modal behavior of dialogs on MDN
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement#opening_a_modal_dialog
   */
  modal?: boolean;

  /**
   * A CSS string for all the overlay styles or a property-based CSS configuration for the overlay of the dialog.
   */
  overlayStyle?: string | Partial<CSSStyleDeclaration>;

  /**
   * A callback that is invoked when the dialog is shown.
   */
  show?: (dom: DialogDomStandard) => void | Promise<void>;
  /**
   * A callback that is invoked when the dialog is hidden.
   */
  hide?: (dom: DialogDomStandard) => void | Promise<void>;
  /**
   * Specifies the types of user actions that can be used to close the <dialog> element
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby
   */
  closedby?: 'any' | 'closerequest' | 'none';
};

export class DialogDomRendererStandard implements IDialogDomRenderer<DialogRenderOptionsStandard> {
  private readonly p = resolve(IPlatform);

  public render(dialogHost: HTMLElement, controller: IDialogController, options: DialogRenderOptionsStandard = {}): IDialogDom {
    const h = (name: string) => this.p.document.createElement(name);
    const wrapper = h('dialog') as HTMLDialogElement;
    const host = wrapper.appendChild(h('div'));

    if (options.closedby) {
      wrapper.setAttribute('closedby', options.closedby);
    }
    dialogHost.appendChild(wrapper);

    return new DialogDomStandard(wrapper, host, controller, options);
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

  public constructor(
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
    el.textContent = `:modal::backdrop{${styleParser.style.cssText}}`;
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
        this.root.close();
      }
    );
  }

  public dispose(): void {
    this.root.remove();
  }

  /** @internal */
  public handleEvent(event: Event): void {
    /**
     * The cancel event fires on a <dialog> element when the user instructs the browser that they wish to dismiss the
     * current open dialog. The browser fires this event when the user presses the Esc key.
     *
     * Prevent native dismiss and invoke controller cancel pipeline
     */
    event.preventDefault();
    void this._controller.cancel();
  }
}
