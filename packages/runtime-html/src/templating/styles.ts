import { IContainer, noop } from '@aurelia/kernel';
import { AppTask } from '../app-task';
import { INode } from '../dom';
import { getClassesToAdd } from '../observation/class-attribute-accessor';
import { IPlatform } from '../platform';
import { defineAttribute } from '../resources/custom-attribute';
import { createInterface, instanceRegistration } from '../utilities-di';

import type { IRegistry } from '@aurelia/kernel';

export function cssModules(...modules: (Record<string, string>)[]): CSSModulesProcessorRegistry {
  return new CSSModulesProcessorRegistry(modules);
}

export class CSSModulesProcessorRegistry implements IRegistry {
  public constructor(
    private readonly modules: Record<string, string>[],
  ) {}

  public register(container: IContainer): void {
    const classLookup = Object.assign({}, ...this.modules) as Record<string, string>;
    const ClassCustomAttribute = defineAttribute({
      name: 'class',
      bindables: ['value'],
      noMultiBindings: true,
    }, class CustomAttributeClass {
      public static inject: unknown[] = [INode];

      public value!: string;
      public constructor(
        private readonly element: INode<HTMLElement>,
      ) {}

      public binding() {
        this.valueChanged();
      }

      public valueChanged() {
        if (!this.value) {
          this.element.className = '';
          return;
        }

        this.element.className = getClassesToAdd(this.value).map(x => classLookup[x] || x).join(' ');
      }
    });

    container.register(ClassCustomAttribute);
  }
}

export function shadowCSS(...css: (string | CSSStyleSheet)[]): ShadowDOMRegistry {
  return new ShadowDOMRegistry(css);
}

export interface IShadowDOMStyleFactory {
  createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}

export const IShadowDOMStyleFactory = createInterface<IShadowDOMStyleFactory>('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
  if (AdoptedStyleSheetsStyles.supported(handler.get(IPlatform))) {
    return handler.get(AdoptedStyleSheetsStylesFactory);
  }
  return handler.get(StyleElementStylesFactory);
}));

export class ShadowDOMRegistry implements IRegistry {
  public constructor(
    private readonly css: (string | CSSStyleSheet)[],
  ) { }

  public register(container: IContainer): void {
    const sharedStyles = container.get(IShadowDOMGlobalStyles);
    const factory = container.get(IShadowDOMStyleFactory);
    container.register(instanceRegistration(IShadowDOMStyles, factory.createStyles(this.css, sharedStyles)));
  }
}

class AdoptedStyleSheetsStylesFactory {
  public static inject = [IPlatform];
  private readonly cache = new Map<string, CSSStyleSheet>();

  public constructor(private readonly p: IPlatform) {}

  public createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles {
    return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
  }
}

class StyleElementStylesFactory {
  public static inject = [IPlatform];
  public constructor(private readonly p: IPlatform) {}

  public createStyles(localStyles: string[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles {
    return new StyleElementStyles(this.p, localStyles, sharedStyles);
  }
}

type HasAdoptedStyleSheets = ShadowRoot & {
  adoptedStyleSheets: CSSStyleSheet[];
};

export interface IShadowDOMStyles {
  applyTo(shadowRoot: ShadowRoot): void;
}

export const IShadowDOMStyles = createInterface<IShadowDOMStyles>('IShadowDOMStyles');
export const IShadowDOMGlobalStyles = createInterface<IShadowDOMStyles>('IShadowDOMGlobalStyles', x => x.instance({ applyTo: noop }));

export class AdoptedStyleSheetsStyles implements IShadowDOMStyles {
  private readonly styleSheets: CSSStyleSheet[];

  public constructor(
    p: IPlatform,
    localStyles: (string | CSSStyleSheet)[],
    styleSheetCache: Map<string, CSSStyleSheet>,
    private readonly sharedStyles: IShadowDOMStyles | null = null
  ) {
    this.styleSheets = localStyles.map(x => {
      let sheet: CSSStyleSheet | undefined;

      if (x instanceof p.CSSStyleSheet) {
        sheet = x;
      } else {
        sheet = styleSheetCache.get(x);

        if (sheet === void 0) {
          sheet = new p.CSSStyleSheet();
          // eslint-disable-next-line
          (sheet as any).replaceSync(x);
          styleSheetCache.set(x, sheet);
        }
      }

      return sheet;
    });
  }

  public static supported(p: IPlatform): boolean {
    return 'adoptedStyleSheets' in p.ShadowRoot.prototype;
  }

  public applyTo(shadowRoot: HasAdoptedStyleSheets): void {
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
    private readonly p: IPlatform,
    private readonly localStyles: string[],
    private readonly sharedStyles: IShadowDOMStyles | null = null
  ) { }

  public applyTo(shadowRoot: ShadowRoot): void {
    const styles = this.localStyles;
    const p = this.p;

    for (let i = styles.length - 1; i > -1; --i) {
      const element = p.document.createElement('style');
      element.innerHTML = styles[i];
      shadowRoot.prepend(element);
    }

    if (this.sharedStyles !== null) {
      this.sharedStyles.applyTo(shadowRoot);
    }
  }
}

export interface IShadowDOMConfiguration {
  sharedStyles?: (string | CSSStyleSheet)[];
}

export const StyleConfiguration = {
  shadowDOM(config: IShadowDOMConfiguration): IRegistry {
    return AppTask.creating(IContainer, container => {
      if (config.sharedStyles != null) {
        const factory = container.get(IShadowDOMStyleFactory);
        container.register(instanceRegistration(IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
      }
    });
  }
};
