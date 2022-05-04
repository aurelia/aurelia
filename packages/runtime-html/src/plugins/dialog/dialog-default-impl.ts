import { IPlatform } from '../../platform';
import {
  IDialogDomRenderer,
  IDialogDom,
  IDialogGlobalSettings,
} from './dialog-interfaces';

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

  /** @internal */
  protected static inject = [IPlatform];

  public constructor(private readonly p: IPlatform) {}

  public static register(container: IContainer) {
    Registration.singleton(IDialogDomRenderer, this).register(container);
  }

  private readonly wrapperCss: string = `${baseWrapperCss} display:flex;`;
  private readonly overlayCss: string = baseWrapperCss;
  private readonly hostCss: string = 'position:relative;margin:auto;';

  public render(dialogHost: HTMLElement): IDialogDom {
    const doc = this.p.document;
    const h = (name: string, css: string) => {
      const el = doc.createElement(name);
      el.style.cssText = css;
      return el;
    };
    const wrapper = dialogHost.appendChild(h('au-dialog-container', this.wrapperCss));
    const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
    const host = wrapper.appendChild(h('div', this.hostCss));
    return new DefaultDialogDom(wrapper, overlay, host);
  }
}

export class DefaultDialogDom implements IDialogDom {
  public constructor(
    public readonly wrapper: HTMLElement,
    public readonly overlay: HTMLElement,
    public readonly contentHost: HTMLElement,
  ) {
  }

  public dispose(): void {
    this.wrapper.remove();
  }
}
