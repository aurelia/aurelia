import { IContainer, Registration } from '@aurelia/kernel';
import {
  AdoptedStyleSheetsStyleManager,
  IShadowDOMStyleManager,
  StyleElementStyleManager
} from './shadow-dom-styles';

export function adoptedStyleSheetsSupported(): boolean {
  return 'adoptedStyleSheets' in ShadowRoot.prototype;
}

export class ShadowDOMRegistry {
  private useAdoptedStyleSheets: boolean;

  constructor(private parent: IShadowDOMStyleManager) {
    this.useAdoptedStyleSheets = adoptedStyleSheetsSupported();
  }

  public register(container: IContainer, ...params: any[]) {
    container.register(
      Registration.instance(
        IShadowDOMStyleManager,
        this.useAdoptedStyleSheets
          ? new AdoptedStyleSheetsStyleManager(params, this.parent)
          : new StyleElementStyleManager(params, this.parent)
      )
    );
  }
}
