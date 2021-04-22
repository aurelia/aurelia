import { IPlatform } from '../../platform.js';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogDomSubscriber,
  IDialogGlobalSettings,
  IDialogLoadedSettings,
  DialogMouseEventType,
} from './dialog-interfaces.js';

import { IContainer, Registration } from '@aurelia/kernel';

export class DefaultDialogGlobalSettings implements IDialogGlobalSettings {

  public static register(container: IContainer) {
    Registration.singleton(IDialogGlobalSettings, this).register(container);
  }

  public lock: boolean = true;
  public startingZIndex = 1000;
  public rejectOnCancel = false;
}

const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';

export class DefaultDialogDomRenderer implements IDialogDomRenderer {

  protected static inject = [IPlatform];

  public constructor(private readonly p: IPlatform) {}

  public static register(container: IContainer) {
    Registration.singleton(IDialogDomRenderer, this).register(container);
  }

  private readonly wrapperCss: string = `${baseWrapperCss} display:flex;`;
  private readonly overlayCss: string = baseWrapperCss;
  private readonly hostCss: string = 'position:relative;margin:auto;';

  public render(dialogHost: HTMLElement, settings: IDialogLoadedSettings): IDialogDom {
    const doc = this.p.document;
    const h = (name: string, css: string) => {
      const el = doc.createElement(name);
      el.style.cssText = css;
      return el;
    };
    const wrapper = dialogHost.appendChild(h('au-dialog-container', this.wrapperCss));
    const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
    const host = overlay.appendChild(h('div', this.hostCss));
    return new DefaultDialogDom(wrapper, overlay, host, settings);
  }
}

export class DefaultDialogDom implements IDialogDom {

  private readonly subs: Set<IDialogDomSubscriber> = new Set();
  private readonly e: DialogMouseEventType;

  public constructor(
    public readonly wrapper: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly contentHost: HTMLElement,
    s: IDialogLoadedSettings,
  ) {
    overlay.addEventListener(this.e = s.mouseEvent ?? 'click', this);
  }

  /**
   * @internal
   */
  public handleEvent(e: Event) {
    this.subs.forEach(sub => sub.handleOverlayClick(e as MouseEvent));
  }

  public subscribe(subscriber: IDialogDomSubscriber): void {
    this.subs.add(subscriber);
  }

  public unsubscribe(subscriber: IDialogDomSubscriber): void {
    this.subs.delete(subscriber);
  }

  public dispose(): void {
    this.wrapper.remove();
    this.overlay.removeEventListener(this.e, this);
    this.subs.clear();
  }
}
