import { onResolve } from '@aurelia/kernel';
import { IPlatform } from '../../platform.js';
import { DialogController } from './dialog-controller.js';
import { IDialogController, IDialogRenderer } from './dialog-interfaces.js';

/**
 * A default implementation for IDialogRenderer interface
 */
export class DefaultDialogRenderer implements IDialogRenderer {
  protected static inject = [IPlatform, IDialogController];

  private wrapper!: HTMLElement;
  private overlay!: HTMLElement;
  private created: boolean;

  private _host?: HTMLElement;
  public get host(): HTMLElement {
    return this._host ??= this.p.document.createElement('div');
  }

  public constructor(
    private readonly p: IPlatform,
    public readonly controller: DialogController,
  ) {
    this.created = false;
  }

  public attaching(): void | Promise<Animation> {
    if (!this.created) {
      const settings = this.controller.settings;
      const doc = this.p.document;
      const h = (name: string) => doc.createElement(name);
      if (settings.host == null) {
        (this.wrapper = doc.body.appendChild(h('au-dialog-container'))).appendChild(this.host);
        this.overlay = doc.body.appendChild(h('au-dialog-overlay'));
      } else {
        settings.host.appendChild(this.host);
      }
      this.created = true;
    }
    const { animation, ignoreTransitions } = this.controller.settings;
    return this.animate(animation?.attaching, ignoreTransitions);
  }

  public attached(): void | Promise<Animation> {
    const { animation, ignoreTransitions } = this.controller.settings;
    return this.animate(animation?.attached, ignoreTransitions);
  }

  public detaching(): void | Promise<Animation> {
    const { animation, ignoreTransitions } = this.controller.settings;
    return this.animate(animation?.detaching, ignoreTransitions);
  }

  public detached(): void | Promise<Animation> {
    const { animation, ignoreTransitions } = this.controller.settings;
    return onResolve(
      this.animate(animation?.detached, ignoreTransitions),
      animation => {
        this.wrapper?.remove();
        this.overlay?.remove();
        return animation;
      }
    ) as void | Promise<Animation>;
  }

  private animate(params?: Parameters<Element['animate']>, doNotWait?: boolean): void | Promise<Animation> {
    if (params != null) {
      const animation = this.host.animate(...params);
      if (!doNotWait) {
        return animation.finished;
      }
    }
  }
}
