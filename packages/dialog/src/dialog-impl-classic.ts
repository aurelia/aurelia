import { IPlatform, IWindow } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogController,
} from './dialog-interfaces';
import { IDisposable, onResolve, resolve } from '@aurelia/kernel';
import { createInterface } from './utilities-di';

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

  /**
   * A callback that is invoked when the dialog is shown.
   */
  show?: (dom: DialogDomClassic) => void | Promise<void>;
  /**
   * A callback that is invoked when the dialog is hidden.
   */
  hide?: (dom: DialogDomClassic) => void | Promise<void>;
};

export type DialogActionKey = 'Escape' | 'Enter';
export type DialogMouseEventType = 'click' | 'mouseup' | 'mousedown';

export class DialogDomRendererClassic implements IDialogDomRenderer<DialogRenderOptionsClassic> {
  private readonly p = resolve(IPlatform);
  /** @internal */
  private readonly _eventManager = resolve(IDialogEventManager);

  private readonly overlayCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
  private readonly wrapperCss = `${this.overlayCss} display:flex;`;
  private readonly hostCss = 'position:relative;margin:auto;';

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
    return new DialogDomClassic(wrapper, overlay, host, controller, this._eventManager, options ?? {});
  }
}

export class DialogDomClassic implements IDialogDom {
  /** @internal */
  private readonly _controller: IDialogController;
  /** @internal */
  private readonly _eventManager: IDialogEventManager;
  /** @internal */
  private _sub: IDisposable | null = null;
  /** @internal */
  private readonly _options: DialogRenderOptionsClassic;

  public constructor(
    public readonly root: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly contentHost: HTMLElement,
    controller: IDialogController,
    eventManager: IDialogEventManager,
    options: DialogRenderOptionsClassic,
  ) {
    this._controller = controller;
    this._eventManager = eventManager;
    this._options = options ?? {};
  }

  public show() {
    return onResolve(this._options?.show?.(this), () => {
      this._sub = this._eventManager.add(this._controller, this);
    });
  }

  public hide(): void | Promise<void> {
    this._sub?.dispose();
    return this._options?.hide?.(this);
  }

  public dispose(): void {
    this._sub?.dispose();
    this.root.remove();
  }
}

const IDialogEventManager = /*@__PURE__*/createInterface<IDialogEventManager>('IDialogEventManager', x => x.singleton(DialogEventManagerClassic));
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

class DialogEventManagerClassic implements IDialogEventManager {
  private readonly ctrls: IDialogController[] = [];
  private readonly w = resolve(IWindow);

  public add(controller: IDialogController, dom: DialogDomClassic): IDisposable {
    if (this.ctrls.push(controller) === 1) {
      this.w.addEventListener('keydown', this);
    }

    const options = controller.settings.options as DialogRenderOptionsClassic;
    const lock = options.lock;
    let overlayDismiss = options.overlayDismiss;

    overlayDismiss = typeof overlayDismiss === 'boolean' ? overlayDismiss : !lock;

    const mouseEvent = options.mouseEvent ?? 'click';
    const handleClick = (e: MouseEvent) => {
        if (/* user allows dismiss on overlay click */overlayDismiss
        && /* did not click inside the host element */!dom.contentHost.contains(e.target as Element)
      ) {
        void controller.cancel();
      }
    };
    dom.overlay?.addEventListener(mouseEvent, handleClick);

    const handleSubmit = (e: SubmitEvent) => {
      const target = e.target as HTMLFormElement;
      const noAction = !target.getAttribute('action');

      if (target.tagName === 'FORM' && noAction) {
        e.preventDefault();
      }
    };
    dom.contentHost.addEventListener('submit', handleSubmit);
    let disposed = false;

    return {
      dispose: () => {
        if (disposed) {
          return;
        }
        disposed = true;
        this._remove(controller);
        dom.overlay?.removeEventListener(mouseEvent, handleClick);
        dom.contentHost.removeEventListener('submit', handleSubmit);
      }
    };
  }

  /** @internal */
  private _remove(controller: IDialogController): void {
    const ctrls = this.ctrls;
    const idx = ctrls.indexOf(controller);
    if (idx !== -1) {
      ctrls.splice(idx, 1);
    }
    if (ctrls.length === 0) {
      this.w.removeEventListener('keydown', this);
    }
  }

  /** @internal */
  private _getKeyboardOptions(ctrl: IDialogController): string[] {
    const options = ctrl.settings.options as DialogRenderOptionsClassic;
    return options.keyboard ?? (options.lock ? [] : ['Enter', 'Escape']);
  }

  /** @internal */
  public handleEvent(e: Event): void {
    const keyEvent = e as KeyboardEvent;
    const key = DialogEventManagerClassic._getActionKey(keyEvent);
    if (key == null) {
      return;
    }
    const top = this.ctrls.slice(-1)[0];
    if (top == null) {
      return;
    }
    const keyboard = this._getKeyboardOptions(top);
    if (key === 'Escape' && keyboard.includes(key)) {
      void top.cancel();
    } else if (key === 'Enter' && keyboard.includes(key)) {
      void top.ok();
    }
  }

  /** @internal */
  private static _getActionKey(e: KeyboardEvent): DialogActionKey | undefined {
    if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
      return 'Escape';
    }
    if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
      return 'Enter';
    }
    return undefined;
  }
}
