import { DI, PLATFORM } from '@aurelia/kernel';
import { HTMLDOM } from '../dom';

type HasAdoptedStyleSheets = ShadowRoot & {
  adoptedStyleSheets: CSSStyleSheet[];
};

export const noopShadowDOMStyles = Object.freeze({
  applyTo: PLATFORM.noop
});

export const IShadowDOMStyles =
  DI.createInterface<IShadowDOMStyles>('IShadowDOMStyles').noDefault();

export const IShadowDOMGlobalStyles =
  DI.createInterface<IShadowDOMStyles>('IShadowDOMGlobalStyles')
    .withDefault(x => x.instance(noopShadowDOMStyles));

export interface IShadowDOMStyles {
  applyTo(shadowRoot: ShadowRoot): void;
}

export class AdoptedStyleSheetsStyles implements IShadowDOMStyles {
  private readonly styleSheets: CSSStyleSheet[];

  public constructor(
    dom: HTMLDOM,
    localStyles: (string | CSSStyleSheet)[],
    styleSheetCache: Map<string, CSSStyleSheet>,
    private readonly sharedStyles: IShadowDOMStyles | null = null
  ) {
    this.styleSheets = localStyles.map(x => {
      let sheet: CSSStyleSheet | undefined;

      if (x instanceof dom.CSSStyleSheet) {
        sheet = x;
      } else {
        sheet = styleSheetCache.get(x);

        if (!sheet) {
          sheet = new dom.CSSStyleSheet();
          (sheet as any).replaceSync(x);
          styleSheetCache.set(x, sheet);
        }
      }

      return sheet;
    });
  }

  public static supported(dom: HTMLDOM): boolean {
    return 'adoptedStyleSheets' in dom.ShadowRoot.prototype;
  }

  public applyTo(shadowRoot: HasAdoptedStyleSheets) {
    if (this.sharedStyles !== null) {
      this.sharedStyles.applyTo(shadowRoot);
    }

    // https://wicg.github.io/construct-stylesheets/
    // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
    shadowRoot.adoptedStyleSheets = [
      ...shadowRoot.adoptedStyleSheets,
      ...this.styleSheets
    ];
  }
}

export class StyleElementStyles implements IShadowDOMStyles {
  public constructor(
    private readonly dom: HTMLDOM,
    private readonly localStyles: string[],
    private readonly sharedStyles: IShadowDOMStyles | null = null
  ) { }

  public applyTo(shadowRoot: ShadowRoot) {
    const styles = this.localStyles;
    const dom = this.dom;

    for (let i = styles.length - 1; i > -1; --i) {
      const element = dom.createElement('style');
      element.innerHTML = styles[i];
      shadowRoot.prepend(element);
    }

    if (this.sharedStyles !== null) {
      this.sharedStyles.applyTo(shadowRoot);
    }
  }
}
