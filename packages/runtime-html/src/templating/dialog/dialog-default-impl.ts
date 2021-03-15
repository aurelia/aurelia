import { IPlatform } from '../../platform.js';
import { IDialogAnimator, IDialogDomRenderer, IDialogDom, IDialogDomSubscriber } from './dialog-interfaces.js';

export class DefaultDialogHostRenderer implements IDialogDomRenderer {

  protected static inject = [IPlatform];

  public constructor(private readonly p: IPlatform) {}

  public render(dialogHost: HTMLElement): IDialogDom {
    const doc = this.p.document;
    const h = (name: string) => doc.createElement(name);
    const wrapper = dialogHost.appendChild(h('au-dialog-container'));
    const overlay = dialogHost.appendChild(h('au-dialog-overlay'));
    const host = wrapper.appendChild(h('div'));
    return new DefaultDialogDom(wrapper, overlay, host);
  }
}

export class DefaultDialogDom implements IDialogDom {

  private readonly subs: Set<IDialogDomSubscriber> = new Set();

  public constructor(
    private readonly wrapper: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly host: HTMLElement,
  ) {
    this.overlay.addEventListener('click', this);
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
    this.wrapper!.remove();
    this.overlay?.removeEventListener('click', this);
    this.overlay!.remove();
    this.subs.clear();
  }
}

export interface IDefaultDialogAnimation {
  ignoreTransitions?: boolean;
  attaching?: Parameters<Element['animate']>;
  attached?: Parameters<Element['animate']>;
  detaching?: Parameters<Element['animate']>;
  detached?: Parameters<Element['animate']>;
}

/**
 * A default implementation for IDialogRenderer interface
 */
export class DefaultDialogAnimator implements IDialogAnimator<IDefaultDialogAnimation> {

  public attaching(dialogDom: IDialogDom, animation: IDefaultDialogAnimation = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.attaching, animation.ignoreTransitions);
  }

  public attached(dialogDom: IDialogDom, animation: IDefaultDialogAnimation = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.attached, animation.ignoreTransitions);
  }

  public detaching(dialogDom: IDialogDom, animation: IDefaultDialogAnimation = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.detaching, animation.ignoreTransitions);
  }

  public detached(dialogDom: IDialogDom, animation: IDefaultDialogAnimation = {}): void | Promise<Animation> {
    return this.animate(dialogDom.host, animation.detached, animation.ignoreTransitions);
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
