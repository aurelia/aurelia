import { IContainer, IRegistry, Registration, DI, IResolver } from '@aurelia/kernel';
import { IPlatform } from '../platform';
import { IShadowDOMStyles, IShadowDOMGlobalStyles, AdoptedStyleSheetsStyles, StyleElementStyles } from './shadow-dom-styles';

export function shadowCSS(...css: (string | CSSStyleSheet)[]) {
  return new ShadowDOMRegistry(css);
}

export interface IShadowDOMStyleFactory {
  createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}

const factoryCache = new WeakMap<IResolver, IShadowDOMStyleFactory>();
export const IShadowDOMStyleFactory
  = DI.createInterface<IShadowDOMStyleFactory>('IShadowDOMStyleFactory')
    .withDefault(x => x.callback((handler, requestor, resolver) => {
      let factory = factoryCache.get(resolver);

      if (factory === void 0) {
        factoryCache.set(
          resolver,
          factory = ShadowDOMRegistry.createStyleFactory(handler)
        );
      }

      return factory;
    }));

export class ShadowDOMRegistry implements IRegistry {
  public constructor(
    private readonly css: (string | CSSStyleSheet)[],
  ) { }

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
    if (AdoptedStyleSheetsStyles.supported(container.get(IPlatform))) {
      return container.get(AdoptedStyleSheetsStylesFactory);
    }

    return container.get(StyleElementStylesFactory);
  }
}

class AdoptedStyleSheetsStylesFactory {
  private readonly cache = new Map();

  public constructor(@IPlatform private readonly p: IPlatform) {}

  public createStyles(
    localStyles: (string | CSSStyleSheet)[],
    sharedStyles: IShadowDOMStyles | null,
  ): IShadowDOMStyles {
    return new AdoptedStyleSheetsStyles(
      this.p,
      localStyles,
      this.cache,
      sharedStyles,
    );
  }
}

class StyleElementStylesFactory {
  public constructor(@IPlatform private readonly p: IPlatform) {}

  public createStyles(
    localStyles: string[],
    sharedStyles: IShadowDOMStyles | null,
  ): IShadowDOMStyles {
    return new StyleElementStyles(
      this.p,
      localStyles,
      sharedStyles,
    );
  }
}
