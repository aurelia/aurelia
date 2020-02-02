import { IContainer, IRegistry, Registration, DI } from '@aurelia/kernel';
import { IShadowDOMStyles, IShadowDOMGlobalStyles, AdoptedStyleSheetsStyles, StyleElementStyles } from './shadow-dom-styles';
import { HTMLDOM } from '../dom';

export function shadowCSS(...css: (string | CSSStyleSheet)[]) {
  return new ShadowDOMRegistry(css);
}

export interface IShadowDOMStyleFactory {
  createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}

export const IShadowDOMStyleFactory
  = DI.createInterface<IShadowDOMStyleFactory>('IShadowDOMStyleFactory')
    .withDefault(x => x.callback((handler, requestor, resolver: any) => {
      let factory = resolver.styleFactory;

      if (!factory) {
        // cache the lazily created instance on the resolver
        resolver.styleFactory = factory = ShadowDOMRegistry.createStyleFactory(handler!);
      }

      return factory;
    }));

export class ShadowDOMRegistry implements IRegistry {
  public constructor(private css: (string | CSSStyleSheet)[]) { }

  public register(container: IContainer) {
    const sharedStyles = container.get(IShadowDOMGlobalStyles);
    const factory = container.get(IShadowDOMStyleFactory);

    container.register(
      Registration.instance(
        IShadowDOMStyles,
        factory.createStyles(this.css, sharedStyles)
      )
    );
  }

  public static createStyleFactory(container: IContainer): IShadowDOMStyleFactory {
    const dom = container.get(HTMLDOM);

    if (AdoptedStyleSheetsStyles.supported(dom)) {
      const styleSheetCache = new Map();

      return {
        createStyles(localStyles, sharedStyles) {
          return new AdoptedStyleSheetsStyles(
            dom,
            localStyles,
            styleSheetCache,
            sharedStyles
          );
        }
      }
    }

    return {
      createStyles(localStyles, sharedStyles) {
        if (localStyles.some(x => typeof x !== 'string')) {
          // TODO: use reporter
          throw new Error('Shadow DOM CSS must be a string.');
        }

        return new StyleElementStyles(
          dom,
          localStyles as string[],
          sharedStyles
        );
      }
    };
  }
}
