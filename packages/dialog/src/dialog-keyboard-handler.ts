import { IContainer, resolve } from '@aurelia/kernel';
import { type DialogActionKey, IDialogController, IDialogKeyboardManager } from './dialog-interfaces';
import { IPlatform } from '@aurelia/runtime-html';
import { singletonRegistration } from './utilities-di';

export class DefaultDialogKeyboardManager implements IDialogKeyboardManager {
  public static register(container: IContainer) {
    singletonRegistration(IDialogKeyboardManager, this).register(container);
  }

  private readonly ctrls: IDialogController[] = [];
  private readonly p = resolve(IPlatform);

  public add(controller: IDialogController): void {
    if (this.ctrls.push(controller) === 1) {
      this.p.window.addEventListener('keydown', this);
    }
  }

  public remove(controller: IDialogController): void {
    const ctrls = this.ctrls;
    const idx = ctrls.indexOf(controller);
    if (idx !== -1) {
      ctrls.splice(idx, 1);
    }
    if (ctrls.length === 0) {
      this.p.window.removeEventListener('keydown', this);
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
