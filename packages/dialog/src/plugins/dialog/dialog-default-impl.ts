import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogGlobalSettings, DialogActionKey, IDialogLoadedSettings, IDialogController,
} from './dialog-interfaces';

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
  protected static inject = [IPlatform];

  public wrapper!: HTMLElement;

  public overlay!: HTMLElement;

  public contentHost!: HTMLElement;

  /** @internal */
  protected settings!: IDialogLoadedSettings;

  /** @internal */
  protected controller!: IDialogController;

  public constructor(private readonly p: IPlatform) {}

  public static register(container: IContainer) {
    transientRegistration(IDialogDomRenderer, this).register(container);
  }

  public render(dialogHost: HTMLElement, settings: IDialogLoadedSettings, controller: IDialogController): HTMLElement {
    const doc = this.p.document;
    const h = (name: string, css: string): HTMLElement => {
      const el = doc.createElement(name);
      el.style.cssText = css;
      return el;
    };
    const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
    wrapper.setAttribute('tabindex', '-1');
    const overlay = wrapper.appendChild(h('au-dialog-overlay', baseWrapperCss));
    const contentHost = wrapper.appendChild(h('div', hostCss));

    overlay.addEventListener(settings.mouseEvent ?? 'click', this);
    wrapper.addEventListener('keydown', this);

    this.wrapper = wrapper;
    this.overlay = overlay;
    this.contentHost = contentHost;
    this.settings = settings;
    this.controller = controller;

    return contentHost;
  }

  public dispose(): void {
    this.wrapper.removeEventListener('keydown', this);
    this.overlay.removeEventListener(this.settings.mouseEvent ?? 'click', this);
    this.wrapper.remove();
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent | MouseEvent): void {
    const { controller } = this;

    // handle wrapper keydown
    if (event.type === 'keydown') {
      const key = getActionKey(event as KeyboardEvent);
      if (key == null) {
        return;
      }

      const keyboard = this.settings.keyboard;
      if (key === 'Escape' && keyboard.includes(key)) {
        void controller.cancel();
      } else if (key === 'Enter' && keyboard.includes(key)) {
        void controller.ok();
      }
      return;
    }

    // handle overlay click
    if (/* user allows to dismiss on overlay click */this.settings.overlayDismiss
      && /* did not click inside the host element */!this.contentHost.contains(event.target as Element)
    ) {
      void controller.cancel();
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
