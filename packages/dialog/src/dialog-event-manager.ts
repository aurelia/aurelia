import { IContainer, IDisposable, resolve } from '@aurelia/kernel';
import { type DialogActionKey, IDialogController, IDialogEventManager, IDialogDom } from './dialog-interfaces';
import { IWindow } from '@aurelia/runtime-html';
import { singletonRegistration } from './utilities-di';

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

    const mouseEvent = controller.settings.mouseEvent ?? 'click';
    const handleClick = (e: MouseEvent) => {
        if (/* user allows dismiss on overlay click */controller.settings.overlayDismiss
        && /* did not click inside the host element */!dom.contentHost.contains(e.target as Element)
      ) {
        void controller.cancel();
      }
    };
    dom.overlay.addEventListener(mouseEvent, handleClick);

    return {
      dispose: () => {
        this._remove(controller);
        dom.overlay.removeEventListener(mouseEvent, handleClick);
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
  public handleEvent(e: Event): void {
    const keyEvent = e as KeyboardEvent;
    const key = getActionKey(keyEvent);
    if (key == null) {
      return;
    }
    const top = this.ctrls.slice(-1)[0];
    if (top == null || top.settings.keyboard.length === 0) {
      return;
    }
    const keyboard = top.settings.keyboard;
    if (key === 'Escape' && keyboard.includes(key)) {
      void top.cancel();
    } else if (key === 'Enter' && keyboard.includes(key)) {
      void top.ok();
    }
  }
}

function getActionKey(e: KeyboardEvent): DialogActionKey | undefined {
  if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
    return 'Escape';
  }
  if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
    return 'Enter';
  }
  return undefined;
}
