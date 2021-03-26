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

export class DefaultDialogDomRenderer implements IDialogDomRenderer {

  protected static inject = [IPlatform];

  public constructor(private readonly p: IPlatform) {}

  public static register(container: IContainer) {
    Registration.singleton(IDialogDomRenderer, this).register(container);
  }

  public render(dialogHost: HTMLElement, settings: LoadedDialogSettings): IDialogDom {
    const doc = this.p.document;
    const h = (name: string) => doc.createElement(name);
    const overlay = dialogHost.appendChild(h('au-dialog-container'));
    const host = overlay.appendChild(h('div'));
    return new DefaultDialogDom(overlay, host, settings);
  }
}

export class DefaultDialogDom implements IDialogDom {

  private readonly subs: Set<IDialogDomSubscriber> = new Set();

  public constructor(
    public readonly overlay: HTMLElement,
    public readonly host: HTMLElement,
    private readonly s: LoadedDialogSettings,
  ) {
    overlay.addEventListener(s.mouseEvent ?? 'click', this);
  }

  /**
   * @internal
   */
  public handleEvent(e: Event) {
    if (this.overlay !== e.target) {
      this.subs.forEach(sub => sub.handleOverlayClick(e as MouseEvent));
    }
  }

  public subscribe(subscriber: IDialogDomSubscriber): void {
    this.subs.add(subscriber);
  }

  public unsubscribe(subscriber: IDialogDomSubscriber): void {
    this.subs.delete(subscriber);
  }

  public dispose(): void {
    this.overlay?.removeEventListener(this.s.mouseEvent ?? 'click', this);
    this.overlay!.remove();
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
