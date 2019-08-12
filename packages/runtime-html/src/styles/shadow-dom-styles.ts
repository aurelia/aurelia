import { DI, PLATFORM } from '@aurelia/kernel';

type HasAdoptedStyleSheets = ShadowRoot & {
  adoptedStyleSheets: CSSStyleSheet[];
};

export const noopShadowDOMStyleManager = Object.freeze({
  applyTo: PLATFORM.noop
});

export const IShadowDOMStyleManager =
  DI.createInterface<IShadowDOMStyleManager>('IShadowDOMStyleManager')
    .withDefault(x => x.instance(noopShadowDOMStyleManager));

export interface IShadowDOMStyleManager {
  applyTo(shadowRoot: ShadowRoot): void;
}

export class AdoptedStyleSheetsStyleManager implements IShadowDOMStyleManager {
  private readonly styleSheets: CSSStyleSheet[];

  constructor(
    styles: string[],
    cache: Map<string, CSSStyleSheet>,
    private parent: IShadowDOMStyleManager | null = null
  ) {
    this.styleSheets = styles.map(x => {
      let sheet = cache.get(x);

      if (!sheet) {
        sheet = new CSSStyleSheet();
        (sheet as any).replaceSync(x);
        cache.set(x, sheet);
      }

      return sheet;
    });
  }

  public applyTo(shadowRoot: HasAdoptedStyleSheets) {
    if (this.parent !== null) {
      this.parent.applyTo(shadowRoot);
    }

    // https://wicg.github.io/construct-stylesheets/
    // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
    shadowRoot.adoptedStyleSheets = [
      ...shadowRoot.adoptedStyleSheets,
      ...this.styleSheets
    ];
  }
}

export class StyleElementStyleManager implements IShadowDOMStyleManager {
  constructor(
    private styles: string[],
    private parent: IShadowDOMStyleManager | null = null
  ) {}

  public applyTo(shadowRoot: ShadowRoot) {
    const styles = this.styles;

    for (let i = styles.length - 1; i > -1; --i) {
      const element = document.createElement('style');
      element.innerHTML = styles[i];
      shadowRoot.prepend(element);
    }

    if (this.parent !== null) {
      this.parent.applyTo(shadowRoot);
    }
  }
}
