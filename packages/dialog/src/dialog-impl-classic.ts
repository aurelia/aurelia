import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogGlobalOptions,
  IDialogDomAnimator,
  IDialogController,
} from './dialog-interfaces';

import { IContainer, IDisposable, onResolve, optional, resolve } from '@aurelia/kernel';
import { createInterface, singletonRegistration } from './utilities-di';

export type DialogRenderOptionsClassic = {
  /**
   * When set to "false" allows the dialog to be closed with ESC key or clicking outside the dialog.
   * When set to "true" the dialog does not close on ESC key or clicking outside of it.
   */
  lock?: boolean;

  /**
   * Allows for closing the top most dialog via the keyboard.
   * When set to "false" no action will be taken.
   * If set to "true", "Escape" or an array containing "Escape"
   * the dialog will be "cancel" closed when the ESC key is pressed.
   * If set to "Enter" or and array containing "Enter"
   * the dialog will be "ok" closed  when the ENTER key is pressed.
   * Using the array format allows combining the ESC and ENTER keys.
   */
  keyboard?: DialogActionKey[];

  /**
   * Determines which type of mouse event should be used for closing the dialog
   *
   * Default: click
   */
  mouseEvent?: DialogMouseEventType;

  /**
   * When set to "true" allows for the dismissal of the dialog by clicking outside of it.
   */
  overlayDismiss?: boolean;

  /**
   * The z-index of the dialog.
   * In the terms of the DialogRenderer it is applied to the dialog overlay and the dialog container.
   */
  startingZIndex?: number;
};

export type DialogActionKey = 'Escape' | 'Enter';
export type DialogMouseEventType = 'click' | 'mouseup' | 'mousedown';

export const IDialogEventManager = /*@__PURE__*/createInterface<IDialogEventManager>('IDialogKeyboardService');
/**
 * An interface for managing the events of dialogs
 */
export interface IDialogEventManager {
  /**
   * Manage the events of a dialog controller & its dom
   *
   * @param controller - the dialog controller to have its events managed
   * @param dom - the corresponding dialog dom of the controller
   * @returns a disposable handle to be call whenever the dialog event manager should stop managing the dialog controller & its dom
   */
  add(controller: IDialogController, dom: IDialogDom): IDisposable;
}

export class DialogGlobalOptionsClassic implements IDialogGlobalOptions<DialogRenderOptionsClassic> {

  public static register(container: IContainer) {
    singletonRegistration(IDialogGlobalOptions, this).register(container);
  }

  public lock: boolean = true;
  public startingZIndex = 1000;
  public rejectOnCancel = false;
}

export class DialogDomRendererClassic implements IDialogDomRenderer<DialogRenderOptionsClassic> {
  public static register(container: IContainer) {
    container.register(singletonRegistration(IDialogDomRenderer, this));
  }

  private readonly p = resolve(IPlatform);
  private readonly _eventManager = resolve(IDialogEventManager);
  /** @internal */
  private readonly _animator = resolve(optional(IDialogDomAnimator));

  private readonly overlayCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
  private readonly wrapperCss = `${this.overlayCss} display:flex;`;
  private readonly hostCss = 'margin:auto;';

  public render(dialogHost: HTMLElement, controller: IDialogController, options?: DialogRenderOptionsClassic): IDialogDom {
    const doc = this.p.document;
    const h = (name: string, css: string) => {
      const el = doc.createElement(name);
      el.style.cssText = css;
      return el;
    };
    const { startingZIndex } = options ?? {};
    const wrapperCss = `${this.wrapperCss};${startingZIndex == null ? '' : `z-index:${startingZIndex}`}`;
    const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
    const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
    const host = wrapper.appendChild(h('div', this.hostCss));
    return new DialogDomClassic(wrapper, overlay, host, controller, this._eventManager, this._animator);
  }
}

export class DialogDomClassic implements IDialogDom {
  /** @internal */
  private readonly _controller: IDialogController;
  /** @internal */
  private readonly _animator?: IDialogDomAnimator;
  /** @internal */
  private readonly _eventManager: IDialogEventManager;
  /** @internal */
  private _sub: IDisposable | null = null;

  public constructor(
    public readonly wrapper: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly contentHost: HTMLElement,
    controller: IDialogController,
    eventManager: IDialogEventManager,
    animator?: IDialogDomAnimator,
  ) {
    this._controller = controller;
    this._eventManager = eventManager;
    this._animator = animator;
  }

  public show() {
    return onResolve(this._animator?.show(this), () => {
      this._sub = this._eventManager.add(this._controller, this);
    });
  }

  public hide(): void | Promise<void> {
    this._sub?.dispose();
    return this._animator?.hide(this);
  }

  public dispose(): void {
    this._sub?.dispose();
    this.wrapper.remove();
  }
}
