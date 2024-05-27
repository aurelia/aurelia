import { IPlatform } from '@aurelia/runtime-html';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogGlobalSettings, IDialogLoadedSettings,
  IDialogDomAnimator,
} from './dialog-interfaces';

import { IContainer, optional, resolve } from '@aurelia/kernel';
import { singletonRegistration } from './utilities-di';

export class DefaultDialogGlobalSettings implements IDialogGlobalSettings {

  public static register(container: IContainer) {
    singletonRegistration(IDialogGlobalSettings, this).register(container);
  }

  public lock: boolean = true;
  public startingZIndex = 1000;
  public rejectOnCancel = false;
}

export class DefaultDialogDomRenderer implements IDialogDomRenderer {
  public static register(container: IContainer) {
    container.register(singletonRegistration(IDialogDomRenderer, this));
  }

  private readonly p = resolve(IPlatform);
  /** @internal */
  private readonly _animator = resolve(optional(IDialogDomAnimator));

  private readonly overlayCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
  private readonly wrapperCss = `${this.overlayCss} display:flex;`;
  private readonly hostCss = 'position:relative;margin:auto;';

  public render(dialogHost: HTMLElement, settings: IDialogLoadedSettings): IDialogDom {
    const doc = this.p.document;
    const h = (name: string, css: string) => {
      const el = doc.createElement(name);
      el.style.cssText = css;
      return el;
    };
    const { startingZIndex } = settings;
    const wrapperCss = `${this.wrapperCss};${startingZIndex == null ? '' : `z-index:${startingZIndex}`}`;
    const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
    const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
    const host = wrapper.appendChild(h('div', this.hostCss));
    return new DefaultDialogDom(wrapper, overlay, host, this._animator);
  }
}

export class DefaultDialogDom implements IDialogDom {
  /** @internal */
  private readonly _animator?: IDialogDomAnimator;
  public constructor(
    public readonly wrapper: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly contentHost: HTMLElement,
    animator?: IDialogDomAnimator,
  ) {
    this._animator = animator;
  }

  public show() {
    return this._animator?.show(this);
  }

  public hide(): void | Promise<void> {
    return this._animator?.hide(this);
  }

  public dispose(): void {
    this.wrapper.remove();
  }
}
