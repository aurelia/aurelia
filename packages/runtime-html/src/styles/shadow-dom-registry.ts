import { IContainer, Registration } from '@aurelia/kernel';
import {  IShadowDOMStyleManager } from './shadow-dom-styles';

export function adoptedStyleSheetsSupported(): boolean {
  return 'adoptedStyleSheets' in ShadowRoot.prototype;
}

export type ShadowDOMStyleManagerFactory =
  (styles: string[], parent: IShadowDOMStyleManager | null) => IShadowDOMStyleManager;

export class ShadowDOMRegistry {
  constructor(
    private parent: IShadowDOMStyleManager,
    private factory: ShadowDOMStyleManagerFactory
  ) {
  }

  public register(container: IContainer, ...params: any[]) {
    container.register(
      Registration.instance(
        IShadowDOMStyleManager,
        this.factory(params, this.parent)
      )
    );
  }
}
