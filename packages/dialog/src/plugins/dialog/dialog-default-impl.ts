import { ICustomElementController, IPlatform } from '@aurelia/runtime-html';
import { IDialogDomRenderer, IDialogGlobalSettings, DialogActionKey, IDialogController } from './dialog-interfaces';

import { IContainer } from '@aurelia/kernel';
import { singletonRegistration, transientRegistration } from '../../utilities-di';

export class DefaultDialogGlobalSettings implements IDialogGlobalSettings {

  public static register(container: IContainer) {
    singletonRegistration(IDialogGlobalSettings, this).register(container);
  }

  public lock: boolean = true;
  public startingZIndex = 1000;
  public rejectOnCancel = false;
}

const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
const wrapperCss = `${baseWrapperCss}display:flex;`;
const hostCss = 'position:relative;margin:auto;';

export class DefaultDialogDomRenderer implements IDialogDomRenderer, EventListenerObject {

  /** @internal */
  protected static inject = [IPlatform, IDialogController];

  public wrapper!: HTMLElement;

  public overlay!: HTMLElement;

  public contentHost!: HTMLElement;

  public constructor(private readonly platform: IPlatform, private readonly dialogController: IDialogController) {}

  public static register(container: IContainer) {
    transientRegistration(IDialogDomRenderer, this).register(container);
  }

  public render(componentController: ICustomElementController) {
    const { document } = this.platform;
    const { settings } = this.dialogController;
    const dialogHost = settings.host ?? document.body;

    const h = (name: string, css: string): HTMLElement => {
      const el = document.createElement(name);
      el.style.cssText = css;
      return el;
    };

    const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
    wrapper.setAttribute('tabindex', '-1');
    const overlay = wrapper.appendChild(h('au-dialog-overlay', baseWrapperCss));
    const contentHost = wrapper.appendChild(componentController.host);
    contentHost.style.cssText = hostCss;

    overlay.addEventListener(settings.mouseEvent ?? 'click', this);
    wrapper.addEventListener('keydown', this);

    this.wrapper = wrapper;
    this.overlay = overlay;
    this.contentHost = contentHost;
  }

  public dispose(): void {
    this.wrapper.removeEventListener('keydown', this);
    this.overlay.removeEventListener(this.dialogController.settings.mouseEvent ?? 'click', this);
    this.wrapper.remove();
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent | MouseEvent): void {
    const { dialogController } = this;

    // handle wrapper keydown
    if (event.type === 'keydown') {
      const key = getActionKey(event as KeyboardEvent);
      if (key == null) {
        return;
      }

      const keyboard = dialogController.settings.keyboard;
      if (key === 'Escape' && keyboard.includes(key)) {
        void dialogController.cancel();
      } else if (key === 'Enter' && keyboard.includes(key)) {
        void dialogController.ok();
      }
      return;
    }

    // handle overlay click
    if (/* user allows to dismiss on overlay click */dialogController.settings.overlayDismiss
      && /* did not click inside the host element */!this.contentHost.contains(event.target as Element)
    ) {
      void dialogController.cancel();
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
