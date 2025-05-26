import { IContainer, IDisposable, resolve } from '@aurelia/kernel';
import { type DialogActionKey, IDialogController, IDialogDom } from './dialog-interfaces';
import { IWindow } from '@aurelia/runtime-html';
import { singletonRegistration } from './utilities-di';
import { DialogRenderOptionsClassic, IDialogEventManager } from './dialog-impl-classic';

export class DefaultDialogEventManager implements IDialogEventManager {
  public static register(container: IContainer) {
    singletonRegistration(IDialogEventManager, this).register(container);
  }

  private readonly ctrls: IDialogController[] = [];
  private readonly w = resolve(IWindow);

  public add(controller: IDialogController, dom: IDialogDom): IDisposable {
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
    const key = DefaultDialogEventManager._getActionKey(keyEvent);
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
