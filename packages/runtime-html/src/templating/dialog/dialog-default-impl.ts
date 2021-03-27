import { IPlatform } from '../../platform.js';
import {
  IDialogAnimator,
  IDialogDomRenderer,
  IDialogDom,
  IDialogDomSubscriber,
  IGlobalDialogSettings,
  LoadedDialogSettings,
} from './dialog-interfaces.js';

import { IContainer, Registration } from '@aurelia/kernel';

export class DefaultGlobalSettings implements IGlobalDialogSettings {

  public static register(container: IContainer) {
    Registration.singleton(IGlobalDialogSettings, this).register(container);
  }

  public lock: boolean = true;
  public startingZIndex = 1000;
  public rejectOnCancel = false;
  public restoreFocus(el: HTMLElement): void {
    el.focus();
  }
}

const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';

export class DefaultDialogDomRenderer implements IDialogDomRenderer {

  protected static inject = [IPlatform];

  public constructor(private readonly p: IPlatform) {}

  public static register(container: IContainer) {
    Registration.singleton(IDialogDomRenderer, this).register(container);
  }

  private readonly wrapperCss: string = `${baseWrapperCss} display: flex;`;
  private readonly overlayCss: string = baseWrapperCss;
  private readonly hostCss: string = 'position: relative; margin: auto;';

  public render(dialogHost: HTMLElement, settings: LoadedDialogSettings): IDialogDom {
    const doc = this.p.document;
    const h = (name: string, css?: string) => {
      const el = doc.createElement(name);
      if (css != null) {
        el.style.cssText = css;
      }
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

  public constructor(
    private readonly wrapper: HTMLElement,
    private readonly overlay: HTMLElement,
    public readonly host: HTMLElement,
    private readonly s: LoadedDialogSettings,
  ) {
    overlay.addEventListener(s.mouseEvent ?? 'click', this);
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
    this.overlay.removeEventListener(this.s.mouseEvent ?? 'click', this);
    this.subs.clear();
  }
}

export interface IDefaultDialogAnimationSettings {
  ignoreTransitions?: boolean;
  attaching?: Parameters<Element['animate']>;
  detaching?: Parameters<Element['animate']>;
}

/**
 * A default implementation for IDialogRenderer interface
 */
export class DefaultDialogAnimator implements IDialogAnimator<IDefaultDialogAnimationSettings> {

  public static register(container: IContainer) {
    Registration.singleton(IDialogAnimator, this).register(container);
  }

  public attaching(dialogDom: IDialogDom, animation: IDefaultDialogAnimationSettings = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.attaching, animation.ignoreTransitions);
  }

  public detaching(dialogDom: IDialogDom, animation: IDefaultDialogAnimationSettings = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.detaching, animation.ignoreTransitions);
  }

  private animate(host: HTMLElement, params?: Parameters<Element['animate']>, doNotWait?: boolean): void | Promise<Animation> {
    if (params != null) {
      const animation = host.animate(...params);
      if (!doNotWait) {
        return animation.finished;
      }
    }
  }
}
