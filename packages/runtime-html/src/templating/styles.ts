import { IContainer, createLookup, noop, own, resolve, toArray } from '@aurelia/kernel';
import { AppTask } from '../app-task';
import { ICssClassMapping } from '../dom';
import { IPlatform } from '../platform';
import { createInterface, instanceRegistration } from '../utilities-di';

import type { IRegistry } from '@aurelia/kernel';
import { ITemplateCompilerHooks, TemplateCompilerHooks } from '@aurelia/template-compiler';
import { objectAssign } from '../utilities';

/**
 * There are 2 implementations of CSS registry: css module registry and shadow dom registry.
 *
 * - CSS registry alters the way class bindings work via altering templates and register interfaces that will alter bindings to class attribute.
 *
 * - Shadow dom registry regisiters some interfaces with the custom element container to handle shadow dom styles.
 * Shadow DOM abtraction summary:
 * CSS registry ---(register)---> IShadowDOMStyleFactory ---(createStyles)---> IShadowDOMStyles ---(applyTo)---> ShadowRoot
 */

/**
 * create a registry to register CSS module handling for a custom element.
 * The resulting registry can be registered as a dependency of a custom element.
 */
export function cssModules(...modules: (Record<string, string>)[]): CSSModulesProcessorRegistry {
  return new CSSModulesProcessorRegistry(modules);
}

export class CSSModulesProcessorRegistry implements IRegistry {
  public constructor(
    private readonly modules: Record<string, string>[],
  ) {}

  public register(container: IContainer): void {
    let existingMapping = container.get(own(ICssClassMapping));
    if (existingMapping == null) {
      container.register(
        instanceRegistration(ICssClassMapping, existingMapping = createLookup()),
      );
    }
    /* istanbul ignore if */
    if (__DEV__) {
      for (const mapping of this.modules) {
        for (const originalClass in mapping) {
          if (originalClass in existingMapping) {
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] CSS class mapping for class "${originalClass}": "${mapping[originalClass]}" is overridden by "${existingMapping[originalClass]}"`);
          }
          existingMapping[originalClass] = mapping[originalClass];
        }
      }
    } else {
      objectAssign(existingMapping, ...this.modules);
    }

    class CompilingHook implements ITemplateCompilerHooks {
      public compiling(template: HTMLElement): void {
        const isTemplate = template.tagName === 'TEMPLATE';
        const container = isTemplate
          ? (template as HTMLTemplateElement).content
          : template;
        const plainClasses = [template, ...toArray(container.querySelectorAll('[class]'))];
        for (const element of plainClasses) {
          const classes = element.getAttributeNode('class')!;
          // we always include container, so there's a case where classes is null
          if (classes == null) {
            continue;
          }
          const newClasses = classes.value.split(/\s+/g).map(x => existingMapping![x] || x).join(' ');
          classes.value = newClasses;
        }
      }
    }

    container.register(TemplateCompilerHooks.define(CompilingHook));
  }
}

/**
 * Creates a registry to register shadow dom styles handling for a custom element.
 * The resulting registry can be registered as a dependency of a custom element.
 */
export function shadowCSS(...css: (string | CSSStyleSheet)[]): ShadowDOMRegistry {
  return new ShadowDOMRegistry(css);
}

export interface IShadowDOMStyleFactory {
  createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}

export const IShadowDOMStyleFactory = /*@__PURE__*/createInterface<IShadowDOMStyleFactory>('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
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

class AdoptedStyleSheetsStylesFactory implements IShadowDOMStyleFactory {
  private readonly p = resolve(IPlatform);
  private readonly cache = new Map<string, CSSStyleSheet>();

  public createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles {
    return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
  }
}

// not really needed nowadays since all browsers support adopted style sheet
// though keep it here for a bit longer before removing
/* istanbul ignore next */
class StyleElementStylesFactory implements IShadowDOMStyleFactory {
  private readonly p = resolve(IPlatform);

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

export const IShadowDOMStyles = /*@__PURE__*/createInterface<IShadowDOMStyles>('IShadowDOMStyles');
export const IShadowDOMGlobalStyles = /*@__PURE__*/createInterface<IShadowDOMStyles>('IShadowDOMGlobalStyles', x => x.instance({ applyTo: noop }));

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
          sheet.replaceSync(x);
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
