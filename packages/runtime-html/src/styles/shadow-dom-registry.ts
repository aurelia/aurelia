import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import {  IShadowDOMStyles } from './shadow-dom-styles';

export type ShadowDOMStylesFactory =
  (localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null) => IShadowDOMStyles;

export class ShadowDOMRegistry implements IRegistry {
  public constructor(
    private readonly sharedStyles: IShadowDOMStyles,
    private readonly createStyles: ShadowDOMStylesFactory
  ) { }

  public register(container: IContainer, ...params: (string | CSSStyleSheet)[]) {
    container.register(
      Registration.instance(
        IShadowDOMStyles,
        this.createStyles(params, this.sharedStyles)
      )
    );
  }
}
